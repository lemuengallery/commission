#!/usr/bin/env python3

import json
import re
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "gallery-data.js"
SECTION_DEFINITIONS = (
    ("illustration", "Illustration"),
    ("manga", "Manga"),
)
IMAGE_EXTENSIONS = {".avif", ".bmp", ".gif", ".jpeg", ".jpg", ".png", ".webp"}
TAG_NAMES = {"draft", "fetish", "ongoing"}
PAREN_PATTERN = re.compile(r"[（(]([^（）()]*)[）)]")
STRIP_PATTERN = re.compile(r"\s*[（(][^（）()]*[）)]\s*")
SORT_PATTERN = re.compile(r"(\d+)")


def natural_sort_key(value: str):
    parts = SORT_PATTERN.split(value.casefold())
    return [int(part) if part.isdigit() else part for part in parts]


def parse_folder_name(folder_name: str):
    matches = [match.strip() for match in PAREN_PATTERN.findall(folder_name)]
    illustrator = STRIP_PATTERN.sub("", folder_name).strip()
    illustrator = illustrator or folder_name.strip()
    tags = []

    for match in matches:
        lowered = match.casefold()
        if lowered in TAG_NAMES and lowered not in tags:
            tags.append(lowered)

    return illustrator, tags


def collect_section(section_id: str, title: str):
    section_path = ROOT / section_id
    items = []

    if not section_path.exists():
        return {"id": section_id, "title": title, "items": items}

    for folder in sorted(
        [path for path in section_path.iterdir() if path.is_dir()],
        key=lambda path: natural_sort_key(path.name),
    ):
        images = sorted(
            [
                path
                for path in folder.iterdir()
                if path.is_file() and path.suffix.casefold() in IMAGE_EXTENSIONS
            ],
            key=lambda path: natural_sort_key(path.name),
        )

        if not images:
            continue

        illustrator, tags = parse_folder_name(folder.name)
        relative_images = [path.relative_to(ROOT).as_posix() for path in images]

        items.append(
            {
                "id": f"{section_id}-{folder.name}",
                "folderName": folder.name,
                "illustrator": illustrator,
                "tags": tags,
                "imageCount": len(relative_images),
                "cover": relative_images[0],
                "images": relative_images,
            }
        )

    return {"id": section_id, "title": title, "items": items}


def main():
    data = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sections": [
            collect_section(section_id, title)
            for section_id, title in SECTION_DEFINITIONS
        ],
    }

    OUTPUT.write_text(
        "window.GALLERY_DATA = "
        + json.dumps(data, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
