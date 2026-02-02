# Icons

Generate PNG icons from the SVG:

```bash
# Using ImageMagick (install with: brew install imagemagick)
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png
```

Or use any online SVG to PNG converter.

Required sizes:
- `icon16.png` - 16x16 (toolbar)
- `icon48.png` - 48x48 (extensions page)
- `icon128.png` - 128x128 (Chrome Web Store)
