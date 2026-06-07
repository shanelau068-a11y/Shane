#!/usr/bin/env python3
"""Convert HEIC images in a folder to JPEG files.

Only files whose extension is .heic (case-insensitive) are converted. Other files
are ignored.
"""

from __future__ import annotations

import argparse
from pathlib import Path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Convert all HEIC files in a folder to JPEG format."
    )
    parser.add_argument(
        "folder",
        type=Path,
        help="Folder that contains the HEIC files to convert.",
    )
    parser.add_argument(
        "-r",
        "--recursive",
        action="store_true",
        help="Also scan subfolders for HEIC files.",
    )
    parser.add_argument(
        "-o",
        "--output-dir",
        type=Path,
        help=(
            "Folder where JPEG files will be saved. By default, each JPEG is "
            "saved beside its source HEIC file."
        ),
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite an existing JPEG output file if it already exists.",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=95,
        choices=range(1, 101),
        metavar="1-100",
        help="JPEG quality from 1 to 100. Default: 95.",
    )
    return parser


def iter_heic_files(folder: Path, recursive: bool) -> list[Path]:
    pattern = "**/*" if recursive else "*"
    return sorted(
        path
        for path in folder.glob(pattern)
        if path.is_file() and path.suffix.lower() == ".heic"
    )


def output_path_for(source: Path, source_root: Path, output_dir: Path | None) -> Path:
    if output_dir is None:
        return source.with_suffix(".jpg")

    relative_source = source.relative_to(source_root)
    return (output_dir / relative_source).with_suffix(".jpg")


def convert_file(source: Path, destination: Path, quality: int, overwrite: bool) -> str:
    from PIL import ImageOps
    from pillow_heif import register_heif_opener

    if destination.exists() and not overwrite:
        return "skipped"

    register_heif_opener()

    from PIL import Image

    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        exif = image.info.get("exif")

        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")

        save_options: dict[str, object] = {
            "format": "JPEG",
            "quality": quality,
            "optimize": True,
        }
        if exif:
            save_options["exif"] = exif

        image.save(destination, **save_options)

    return "converted"


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    folder = args.folder.expanduser().resolve()
    if not folder.exists():
        parser.error(f"Folder does not exist: {folder}")
    if not folder.is_dir():
        parser.error(f"Path is not a folder: {folder}")

    output_dir = args.output_dir.expanduser().resolve() if args.output_dir else None
    heic_files = iter_heic_files(folder, args.recursive)

    if not heic_files:
        print("No HEIC files found. Nothing to convert.")
        return 0

    converted = 0
    skipped = 0
    failed = 0

    for source in heic_files:
        destination = output_path_for(source, folder, output_dir)
        try:
            result = convert_file(source, destination, args.quality, args.overwrite)
        except Exception as exc:
            failed += 1
            print(f"FAILED: {source} ({exc})")
            continue

        if result == "converted":
            converted += 1
            print(f"CONVERTED: {source} -> {destination}")
        else:
            skipped += 1
            print(f"SKIPPED: {source} -> {destination} already exists")

    print(
        f"Done. Converted: {converted}. Skipped: {skipped}. Failed: {failed}."
    )
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
