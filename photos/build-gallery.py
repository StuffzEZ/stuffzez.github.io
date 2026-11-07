#!/usr/bin/env python3
import os, sys, json, datetime
from pathlib import Path
try:
    from PIL import Image
except ImportError:
    print("Error: Pillow is required")
    sys.exit(1)

THUMB_SIZE = (400, 400)
LOW_MAX_DIM = 1280
IMAGE_EXTS = {".png", ".jpg", ".jpeg"}
DONE_SUFFIX = "_done"

def walk_assets(d):
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
            if f.endswith(("_thumb.png", "_thumb.jpg", "_thumb.jpeg",
                           "_low.png", "_low.jpg", "_low.jpeg")):
                continue  # skip generated variants
            full = str(rel / f).replace(os.sep, "/")
            if full.endswith(f"{DONE_SUFFIX}{ext}"):
                # Already built — add entry (gen_variants will skip since it's _done)
                node[f] = {"type": "file", "path": full}
            else:
                # New photo — add with original path; gen_variants will rename + generate variants
                node[f] = {"type": "file", "path": full}
    return tree

def gen_variants(assets_dir, mt):
    """Rename each photo to name_done.ext and generate _done_thumb/_done_low variants."""
    created, skipped = [], []
    def rec(m):
        for n, nd in m.items():
            if nd["type"] == "folder":
                s = rec(nd["children"])
                created.extend(s["created"]); skipped.extend(s["skipped"])
            else:
                ir = nd["path"]
                ip = assets_dir / ir
                if not ip.exists(): continue
                stem = Path(ir).stem; suf = Path(ir).suffix; par = Path(ir).parent
                # Final on-disk names (with _done marker)
                done_stem = f"{stem}{DONE_SUFFIX}"
                dr = str(par / (done_stem + suf))
                tr = str(par / (done_stem + "_thumb" + suf))
                lr = str(par / (done_stem + "_low" + suf))
                dp = assets_dir / dr; tp = assets_dir / tr; lp = assets_dir / lr

                # If this file is already named _done.ext, it's already processed — skip
                if ir.endswith(f"{DONE_SUFFIX}{suf}"):
                    skipped.append(ir)
                    continue

                # Skip if all variants already exist (re-run)
                if dp.exists() and tp.exists() and lp.exists():
                    skipped.append(ir)
                    continue

                try:
                    img = Image.open(ip)
                    if img.mode in ("RGBA", "P", "LA"):
                        bg = Image.new("RGB", img.size, (30,30,32))
                        if img.mode == "P": img = img.convert("RGBA")
                        al = img.split()[-1] if img.mode == "RGBA" else None
                        bg.paste(img, mask=al); img = bg
                    elif img.mode != "RGB": img = img.convert("RGB")

                    # If not yet renamed to _done, do it now
                    if not dp.exists():
                        ip.rename(dp)
                        print(f"  marked: {dr}")
                        # Re-open the renamed file since the path changed
                        img = Image.open(dp)
                        if img.mode in ("RGBA", "P", "LA"):
                            bg = Image.new("RGB", img.size, (30,30,32))
                            if img.mode == "P": img = img.convert("RGBA")
                            al = img.split()[-1] if img.mode == "RGBA" else None
                            bg.paste(img, mask=al); img = bg
                        elif img.mode != "RGB": img = img.convert("RGB")

                    if not tp.exists():
                        c = img.copy(); c.thumbnail(THUMB_SIZE, Image.LANCZOS)
                        c.save(tp, "PNG", optimize=True)
                        print(f"  thumb: {tr}")
                    if not lp.exists():
                        c = img.copy(); c.thumbnail((LOW_MAX_DIM, LOW_MAX_DIM), Image.LANCZOS)
                        c.save(lp, "PNG", optimize=True)
                        print(f"  low: {lr}")

                    # Update manifest entry to point at the _done file
                    nd["path"] = dr
                    created.append(ir)
                except Exception as e:
                    print(f"  err {ir}: {e}")
        return {"created": created, "skipped": skipped}
    return rec(mt)

def main():
    rr = Path(__file__).parent.parent.resolve()
    ad = rr / "photos" / "assets"
    op = rr / "photos" / "gallery-data.js"
    if not ad.exists():
        print("Error: no assets dir"); sys.exit(1)
    tree = walk_assets(ad)
    r = gen_variants(ad, tree)
    data = {"assets": {"key": "assets", "type": "folder", "children": tree}}
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = ["/*", " * Auto-generated gallery manifest.", " * Run build-gallery.py after adding photos.", f" * Generated on {now}", " */", "", "// @ts-nocheck", "window.GALLERY_DATA =", json.dumps(data, indent=2), ";", ""]
    op.write_text("\n".join(lines), encoding="utf-8")
    nc = len(r["created"]); ns = len(r["skipped"])
    print(f"Wrote {op} ({nc} processed, {ns} skipped)")

if __name__ == "__main__":
    main()