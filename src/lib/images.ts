/** Image manifest filled by the build before pages are rendered. */
export interface ImageVariant {
  width: number;
  height: number;
  /** srcset widths available for this variant */
  widths: number[];
  /** URL pattern: replace {w} with a width */
  pattern: string;
}

export interface ImageCredit {
  author: string;
  license: string;
  page: string;
}

export interface ImageEntry {
  name: string;
  credit?: ImageCredit;
  main: ImageVariant;
  /** Optional art-directed crop for narrow screens */
  narrow?: ImageVariant;
}

let manifest: Record<string, ImageEntry> = {};

export function setImageManifest(m: Record<string, ImageEntry>) {
  manifest = m;
}

export function getImage(name: string): ImageEntry {
  const e = manifest[name];
  if (!e) throw new Error(`Image "${name}" is missing from assets/images`);
  return e;
}

/** Credits of every library photograph in use, for the footer line */
export function photoCredits(): ImageCredit[] {
  const seen = new Set<string>();
  return Object.values(manifest)
    .map((e) => e.credit)
    .filter((c): c is ImageCredit => Boolean(c) && !seen.has(c!.page) && Boolean(seen.add(c!.page)));
}

export const srcset = (v: ImageVariant) => v.widths.map((w) => `${v.pattern.replace("{w}", String(w))} ${w}w`).join(", ");
export const largest = (v: ImageVariant) => v.pattern.replace("{w}", String(v.widths[v.widths.length - 1]));
export const pick = (v: ImageVariant, target: number) =>
  v.pattern.replace("{w}", String(v.widths.find((w) => w >= target) ?? v.widths[v.widths.length - 1]));
