#!/usr/bin/env python3
import argparse
import datetime as dt
import html
import json
import re
import subprocess
import time
import urllib.parse
from pathlib import Path


BASE = "https://t.me"
CHANNEL = "pravo_pp"
CHANNEL_NAME = "Право первой помощи"
MOSCOW = dt.timezone(dt.timedelta(hours=3))
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"


TOPIC_KEYWORDS = {
    "Организационно-правовые аспекты": [
        "первая помощь", "первой помощи", "323-фз", "220н", "обязан", "обязанность",
        "право", "закон", "порядок оказания", "согласие", "отказ", "медицинская помощь",
    ],
    "Ответственность и пределы действий": [
        "ответственность", "вред", "крайн", "необходим", "39 ук", "1067",
        "оставление в опасности", "125 ук", "причинение вреда", "суд", "накажут",
    ],
    "ДТП и водитель": [
        "дтп", "пдд", "водител", "автомоб", "извлеч", "транспорт", "103", "112",
    ],
    "Аптечки и комплектование": [
        "аптеч", "260н", "262н", "комплект", "состав", "медицинские изделия",
    ],
    "Неотложные состояния и мероприятия": [
        "неотлож", "состояни", "кровотеч", "слр", "реанимац", "дыхани", "судорож",
        "отравлен", "ожог", "травм", "сердц", "инородн", "пострадавш",
    ],
    "Военная рамка и тактическая медицина": [
        "военнослуж", "оборон", "61-фз", "760", "340", "самопомощ", "взаимопомощ",
        "тактическ", "ранен", "боевая травма", "боевых действий",
    ],
    "Алгоритмы и зоны": [
        "s-march", "march", "кулак", "барин", "красная зона", "желтая зона",
        "жёлтая зона", "зеленая зона", "зелёная зона",
    ],
}


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


def fetch(url: str) -> str:
    result = subprocess.run(
        ["curl", "-L", "--fail", "--silent", "--show-error", "-A", UA, url],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return result.stdout.decode("utf-8", errors="ignore")


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


def extract_links(block: str) -> list[dict]:
    links = []
    seen = set()
    for match in re.finditer(r'<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>', block, flags=re.S):
        href = html.unescape(match.group(1))
        label = strip_tags(match.group(2))
        if not href or href.startswith("?q=") or href.startswith("/"):
            continue
        key = (href, label)
        if key in seen:
            continue
        seen.add(key)
        links.append({"href": href, "label": label})
    return links


def parse_posts(html_text: str) -> list[dict]:
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
        when_utc = dt.datetime.fromisoformat(dt_match.group(1).replace("Z", "+00:00"))
        when_msk = when_utc.astimezone(MOSCOW)
        texts = extract_texts(block)
        text = "\n\n".join(texts).strip()
        photo_count = len(re.findall(r"tgme_widget_message_photo", block))
        video_count = len(re.findall(r"tgme_widget_message_video", block))
        posts.append(
            {
                "channel": CHANNEL,
                "channel_name": CHANNEL_NAME,
                "data_post": data_post,
                "post_url": f"{BASE}/{data_post}",
                "datetime_utc": when_utc.isoformat(),
                "datetime_msk": when_msk.isoformat(),
                "date_msk": when_msk.date().isoformat(),
                "text": text,
                "links": extract_links(block),
                "photo_count": photo_count,
                "video_count": video_count,
            }
        )
    return posts


def rel_prev(html_text: str) -> str | None:
    match = re.search(r'<link rel="prev" href="([^"]+)"', html_text)
    if not match:
        match = re.search(r'<a href="([^"]+)" class="tme_messages_more js-messages_more"', html_text)
    if not match:
        return None
    href = html.unescape(match.group(1))
    if href.startswith("http"):
        return href
    return urllib.parse.urljoin(BASE, href)


def classify(post: dict) -> tuple[list[str], int]:
    blob = f"{post['text']}\n{post['post_url']}".lower().replace("ё", "е")
    topics = []
    score = 0
    for topic, words in TOPIC_KEYWORDS.items():
        hits = [word for word in words if word.lower().replace("ё", "е") in blob]
        if hits:
            topics.append(topic)
            score += min(8, len(hits)) + (4 if topic == "Организационно-правовые аспекты" else 0)
    if len(post["text"]) < 25:
        score -= 4
    return topics, score


def collect(start: dt.date, end: dt.date, out_dir: Path, max_pages: int, delay: float) -> tuple[list[dict], list[dict]]:
    raw_dir = out_dir / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    url = f"{BASE}/s/{CHANNEL}"
    seen_urls = set()
    all_posts = []
    for page_index in range(1, max_pages + 1):
        if not url or url in seen_urls:
            break
        seen_urls.add(url)
        html_text = fetch(url)
        (raw_dir / f"{CHANNEL}_{page_index:03d}.html").write_text(html_text, encoding="utf-8")
        posts = parse_posts(html_text)
        page_dates = [dt.date.fromisoformat(p["date_msk"]) for p in posts]
        for post in posts:
            post_date = dt.date.fromisoformat(post["date_msk"])
            if start <= post_date <= end:
                all_posts.append(post)
        if page_dates and min(page_dates) < start:
            break
        url = rel_prev(html_text)
        time.sleep(delay)

    deduped = {post["data_post"]: post for post in all_posts}
    posts = sorted(deduped.values(), key=lambda p: p["datetime_msk"])
    candidates = []
    for post in posts:
        topics, score = classify(post)
        if topics and score >= 2:
            enriched = dict(post)
            enriched["topics"] = topics
            enriched["score"] = score
            candidates.append(enriched)
    candidates.sort(key=lambda p: (-p["score"], p["datetime_msk"]))
    return posts, candidates


def write_outputs(posts: list[dict], candidates: list[dict], out_dir: Path, start: str, end: str) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "pravo_pp_posts_2026.json").write_text(
        json.dumps(posts, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (out_dir / "pravo_pp_lesson_candidates.json").write_text(
        json.dumps(candidates, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    lines = [
        "# Кандидаты из канала Право первой помощи",
        "",
        f"Период: {start} - {end}, даты по Москве.",
        f"Всего постов за период: {len(posts)}.",
        f"Кандидатов по теме занятия: {len(candidates)}.",
        "",
    ]
    for post in candidates:
        text = re.sub(r"\s+", " ", post["text"]).strip()
        lines.append(f"## {post['date_msk']} — {post['data_post']}")
        lines.append(f"- Link: {post['post_url']}")
        lines.append(f"- Topics: {', '.join(post['topics'])}")
        lines.append(f"- Score: {post['score']}")
        if post["links"]:
            lines.append("- Links:")
            for link in post["links"][:10]:
                lines.append(f"  - {link['label'] or link['href']}: {link['href']}")
        lines.append("")
        lines.append(text[:1600] + ("..." if len(text) > 1600 else ""))
        lines.append("")
    (out_dir / "pravo_pp_lesson_candidates.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", default="2026-01-01")
    parser.add_argument("--end", default="2026-09-05")
    parser.add_argument("--out-dir", default="research/pravo_pp_lesson_2026-09-05")
    parser.add_argument("--max-pages", type=int, default=80)
    parser.add_argument("--delay", type=float, default=0.25)
    args = parser.parse_args()
    posts, candidates = collect(
        dt.date.fromisoformat(args.start),
        dt.date.fromisoformat(args.end),
        Path(args.out_dir),
        args.max_pages,
        args.delay,
    )
    write_outputs(posts, candidates, Path(args.out_dir), args.start, args.end)
    print(f"Collected {len(posts)} posts; found {len(candidates)} candidates.")


if __name__ == "__main__":
    main()
