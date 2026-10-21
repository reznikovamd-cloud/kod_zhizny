#!/usr/bin/env python3
import argparse
import csv
import datetime as dt
import html
import json
import re
import subprocess
import time
import urllib.parse
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

MOSCOW = dt.timezone(dt.timedelta(hours=3))
BASE = "https://t.me"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"


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
                "size": strip_tags(extra_match.group(1)) if extra_match else "",
                "url": html.unescape(href),
            }
        )
    return docs


def parse_posts(html_text: str, channel: str) -> list[dict]:
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
        posts.append(
            {
                "channel": channel,
                "channel_name": CHANNELS.get(channel, channel),
                "data_post": data_post,
                "post_url": f"{BASE}/{data_post}",
                "datetime_msk": when_msk.isoformat(),
                "date_msk": when_msk.date().isoformat(),
                "text": "\n\n".join(extract_texts(block)).strip(),
                "documents": extract_documents(block),
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


def clean_filename_part(text: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", text).strip("_") or "page"


def category_for(title: str, text: str) -> str:
    blob = f"{title}\n{text}".lower()
    if any(x in blob for x in ["jsom", "journal special operations medicine", "mass casualty", "mass_casualty", "soma", "crush syndrome", "sanitary losses", "санитарных_потерь", "санитарных потерь"]):
        return "Научные статьи / журналы / разборы"
    if any(x in blob for x in ["реабил"]):
        return "Реабилитация"
    if any(x in blob for x in ["инфекцион", "биооруж", "биобезопас", "рбав"]):
        return "Инфекции / биобезопасность"
    if any(x in blob for x in ["fm_3-08", "fm 3-08", "medical service", "army health", "эвакуац", "casualty evacuation"]):
        return "Организация медслужбы / эвакуация"
    if any(x in blob for x in ["tccc", "ctecc", "ranger", "pfc", "dcr", "combat", "tactical", "тактич", "отм", "otm", "имс", "светофор", "sevt", "karta 300", "rukovodstvo"]):
        return "Тактическая медицина / протоколы"
    if any(x in blob for x in ["первая_помощ", "первая помощь", "firstaid", "first aid", "слр", "реанимац", "кровотеч", "закупорк", "извлеч", "перемещ", "положение тела", "травм"]):
        return "Первая помощь / базовые алгоритмы"
    if any(x in blob for x in ["впх", "хирург", "раны", "рана", "wound", "surgery", "ранен"]):
        return "Военно-полевая хирургия / раны"
    if any(x in blob for x in ["анатом", "лаборатор", "analget", "анальг", "лекар", "фарм", "нормы", "кровообращ"]):
        return "Анатомия / лекарства / диагностика"
    if any(x in blob for x in ["сон", "психолог"]):
        return "Психология / сон / восстановление"
    if any(x in blob for x in ["uav", "бпла", "drone", "дрон"]):
        return "Смежное: БПЛА / безопасность / угрозы"
    if any(x in blob for x in ["бронепан", "бронеплит", "сиб головы", "шлем", "fire resistant", "fireresistant", "негорюч", "масккостюм", "маскиров", "кб мис", "kb mis"]):
        return "Смежное: защита / снаряжение"
    if any(x in blob for x in ["deck", "презентац", "карты", "glossar", "глоссар"]):
        return "Учебные презентации / справочные карты"
    if any(x in blob for x in ["правовое", "приказ", "авиа", "воздуш", "гражданск"]):
        return "Гражданская первая помощь / право"
    return "Проверить вручную"


def scope_for(title: str, text: str, category: str) -> tuple[str, str]:
    blob = f"{title}\n{text}".lower()
    noise = [
        "песня", "альбом", "ремикс", "не режь себе крылья", "слёзы матерей",
        "мр-155", "гладкостволь", "ружья", "ружье", "ussocom fact",
    ]
    if any(x in blob for x in noise):
        return "exclude", "Нерелевантно медицинской библиотеке."

    if category.startswith("Смежное:"):
        return "adjacent", "Смежный материал: полезен для контекста угроз/снаряжения, но не ядро медицинской библиотеки."
    if category == "Проверить вручную":
        return "needs_review", "PDF найден, но по названию/подписи нужна ручная проверка содержания."
    return "core", "Образовательный медицинский материал по названию/подписи."


def normalize_title(title: str) -> str:
    text = html.unescape(title).lower()
    text = text.replace("ё", "е")
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[_\-.]+", " ", text)
    text = re.sub(r"\(\d+\)", "", text)
    text = re.sub(r"\bcopy\b", "", text)
    text = re.sub(r"\bpdf\b", "", text)
    return re.sub(r"\s+", " ", text).strip()


def collect(start: dt.date, end: dt.date, raw_dir: Path, delay: float) -> list[dict]:
    raw_dir.mkdir(parents=True, exist_ok=True)
    all_items: list[dict] = []

    for channel in CHANNELS:
        seen_urls = set()
        url = f"{BASE}/s/{channel}?q={urllib.parse.quote('.pdf')}"
        page_index = 0
        while url and url not in seen_urls and page_index < 20:
            seen_urls.add(url)
            page_index += 1
            html_text = fetch(url)
            raw_path = raw_dir / f"{channel}__pdf_search_{page_index:02d}.html"
            raw_path.write_text(html_text, encoding="utf-8")
            posts = parse_posts(html_text, channel)
            page_dates = [dt.date.fromisoformat(p["date_msk"]) for p in posts]
            for post in posts:
                post_date = dt.date.fromisoformat(post["date_msk"])
                if not (start <= post_date <= end):
                    continue
                for doc in post["documents"]:
                    if not doc["title"].lower().endswith(".pdf"):
                        continue
                    category = category_for(doc["title"], post["text"])
                    scope, relevance_note = scope_for(doc["title"], post["text"], category)
                    all_items.append(
                        {
                            "date": post["date_msk"],
                            "datetime_msk": post["datetime_msk"],
                            "channel": channel,
                            "channel_name": post["channel_name"],
                            "post": post["post_url"],
                            "file_url": doc["url"],
                            "title": doc["title"],
                            "size": doc["size"],
                            "category": category,
                            "scope": scope,
                            "note": relevance_note,
                            "context": re.sub(r"\s+", " ", post["text"])[:420],
                        }
                    )

            prev = rel_prev(html_text)
            if not prev:
                break
            if page_dates and min(page_dates) < start:
                break
            url = prev
            time.sleep(delay)

    deduped = {}
    for item in all_items:
        key = (item["file_url"], normalize_title(item["title"]), item["size"])
        deduped[key] = item
    return sorted(deduped.values(), key=lambda x: (x["category"], x["date"], x["channel_name"], x["title"]))


def unique_materials(items: list[dict]) -> list[dict]:
    priority = {"core": 0, "needs_review": 1, "adjacent": 2, "exclude": 3}
    grouped: dict[tuple[str, str], dict] = {}
    for item in items:
        key = (normalize_title(item["title"]), item["size"])
        source = {
            "date": item["date"],
            "channel_name": item["channel_name"],
            "post": item["post"],
            "file_url": item["file_url"],
        }
        existing = grouped.get(key)
        if existing is None:
            grouped[key] = {
                "title": item["title"],
                "size": item["size"],
                "first_seen": item["date"],
                "last_seen": item["date"],
                "category": item["category"],
                "scope": item["scope"],
                "note": item["note"],
                "contexts": [item["context"]] if item["context"] else [],
                "sources": [source],
            }
            continue

        existing["first_seen"] = min(existing["first_seen"], item["date"])
        existing["last_seen"] = max(existing["last_seen"], item["date"])
        if priority[item["scope"]] < priority[existing["scope"]]:
            existing["scope"] = item["scope"]
            existing["category"] = item["category"]
            existing["note"] = item["note"]
        if item["context"] and item["context"] not in existing["contexts"]:
            existing["contexts"].append(item["context"])
        if source not in existing["sources"]:
            existing["sources"].append(source)

    return sorted(
        grouped.values(),
        key=lambda item: (priority[item["scope"]], item["category"], item["first_seen"], item["title"]),
    )


def write_outputs(items: list[dict], out_dir: Path, start: str, end: str) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    all_json_path = out_dir / f"takmed_pdf_mentions_all_{start}_{end}.json"
    all_csv_path = out_dir / f"takmed_pdf_mentions_all_{start}_{end}.csv"
    curated_json_path = out_dir / f"takmed_pdf_materials_curated_{start}_{end}.json"
    curated_csv_path = out_dir / f"takmed_pdf_materials_curated_{start}_{end}.csv"
    curated_md_path = out_dir / f"takmed_pdf_materials_curated_{start}_{end}.md"
    core_json_path = out_dir / f"takmed_pdf_materials_core_{start}_{end}.json"
    core_csv_path = out_dir / f"takmed_pdf_materials_core_{start}_{end}.csv"
    core_md_path = out_dir / f"takmed_pdf_materials_core_{start}_{end}.md"

    all_json_path.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    with all_csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "date", "scope", "category", "title", "size",
                "channel_name", "post", "file_url", "note", "context",
            ],
        )
        writer.writeheader()
        for item in items:
            writer.writerow({key: item.get(key, "") for key in writer.fieldnames})

    unique_items = unique_materials(items)
    display_items = [item for item in unique_items if item["scope"] != "exclude"]
    curated_json_path.write_text(json.dumps(display_items, ensure_ascii=False, indent=2), encoding="utf-8")

    with curated_csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "scope", "category", "title", "size", "first_seen", "last_seen",
                "source_count", "sources", "note", "context",
            ],
        )
        writer.writeheader()
        for item in display_items:
            writer.writerow(
                {
                    "scope": item["scope"],
                    "category": item["category"],
                    "title": item["title"],
                    "size": item["size"],
                    "first_seen": item["first_seen"],
                    "last_seen": item["last_seen"],
                    "source_count": len(item["sources"]),
                    "sources": " | ".join(source["file_url"] for source in item["sources"]),
                    "note": item["note"],
                    "context": item["contexts"][0] if item["contexts"] else "",
                }
            )

    core_items = [item for item in display_items if item["scope"] == "core"]
    core_json_path.write_text(json.dumps(core_items, ensure_ascii=False, indent=2), encoding="utf-8")
    with core_csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "category", "title", "size", "first_seen", "last_seen",
                "source_count", "sources", "context",
            ],
        )
        writer.writeheader()
        for item in core_items:
            writer.writerow(
                {
                    "category": item["category"],
                    "title": item["title"],
                    "size": item["size"],
                    "first_seen": item["first_seen"],
                    "last_seen": item["last_seen"],
                    "source_count": len(item["sources"]),
                    "sources": " | ".join(source["file_url"] for source in item["sources"]),
                    "context": item["contexts"][0] if item["contexts"] else "",
                }
            )

    categories: dict[str, list[dict]] = {}
    for item in display_items:
        categories.setdefault(item["category"], []).append(item)

    excluded = [item for item in unique_items if item["scope"] == "exclude"]
    core_count = sum(1 for item in display_items if item["scope"] == "core")
    needs_review_count = sum(1 for item in display_items if item["scope"] == "needs_review")
    adjacent_count = sum(1 for item in display_items if item["scope"] == "adjacent")

    lines = [
        "# Каталог PDF-материалов по тактической медицине",
        "",
        f"Период: {start} - {end} включительно, даты приведены по Москве.",
        f"Источники: {len(CHANNELS)} Telegram-каналов из списка проекта.",
        f"PDF-упоминаний найдено: {len(items)}.",
        f"Уникальных материалов после склейки репостов: {len(display_items)}.",
        f"Ядро библиотеки: {core_count}; требует ручной проверки: {needs_review_count}; смежное: {adjacent_count}; исключено как нерелевантное: {len(excluded)}.",
        "",
        "Ограничение: публичный Telegram обычно дает ссылку на пост с файлом, а не прямую постоянную ссылку скачивания. Поэтому ссылки ведут к посту/одиночному вложению; открывать и скачивать PDF нужно из Telegram.",
        "",
        "Статусы: `core` — ядро медицинской библиотеки; `needs_review` — похоже полезно, но нужно открыть PDF; `adjacent` — смежная безопасность/снаряжение; `exclude` сохранено только в полном CSV/JSON всех упоминаний.",
        "",
        "## Сводка по блокам",
        "",
    ]
    for category in sorted(categories):
        lines.append(f"- {category}: {len(categories[category])}")
    lines.append("")

    for category in sorted(categories):
        lines.append(f"## {category}")
        lines.append("")
        for item in categories[category]:
            dates = item["first_seen"]
            if item["first_seen"] != item["last_seen"]:
                dates = f"{item['first_seen']} - {item['last_seen']}"
            lines.append(f"### {item['title']}")
            lines.append(f"- Статус: {item['scope']}")
            lines.append(f"- Дата: {dates}")
            lines.append(f"- Размер: {item['size'] or 'не указан'}")
            lines.append(f"- Источники: {len(item['sources'])}")
            for source in item["sources"]:
                lines.append(f"  - {source['date']}, {source['channel_name']}: {source['file_url']}")
            lines.append(f"- Заметка: {item['note']}")
            if item["contexts"]:
                lines.append(f"- Контекст: {item['contexts'][0]}")
            lines.append("")

    curated_md_path.write_text("\n".join(lines), encoding="utf-8")

    core_categories: dict[str, list[dict]] = {}
    for item in core_items:
        core_categories.setdefault(item["category"], []).append(item)

    core_lines = [
        "# PDF-ядро библиотеки по тактической медицине",
        "",
        f"Период: {start} - {end} включительно, даты приведены по Москве.",
        f"Уникальных материалов: {len(core_items)}.",
        "",
        "В этот файл включены только материалы со статусом `core`: справочники, рекомендации, протоколы, статьи, книги и учебные материалы с явной медицинской/такмед-направленностью.",
        "",
        "## Блоки",
        "",
    ]
    for category in sorted(core_categories):
        core_lines.append(f"- {category}: {len(core_categories[category])}")
    core_lines.append("")
    for category in sorted(core_categories):
        core_lines.append(f"## {category}")
        core_lines.append("")
        for item in core_categories[category]:
            dates = item["first_seen"]
            if item["first_seen"] != item["last_seen"]:
                dates = f"{item['first_seen']} - {item['last_seen']}"
            core_lines.append(f"### {item['title']}")
            core_lines.append(f"- Дата: {dates}")
            core_lines.append(f"- Размер: {item['size'] or 'не указан'}")
            core_lines.append(f"- Источники: {len(item['sources'])}")
            for source in item["sources"]:
                core_lines.append(f"  - {source['date']}, {source['channel_name']}: {source['file_url']}")
            if item["contexts"]:
                core_lines.append(f"- Контекст: {item['contexts'][0]}")
            core_lines.append("")
    core_md_path.write_text("\n".join(core_lines), encoding="utf-8")

    print(f"Wrote {all_json_path}")
    print(f"Wrote {all_csv_path}")
    print(f"Wrote {curated_json_path}")
    print(f"Wrote {curated_csv_path}")
    print(f"Wrote {curated_md_path}")
    print(f"Wrote {core_json_path}")
    print(f"Wrote {core_csv_path}")
    print(f"Wrote {core_md_path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", default="2026-01-01")
    parser.add_argument("--end", default="2026-08-29")
    parser.add_argument("--out-dir", default="research/takmed_pdf_archive")
    parser.add_argument("--delay", type=float, default=0.25)
    args = parser.parse_args()

    start = dt.date.fromisoformat(args.start)
    end = dt.date.fromisoformat(args.end)
    out_dir = Path(args.out_dir)
    raw_dir = out_dir / "raw"
    items = collect(start, end, raw_dir, args.delay)
    write_outputs(items, out_dir, args.start, args.end)


if __name__ == "__main__":
    main()
