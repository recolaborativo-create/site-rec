Drop your Instagram post screenshots here.

Expected filenames (referenced by src/data/instagram-feed.ts):
  post-1.jpg
  post-2.jpg
  post-3.jpg
  post-4.jpg
  post-5.jpg
  post-6.jpg

Recommendations:
- 4:5 aspect ratio (Instagram feed posts), 800-1200px wide.
- Save as JPEG, quality 80-85, under 200 KB each.
- The carousel auto-handles square (1:1) and 3:4 too — set "ratio" in the data file.

If a file is missing, an elegant gradient placeholder fills the slot — the site never breaks.

To go fully automated later:
- Replace InstagramFeed.astro with a Behold.so embed (free, drop-in).
- Or wire up Instagram Basic Display API if you want to own the data.
