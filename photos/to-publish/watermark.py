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


def _sample_region_luminance(img: Image.Image, x: int, y: int, font: ImageFont.FreeTypeFont, text: str) -> float:
    """Sample the average luminance of the background region where text will be drawn."""
    try:
        bbox = font.getbbox(text)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        # Sample a slightly larger region around the text
        pad = max(4, font.size // 4)
        left = max(0, x - bbox[0] - pad)
        top = max(0, y - bbox[1] - pad)
        right = min(img.width, x - bbox[0] + tw + pad)
        bottom = min(img.height, y - bbox[1] + th + pad)
        if right <= left or bottom <= top:
            return 0.5
        region = img.crop((left, top, right, bottom)).convert("RGB")
        pixels = list(region.getdata())
        if not pixels:
            return 0.5
        avg_r = sum(p[0] for p in pixels) / len(pixels)
        avg_g = sum(p[1] for p in pixels) / len(pixels)
        avg_b = sum(p[2] for p in pixels) / len(pixels)
        # Perceived luminance (ITU-R BT.601)
        return (0.299 * avg_r + 0.587 * avg_g + 0.114 * avg_b) / 255.0
    except Exception:
        return 0.5


def add_watermark(image_path: Path, output_path: Path):
    """
    Add a hard-to-remove watermark to an image.
    Uses adaptive outlined text that remains readable on both light and dark backgrounds.
    Bottom-left and top-right carry the site URL; other corners use 'stuf_y'.
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

        # Watermark positions - multiple placements make it harder to remove
        # Each position uses different opacity for subtle but persistent marks
        # Format: (x, y, text, anchor)
        positions = [
            # Top-left corner - main watermark
            (15, 15, "stuf_y", "lt"),
            # Bottom-right corner - mirrored
            (img.width - 15, img.height - 15, "stuf_y", "rb"),
            # Center - faint diagonal watermark
            (img.width // 2, img.height // 2, "stuf_y", "mm"),
            # Top-right - site URL
            (img.width - 15, 15, "stuffzez.github.io/photos/", "rt"),
            # Bottom-left - site URL
            (15, img.height - 15, "stuffzez.github.io/photos/", "lb"),
        ]

        stroke_w = max(1, font_size // 12)

        for x, y, text, anchor in positions:
            # Sample background luminance to pick contrasting colors
            lum = _sample_region_luminance(img, x, y, font, text)

            if lum < 0.45:
                # Dark background -> light fill with dark outline
                fill = (255, 255, 255, 60)
                stroke = (0, 0, 0, 110)
            else:
                # Light background -> dark fill with light outline
                fill = (20, 20, 20, 55)
                stroke = (255, 255, 255, 100)

            draw.text(
                (x, y), text, font=font, fill=fill, anchor=anchor,
                stroke_width=stroke_w, stroke_fill=stroke,
            )

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
        add_watermark(png_path, output_path)

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
