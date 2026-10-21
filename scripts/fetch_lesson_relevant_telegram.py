#!/usr/bin/env python3
import argparse
import datetime as dt
import hashlib
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


CHANNELS = {
    "TacMedRS": "ТакМед по-русски",
    "operator13zov": "OPERATOR 13",
    "KGV5mg": "5 мг. КГВ.",
    "HealerTacMed": "ХИЛЕР | HEALER",
    "PolarSrtar29": "Говорит 29й",
    "tacmedpro": "ПРО ТАКМЕД",
    "uctm_official": "УЦТМ. Первая помощь и тактическая медицина",
    "okspn": "Канал специального назначения",
    "army_dock": "Вмп/тактическая медицина",
    "kpp51": "Первая помощь | Тактическая медицина",
    "Dr_Livsi_Ru": "Dr.Livsi",
    "pravo_pp": "Право первой помощи",
}


QUERIES = [
    "первая помощь",
    "право",
    "обязан",
    "ответственность",
    "ДТП",
    "извлечение",
    "СЛР",
    "реанимация",
    "остановка сердца",
    "дыхание",
    "без сознания",
    "инородное тело",
    "судороги",
    "отравление",
    "ожог",
    "утопление",
    "кровотечение",
    "массивное кровотечение",
    "турникет",
    "жгут",
    "тампонада",
    "гемостатик",
    "пневмоторакс",
    "окклюзионная",
    "гипотермия",
    "шок",
    "аптечка",
    "IFAK",
    "АППИ",
    "групповая аптечка",
    "S-MARCH",
    "SMARCH",
    "MARCH",
    "PAWS",
    "КУЛАК",
    "БАРИН",
    "алгоритм",
    "TCCC",
    "красная зона",
    "желтая зона",
    "жёлтая зона",
    "зеленая зона",
    "зелёная зона",
    "укрытие",
    "эвакуация",
    "БПЛА",
    "дрон",
    "обстрел",
    "носилки",
    "самопомощь",
]


TOPIC_RULES = {
    "1. Понятие первой помощи": [
        "первая помощь",
        "220н",
        "323",
        "минздрав",
        "обучен",
        "навык",
        "медицинская помощь",
    ],
    "2. Состояния, требующие первой помощи": [
        "слр",
        "реанима",
        "остановка сердца",
        "остановка дых",
        "дыхани",
        "без созн",
        "инород",
        "судорог",
        "отрав",
        "ожог",
        "утоп",
        "кровотеч",
        "психолог",
        "стресс",
    ],
    "3. Организационно-правовые аспекты": [
        "прав",
        "обязан",
        "ответствен",
        "дтп",
        "водител",
        "извлеч",
        "соглас",
        "отказ",
        "самооборон",
        "оруж",
        "полици",
        "следств",
    ],
    "4. Основные причины смерти при боевой травме": [
        "кровотеч",
        "турникет",
        "жгут",
        "тампонад",
        "гемостат",
        "пневмоторакс",
        "окклюзи",
        "асфикс",
        "дыхатель",
        "гипотерм",
        "шок",
        "ранен",
        "травм",
    ],
    "5. Комплектование индивидуальных и групповых аптечек": [
        "аптеч",
        "ifak",
        "аппи",
        "группов",
        "индивидуаль",
        "турникет",
        "жгут",
        "гемостат",
        "окклюзи",
        "ножниц",
        "подсум",
        "bvm",
        "воздуховод",
        "декомпресс",
    ],
    "6. Алгоритмы S-MARCH/PAWS и КУЛАК-БАРИН": [
        "s-march",
        "smarch",
        "march",
        "paws",
        "кулак",
        "барин",
        "алгоритм",
        "tccc",
        "протокол",
    ],
    "7. Условные зоны и объем помощи": [
        "красн",
        "желт",
        "жёлт",
        "зелен",
        "зелён",
        "укрыти",
        "эвакуац",
        "обстрел",
        "бпла",
        "дрон",
        "зона",
        "самопомощ",
    ],
    "Сценарии для проговаривания": [
        "дтп",
        "машин",
        "транспорт",
        "слр",
        "реанима",
        "тротуа",
        "улиц",
        "обстрел",
        "дрон",
        "бпла",
        "эвакуац",
        "носил",
        "ранен",
        "самопомощ",
        "пожар",
    ],
}


NEGATIVE = re.compile(
    r"сбор|донат|реквизит|розыгрыш|мерч|купить|скидк|курс|запись на курс|"
    r"ваканси|ищем|поздрав|репост|канал|подпис",
    re.I,
)


MOSCOW = dt.timezone(dt.timedelta(hours=3))


def strip_tags(fragment: str) -> str:
    fragment = re.sub(r"<br\s*/?>", "\n", fragment, flags=re.I)
    fragment = re.sub(r"</p\s*>", "\n", fragment, flags=re.I)
    fragment = re.sub(r"</div\s*>", "\n", fragment, flags=re.I)
    fragment = re.sub(r"<blockquote[^>]*>", "\n", fragment, flags=re.I)
    fragment = re.sub(r"</blockquote\s*>", "\n", fragment, flags=re.I)
    fragment = re.sub(r"<[^>]+>", "", fragment)
    text = html.unescape(fragment)
    text = re.sub(r"[ \t\r\f\v]+", " ", text)
    text = re.sub(r"\n\s+", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_texts(block: str) -> list[str]:
    texts = []
    for match in re.finditer(
        r'<div class="tgme_widget_message_text js-message_text"[^>]*>(.*?)</div>',
        block,
        flags=re.S,
    ):
        text = strip_tags(match.group(1))
        if text and text not in texts:
            texts.append(text)
    return texts


def extract_documents(block: str) -> list[dict]:
    docs = []
    wraps = re.findall(
        r'<a class="tgme_widget_message_document_wrap" href="([^"]+)">(.*?)</a>',
        block,
        flags=re.S,
    )
    for href, inner in wraps:
        title_match = re.search(
            r'<div class="tgme_widget_message_document_title[^"]*"[^>]*>(.*?)</div>',
            inner,
            flags=re.S,
        )
        extra_match = re.search(
            r'<div class="tgme_widget_message_document_extra[^"]*"[^>]*>(.*?)</div>',
            inner,
            flags=re.S,
        )
        docs.append(
            {
                "title": strip_tags(title_match.group(1)) if title_match else "",
                "extra": strip_tags(extra_match.group(1)) if extra_match else "",
                "href": html.unescape(href),
            }
        )
    return docs


def parse_html(html_text: str, fallback_channel: str) -> list[dict]:
    parts = re.split(
        r'<div class="tgme_widget_message[^"]* js-widget_message"[^>]*data-post="([^"]+)"[^>]*>',
        html_text,
    )
    posts = []
    for i in range(1, len(parts), 2):
        data_post = parts[i]
        block = parts[i + 1]
        dt_match = re.search(r'<time datetime="([^"]+)"', block)
        if not dt_match:
            continue
        channel = data_post.split("/", 1)[0] if "/" in data_post else fallback_channel
        when_utc = dt.datetime.fromisoformat(dt_match.group(1).replace("Z", "+00:00"))
        when_msk = when_utc.astimezone(MOSCOW)
        text = "\n\n".join(extract_texts(block)).strip()
        posts.append(
            {
                "channel": channel,
                "channel_name": CHANNELS.get(channel, channel),
                "data_post": data_post,
                "post_url": f"https://t.me/{data_post}",
                "datetime_utc": when_utc.isoformat(),
                "datetime_msk": when_msk.isoformat(),
                "date_msk": when_msk.date().isoformat(),
                "text": text,
                "documents": extract_documents(block),
                "photo_count": len(re.findall(r"tgme_widget_message_photo", block)),
                "video_count": len(re.findall(r"tgme_widget_message_video", block)),
            }
        )
    return posts


def fetch(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
            )
        },
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def filename_for(channel: str, query: str | None) -> str:
    if query is None:
        return f"{channel}__recent.html"
    digest = hashlib.sha1(query.encode("utf-8")).hexdigest()[:10]
    slug = re.sub(r"[^A-Za-z0-9А-Яа-яЁё]+", "_", query).strip("_")[:40]
    return f"{channel}__q_{slug}_{digest}.html"


def score_post(post: dict, topic: str, needles: list[str]) -> int:
    haystack = " ".join(
        [
            post.get("text", ""),
            " ".join(d.get("title", "") for d in post.get("documents", [])),
        ]
    ).lower()
    score = 0
    for n in needles:
        if n.lower() in haystack:
            score += 3 if len(n) > 5 else 2
    if post.get("photo_count") or post.get("video_count"):
        score += 1
    if post.get("documents"):
        score += 1
    if re.search(r"разбор|случай|кейс|пример|ошибк|практик|ранен|пострадав|видео", haystack):
        score += 2
    if NEGATIVE.search(haystack):
        score -= 2
    if topic.startswith("3.") and post.get("channel") == "pravo_pp":
        score += 4
    if topic.startswith("1.") and post.get("channel") == "pravo_pp":
        score += 3
    return score


def summarize_for_markdown(post: dict) -> str:
    text = " ".join((post.get("text") or "").split())
    docs = "; ".join(d.get("title", "") for d in post.get("documents", []) if d.get("title"))
    if docs:
        text = f"{text} Документы: {docs}".strip()
    return text[:900]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--sleep", type=float, default=0.15)
    parser.add_argument("--use-cache", action="store_true")
    parser.add_argument("--include-local-html", action="append", default=[])
    parser.add_argument("--include-json", action="append", default=[])
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    raw_dir = out_dir / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)

    all_posts = []
    errors = []

    for channel in CHANNELS:
        pages = [(None, f"https://t.me/s/{channel}")]
        pages.extend(
            (query, f"https://t.me/s/{channel}?q={urllib.parse.quote(query)}")
            for query in QUERIES
        )
        for query, url in pages:
            raw_path = raw_dir / filename_for(channel, query)
            try:
                if args.use_cache and raw_path.exists():
                    html_text = raw_path.read_text(encoding="utf-8", errors="ignore")
                else:
                    html_text = fetch(url)
                    raw_path.write_text(html_text, encoding="utf-8")
                    time.sleep(args.sleep)
                all_posts.extend(parse_html(html_text, channel))
            except (urllib.error.URLError, TimeoutError, OSError) as exc:
                errors.append({"channel": channel, "query": query, "url": url, "error": str(exc)})

    for local in args.include_local_html:
        for path in Path(local).glob("*.html"):
            try:
                channel = path.stem.split("__", 1)[0]
                all_posts.extend(parse_html(path.read_text(encoding="utf-8", errors="ignore"), channel))
            except OSError as exc:
                errors.append({"path": str(path), "error": str(exc)})

    for json_path in args.include_json:
        path = Path(json_path)
        if path.exists():
            try:
                all_posts.extend(json.loads(path.read_text(encoding="utf-8")))
            except (OSError, json.JSONDecodeError) as exc:
                errors.append({"path": str(path), "error": str(exc)})

    deduped = {}
    for post in all_posts:
        if not post.get("text") and not post.get("documents"):
            continue
        deduped[post["data_post"]] = post
    posts = sorted(deduped.values(), key=lambda p: (p.get("datetime_msk", ""), p.get("data_post", "")), reverse=True)

    topic_hits = {}
    for topic, needles in TOPIC_RULES.items():
        hits = []
        for post in posts:
            score = score_post(post, topic, needles)
            if score >= 3:
                item = dict(post)
                item["score"] = score
                hits.append(item)
        hits.sort(key=lambda p: (p["score"], p.get("datetime_msk", "")), reverse=True)
        topic_hits[topic] = hits[:80]

    (out_dir / "all_posts.json").write_text(json.dumps(posts, ensure_ascii=False, indent=2), encoding="utf-8")
    (out_dir / "topic_candidates.json").write_text(json.dumps(topic_hits, ensure_ascii=False, indent=2), encoding="utf-8")
    (out_dir / "fetch_errors.json").write_text(json.dumps(errors, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        "# Кандидаты постов по темам занятия",
        "",
        f"Собрано уникальных постов: {len(posts)}",
        f"Ошибок загрузки: {len(errors)}",
        "",
    ]
    for topic, hits in topic_hits.items():
        lines.append(f"## {topic}")
        lines.append("")
        for post in hits[:30]:
            media = []
            if post.get("photo_count"):
                media.append(f"{post['photo_count']} фото")
            if post.get("video_count"):
                media.append(f"{post['video_count']} видео")
            if post.get("documents"):
                media.append(f"{len(post['documents'])} файл.")
            media_s = f" ({', '.join(media)})" if media else ""
            lines.append(
                f"- {post['date_msk']} | {post['channel_name']} | score {post['score']} | "
                f"{post['post_url']}{media_s}"
            )
            lines.append(f"  {summarize_for_markdown(post)}")
        lines.append("")
    (out_dir / "topic_candidates.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"posts={len(posts)} topics={len(topic_hits)} errors={len(errors)} out={out_dir}")


if __name__ == "__main__":
    main()
