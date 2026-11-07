# To-Publish Folder

Place photos here that you want to publish to the gallery. The photos will be:
1. Watermarked with "stufy"
2. Moved to the assets folder

## How to Use

1. Copy your photos into this folder (you can use subdirectories)
2. Run the watermark script:

```bash
python watermark.py
```

3. Your photos will now appear in the gallery under assets/

## Note

- Only PNG files are processed
- Files with names starting with `.` are skipped
- Already watermarked files won't be processed twice
