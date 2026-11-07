#!/usr/bin/env python3
"""
Photo Watermark Script
Processes photos in to-publish/ and adds a hard-to-remove watermark,
then moves them to to-publish/to-sort/ for manual organization.
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Error: Pillow is required. Install with: pip install Pillow")
    sys.exit(1)


def add_watermark(image_path: Path, output_path: Path, watermark_text: str = "stufy"):
    """
    Add a hard-to-remove watermark to an image.
    Uses multiple watermarks at different positions and opacities
    to make removal difficult while keeping the watermark subtle.
    """
    try:
        img = Image.open(image_path).convert("RGBA")
        txt_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(txt_layer)

        # Calculate font size based on image dimensions
        font_size = max(16, img.width // 40)
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except (IOError, OSError):
            font = ImageFont.load_default()

        # Get text dimensions for positioning
        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        # Watermark positions - multiple placements make it harder to remove
        # Each position uses different opacity for subtle but persistent marks
        positions = [
            # Top-left corner - main watermark
            (15, 15, (255, 255, 255, 50)),
            # Bottom-right corner - mirrored
            (img.width - text_width - 15, img.height - text_height - 15, (255, 255, 255, 40)),
            # Center - faint diagonal watermark
            (img.width // 2 - text_width // 2, img.height // 2 - text_height // 2, (255, 255, 255, 25)),
            # Top-right - small secondary mark
            (img.width - text_width - 15, 15, (255, 255, 255, 30)),
            # Bottom-left - small secondary mark
            (15, img.height - text_height - 15, (255, 255, 255, 35)),
        ]

        for x, y, fill in positions:
            draw.text((x, y), watermark_text, font=font, fill=fill)

        # Composite the watermark layer onto the image
        watermarked = Image.alpha_composite(img, txt_layer)

        # Save as PNG
        watermarked.save(output_path, "PNG")
        print(f"  Watermarked: {output_path.name}")

    except Exception as e:
        print(f"  Error processing {image_path.name}: {e}")


def process_photos(root_dir: Path):
    """
    Process all PNG files in to-publish/ and move them to to-publish/to-sort/.
    Adds watermark to each image before moving.
    """
    to_publish_dir = root_dir / "to-publish"
    to_sort_dir = root_dir / "to-publish" / "to-sort"

    if not to_publish_dir.exists():
        print(f"Error: to-publish folder not found at {to_publish_dir}")
        return

    # Create to-sort directory if it doesn't exist
    to_sort_dir.mkdir(parents=True, exist_ok=True)

    # Get all PNG files in to-publish (top level only, not in to-sort)
    png_files = [
        f for f in to_publish_dir.rglob("*.png")
        if not str(f.relative_to(to_publish_dir)).startswith("to-sort")
    ]

    if not png_files:
        print("No PNG files found in to-publish/")
        return

    print(f"Found {len(png_files)} photo(s) to process")
    print(f"Output: to-publish/to-sort/\n")

    for png_path in png_files:
        # Get relative path from to-publish
        rel_path = png_path.relative_to(to_publish_dir)

        # Skip hidden files
        if rel_path.parts[0].startswith('.'):
            continue

        # Output path in to-sort (preserving folder structure)
        output_path = to_sort_dir / rel_path

        # Create destination directory if needed
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Check if file already exists in to-sort
        if output_path.exists():
            print(f"  Skipping (already exists): {rel_path}")
            # Remove original from to-publish since it's already processed
            png_path.unlink()
            continue

        # Add watermark
        add_watermark(png_path, output_path, "stufy")

        # Move to to-sort (remove original from to-publish)
        png_path.unlink()
        print(f"  Moved: {rel_path}")

    print("\nDone! All photos processed and moved to to-publish/to-sort/")


def main():
    # Get the photos/ directory (parent of to-publish/)
    photos_dir = Path(__file__).parent.parent
    process_photos(photos_dir)


if __name__ == "__main__":
    main()
