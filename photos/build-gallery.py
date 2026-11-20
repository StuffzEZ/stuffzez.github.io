#!/usr/bin/env python3
import os, sys, json, datetime, argparse
from pathlib import Path
try:
    from PIL import Image
except ImportError:
    print("Error: Pillow is required", flush=True)
    sys.exit(1)

THUMB_SIZE = (400, 400)
LOW_MAX_DIM = 1280
IMAGE_EXTS = {".png", ".jpg", ".jpeg"}
DONE_SUFFIX = "_done"


def parse_args():
    parser = argparse.ArgumentParser(description="Build gallery thumbnails & metadata.")
    parser.add_argument("--force", action="store_true", help="Reprocess all images even if already done")
    parser.add_argument("--meta", action="store_true", help="Only re-embed metadata on existing _done files, no variant generation")
    return parser.parse_args()


def walk_assets(d, force=False, meta_only=False):
    """Walk assets dir and build tree dict."""
    tree = {}
    for root, dirs, files in os.walk(d):
        dirs.sort()
        rel = Path(root).relative_to(d)
        node = tree
        for p in rel.parts:
            if p not in node:
                node[p] = {"type": "folder", "children": {}}
            node = node[p]["children"]
        for f in sorted(files):
            ext = Path(f).suffix.lower()
            if ext not in IMAGE_EXTS:
                continue
            # Skip generated variants
            if any(f.endswith(v) for v in ("_thumb.png", "_thumb.jpg", "_thumb.jpeg",
                                          "_low.png", "_low.jpg", "_low.jpeg")):
                continue
            full = str(rel / f).replace(os.sep, "/")
            if meta_only and not full.endswith(f"{DONE_SUFFIX}{ext}"):
                continue
            node[f] = {"type": "file", "path": full}
    return tree


LICENSE_URL = "https://github.com/StuffzEZ/stuffzez.github.io/blob/main/photos/LICENSE"
AUTHOR_NAME = "Stuf_y"
AUTHOR_SITE = "stuffzez.github.io/photos"
AUTHOR_GH = "github.com/StuffzEZ"


def embed_metadata(img, output_path, is_thumb=False):
    try:
        exif = img.getexif()
        exif[0x0131] = f"{AUTHOR_NAME} / {AUTHOR_SITE}"
        exif[0x013B] = AUTHOR_NAME
        exif[0x8298] = f"Copyright (c) {AUTHOR_NAME} - {AUTHOR_SITE}"
        exif[0x010E] = (
            f"License: Non-commercial, attribution required. "
            f"Author: {AUTHOR_NAME} ({AUTHOR_GH}). "
            f"License URL: {LICENSE_URL}"
        )
        exif[0x9286] = (
            f"Author={AUTHOR_NAME}; Site={AUTHOR_SITE}; "
            f"GitHub={AUTHOR_GH}; License=CC-BY-NC-4.0; "
            f"LicenseURL={LICENSE_URL}"
        )
        exif_bytes = exif.tobytes()
        img.save(output_path, "PNG", exif=exif_bytes, optimize=True)
        return True
    except Exception as e:
        print(f"  warn: metadata embed failed for {output_path.name}: {e}", flush=True)
        try:
            img.save(output_path, "PNG", optimize=True)
        except Exception:
            pass
        return False


def prepare_image(ip):
    img = Image.open(ip)
    if img.mode in ("RGBA", "P", "LA"):
        bg = Image.new("RGB", img.size, (30, 30, 32))
        if img.mode == "P":
            img = img.convert("RGBA")
        al = img.split()[-1] if img.mode == "RGBA" else None
        bg.paste(img, mask=al)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    return img


def process_done_photo(assets_dir, ir, force=False):
    ip = assets_dir / ir
    if not ip.exists():
        return False, True
    par = Path(ir).parent
    full_name = Path(ir).name
    suf = Path(ir).suffix
    stem_no_done = full_name.rsplit(DONE_SUFFIX, 1)[0]
    # For _done files, dr is the same path — no need to append suf again
    dr = ir
    tr = str(par / (stem_no_done + DONE_SUFFIX + "_thumb" + suf))
    lr = str(par / (stem_no_done + DONE_SUFFIX + "_low" + suf))
    dp = assets_dir / dr
    tp = assets_dir / tr
    lp = assets_dir / lr
    try:
        img = prepare_image(ip)
        if not tp.exists() or force:
            c = img.copy()
            c.thumbnail(THUMB_SIZE, Image.LANCZOS)
            embed_metadata(c, tp, is_thumb=True)
            print(f"  thumb: {tr}", flush=True)
        if not lp.exists() or force:
            c = img.copy()
            c.thumbnail((LOW_MAX_DIM, LOW_MAX_DIM), Image.LANCZOS)
            embed_metadata(c, lp)
            print(f"  low: {lr}", flush=True)
        embed_metadata(img, dp)
        return True, False
    except Exception as e:
        print(f"  err {ir}: {e}", flush=True)
        return False, True


def process_new_photo(assets_dir, ir, force=False):
    ip = assets_dir / ir
    if not ip.exists():
        return False, True
    stem = Path(ir).stem
    suf = Path(ir).suffix
    par = Path(ir).parent
    done_name = f"{stem}{DONE_SUFFIX}"
    dr = str(par / (done_name + suf))
    tr = str(par / (done_name + "_thumb" + suf))
    lr = str(par / (done_name + "_low" + suf))
    dp = assets_dir / dr
    tp = assets_dir / tr
    lp = assets_dir / lr
    if not force and dp.exists() and tp.exists() and lp.exists():
        return False, True
    try:
        img = prepare_image(ip)
        if not dp.exists():
            ip.rename(dp)
            print(f"  marked: {dr}", flush=True)
            img = prepare_image(dp)
        if not tp.exists() or force:
            c = img.copy()
            c.thumbnail(THUMB_SIZE, Image.LANCZOS)
            embed_metadata(c, tp, is_thumb=True)
            print(f"  thumb: {tr}", flush=True)
        if not lp.exists() or force:
            c = img.copy()
            c.thumbnail((LOW_MAX_DIM, LOW_MAX_DIM), Image.LANCZOS)
            embed_metadata(c, lp)
            print(f"  low: {lr}", flush=True)
        embed_metadata(img, dp)
        return True, False
    except Exception as e:
        print(f"  err {ir}: {e}", flush=True)
        return False, True


def gen_variants(assets_dir, tree, force=False, meta_only=False):
    created, skipped = [], []

    def rec(m):
        for n, nd in m.items():
            if nd["type"] == "folder":
                s = rec(nd["children"])
                created.extend(s["created"])
                skipped.extend(s["skipped"])
            else:
                ir = nd["path"]
                ip = assets_dir / ir
                if not ip.exists():
                    continue
                is_done = ir.endswith(f"{DONE_SUFFIX}{Path(ir).suffix}")
                if is_done:
                    updated, sk = process_done_photo(assets_dir, ir, force=force)
                    if updated:
                        created.append(ir)
                    elif sk:
                        skipped.append(ir)
                else:
                    if meta_only:
                        skipped.append(ir)
                        continue
                    updated, sk = process_new_photo(assets_dir, ir, force=force)
                    if updated:
                        created.append(ir)
                    elif sk:
                        skipped.append(ir)
                    stem = Path(ir).stem
                    suf = Path(ir).suffix
                    par = Path(ir).parent
                    nd["path"] = str(par / (f"{stem}{DONE_SUFFIX}{suf}"))
        return {"created": created, "skipped": skipped}

    return rec(tree)


def main():
    args = parse_args()
    rr = Path(__file__).parent.parent.resolve()
    ad = rr / "photos" / "assets"
    op = rr / "photos" / "gallery-data.js"
    if not ad.exists():
        print("Error: no assets dir", flush=True)
        sys.exit(1)

    force = args.force
    meta_only = args.meta

    tree = walk_assets(ad, force=force, meta_only=meta_only)
    r = gen_variants(ad, tree, force=force, meta_only=meta_only)

    data = {"assets": {"key": "assets", "type": "folder", "children": tree}}
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    flags = []
    if force:
        flags.append("--force")
    if meta_only:
        flags.append("--meta")
    flag_str = f" ({' '.join(flags)})" if flags else ""
    lines = [
        "/*",
        " * Auto-generated gallery manifest.",
        " * Run build-gallery.py after adding photos.",
        f" * Generated on {now}{flag_str}",
        " */",
        "",
        "// @ts-nocheck",
        "window.GALLERY_DATA =", json.dumps(data, indent=2), ";", ""
    ]
    op.write_text("\n".join(lines), encoding="utf-8")

    nc = len(r["created"])
    ns = len(r["skipped"])
    tag = ""
    if force and meta_only:
        tag = " --force --meta"
    elif force:
        tag = " --force"
    elif meta_only:
        tag = " --meta"
    print(f"Wrote {op}{tag} ({nc} processed, {ns} skipped)", flush=True)


if __name__ == "__main__":
    main()