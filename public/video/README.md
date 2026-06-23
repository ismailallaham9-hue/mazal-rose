# Hero video assets

The homepage `<AfterDarkHero>` component uses the "After Dark" evening-collection clip:

- `after-dark.webm` ← preferred source (VP9, ~210 KB)
- `after-dark.mp4`  ← fallback source (H.264, ~1 MB)
- `after-dark-poster.jpg` ← first-paint poster frame

All three are present and generated with `ffmpeg` (installed via
`winget install Gyan.FFmpeg`). The clip is a self-contained editorial (the title
and CTA are in the footage), so the whole hero is a single accessible link to the
collection — no overlay text is layered on top.

## Regenerating from a new source clip

Drop the new clip in as `after-dark.mp4`, then from the project root:

```bash
# WebM (VP9) — preferred source, usually much smaller
ffmpeg -i public/video/after-dark.mp4 -an \
  -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 \
  public/video/after-dark.webm

# Poster frame (grab ~2s in, where the composition looks best)
ffmpeg -ss 2 -i public/video/after-dark.mp4 -frames:v 1 -q:v 2 \
  public/video/after-dark-poster.jpg
```

- `-an` strips audio (the hero is muted anyway → smaller file).
- Adjust `-crf` up for smaller files / down for higher quality.
- Trim to a clean loop with `-ss <start> -t <seconds>` if there's a dead frame.
