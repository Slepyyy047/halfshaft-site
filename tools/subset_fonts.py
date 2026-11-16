# Subsets Inter / Inter Display to Latin + Ukrainian Cyrillic and writes WOFF files.
import sys
from fontTools import subset
from fontTools.ttLib import TTFont
SRC = "/usr/share/fonts/opentype/inter/"
OUT = sys.argv[1]
fonts = {
  "inter-400": "Inter-Regular.otf",
  "inter-500": "Inter-Medium.otf",
  "inter-600": "Inter-SemiBold.otf",
  "inter-display-700": "InterDisplay-Bold.otf",
  "inter-display-800": "InterDisplay-ExtraBold.otf",
}
unicodes = "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02BC,U+02C6,U+02DA,U+02DC,U+0400-045F,U+0490-0491,U+2000-206F,U+20B4,U+2116,U+2122,U+2190-2193,U+2212,U+2215,U+00D7"
for name, file in fonts.items():
    opts = subset.Options()
    opts.flavor = "woff"
    opts.layout_features = ["kern","liga","calt","tnum","case","ss01","cv05","cv08","zero"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    opts.hinting = False
    font = TTFont(SRC + file)
    s = subset.Subsetter(opts)
    s.populate(unicodes=subset.parse_unicodes(unicodes))
    s.subset(font)
    font.flavor = "woff"
    font.save(f"{OUT}/{name}.woff")
    print(name, "ok")
