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
            if Path(f).suffix.lower() in IMAGE_EXTS and not f.endswith(("_thumb.png", "_thumb.jpg", "_thumb.jpeg", "_low.png", "_low.jpg", "_low.jpeg")):
                full = str(rel / f).replace(os.sep, "/")
                node[f] = {"type": "file", "path": full}
    return tree

def gen_variants(assets_dir, mt):
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
                tr = str(par / (stem + "_thumb" + suf))
                lr = str(par / (stem + "_low" + suf))
                tp = assets_dir / tr; lp = assets_dir / lr
                nt = not tp.exists(); nl = not lp.exists()
                if nt or nl:
                    try:
                        img = Image.open(ip)
                        if img.mode in ("RGBA", "P", "LA"):
                            bg = Image.new("RGB", img.size, (30,30,32))
                            if img.mode == "P": img = img.convert("RGBA")
                            al = img.split()[-1] if img.mode == "RGBA" else None
                            bg.paste(img, mask=al); img = bg
                        elif img.mode != "RGB": img = img.convert("RGB")
                        if nt:
                            c = img.copy(); c.thumbnail(THUMB_SIZE, Image.LANCZOS)
                            c.save(tp, "PNG", optimize=True)
                            print(f"  thumb: {tr}")
                        if nl:
                            c = img.copy(); c.thumbnail((LOW_MAX_DIM, LOW_MAX_DIM), Image.LANCZOS)
                            c.save(lp, "PNG", optimize=True)
                            print(f"  low: {lr}")
                        created.append(ir)
                    except Exception as e:
                        print(f"  err {ir}: {e}")
                else:
                    skipped.append(ir)
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