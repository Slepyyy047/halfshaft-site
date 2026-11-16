# Builds Halfshaft brand SVGs: mark, outlined wordmark, lockups, favicon.
# Wordmark outlines come from Inter Display Bold (SIL OFL 1.1).
import json, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

OUT = sys.argv[1]
TEAL, TEAL_DARK, PAPER, GRAPHITE = "#3CCFC0", "#0B6E65", "#ECE9E2", "#15181A"

MARK = ('<rect x="9" y="8" width="9" height="32" rx="1.6"/>'
        '<rect x="30" y="8" width="9" height="32" rx="1.6"/>'
        '<path d="M17 19h6.85l-3.2 10H17z"/>'
        '<path d="M27.35 19H31v10h-6.85z"/>')

font = TTFont("/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf")
gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
upm = font["head"].unitsPerEm
cap = font["OS/2"].sCapHeight
text, tracking = "HALFSHAFT", 60  # font units
pen = SVGPathPen(gs)
x = 0
for i, ch in enumerate(text):
    g = cmap[ord(ch)]
    tp = TransformPen(pen, (1, 0, 0, -1, x, cap))  # flip y, baseline at cap height
    gs[g].draw(tp)
    x += hmtx[g][0] + (tracking if i < len(text) - 1 else 0)
word_w, word_d = x, pen.getCommands()

# Lockup: mark 48 units tall; wordmark cap height = 17 units, vertically centred.
scale = 17 / cap
gap = 7
word_x = 48 + gap - 4
lock_w = word_x + word_w * scale + 2
def lockup(mark_fill, word_fill):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {lock_w:.1f} 48" role="img" aria-label="Halfshaft">'
            f'<g fill="{mark_fill}">{MARK}</g>'
            f'<path fill="{word_fill}" transform="translate({word_x} {24 - 17/2}) scale({scale:.6f})" d="{word_d}"/></svg>')
files = {
  "halfshaft-mark.svg": f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="Halfshaft"><g fill="{TEAL}">{MARK}</g></svg>',
  "halfshaft-mark-mono.svg": f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="Halfshaft"><g fill="currentColor">{MARK}</g></svg>',
  "favicon.svg": f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="{GRAPHITE}"/><g fill="{TEAL}">{MARK}</g></svg>',
  "halfshaft-lockup-on-dark.svg": lockup(TEAL, PAPER),
  "halfshaft-lockup-on-light.svg": lockup(TEAL_DARK, GRAPHITE),
  "halfshaft-lockup-mono.svg": lockup("currentColor", "currentColor"),
}
for n, s in files.items():
    open(f"{OUT}/{n}", "w").write(s)
json.dump({"mark": MARK, "word": word_d, "wordScale": scale, "wordX": word_x, "width": round(lock_w, 1)},
          open(f"{OUT}/logo-paths.json", "w"))
print("lockup width", round(lock_w, 1))
