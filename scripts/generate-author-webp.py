from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps

DEFAULT_SIZES = (36, 80)
INPUT_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def is_source_image(path: Path, skip_suffixes: tuple[str, ...]) -> bool:
    if path.suffix.lower() not in INPUT_EXTS:
        return False
    stem = path.stem.lower()
    return not any(stem.endswith(suffix) for suffix in skip_suffixes)


def make_square(img: Image.Image) -> Image.Image:
    width, height = img.size
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    return img.crop((left, top, left + side, top + side))


def generate_variants(folder: Path, sizes: tuple[int, ...], quality: int) -> None:
    suffixes = tuple(f"-{size}" for size in sizes)
    sources = [path for path in folder.iterdir() if path.is_file() and is_source_image(path, suffixes)]

    if not sources:
        print("No source images found.")
        return

    for source in sources:
        try:
            with Image.open(source) as image:
                image = ImageOps.exif_transpose(image)
                image = make_square(image)

                for size in sizes:
                    output_path = source.with_name(f"{source.stem}-{size}.webp")
                    resized = image.resize((size, size), Image.Resampling.LANCZOS)

                    if resized.mode == "P":
                        resized = resized.convert("RGBA")

                    resized.save(output_path, format="WEBP", quality=quality, method=6)
                    print(f"Created: {output_path.name}")
        except Exception as error:
            print(f"Skipped {source.name}: {error}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate square author WEBP variants.")
    parser.add_argument(
        "folder",
        nargs="?",
        default="public/authors",
        help="Folder containing source author images (default: public/authors).",
    )
    parser.add_argument(
        "--sizes",
        default="36,80",
        help="Comma-separated output sizes in pixels (default: 36,80).",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=85,
        help="WEBP quality (default: 85).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    folder = Path(args.folder)
    sizes = tuple(int(value.strip()) for value in args.sizes.split(",") if value.strip())

    if not folder.exists() or not folder.is_dir():
        raise SystemExit(f"Folder not found: {folder}")
    if not sizes:
        raise SystemExit("At least one output size is required.")

    generate_variants(folder, sizes, args.quality)


if __name__ == "__main__":
    main()
