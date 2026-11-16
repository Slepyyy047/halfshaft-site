// Static build: renders every page to dist/, processes images, bundles CSS and client scripts.
// Usage: node scripts/build.mjs
import { build as esbuild } from "esbuild";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const CACHE = path.join(ROOT, ".cache");
const IMG_CACHE = path.join(CACHE, "img");
const rel = (...p) => path.join(ROOT, ...p);
const hash = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 10);

const JSX = { jsx: "transform", jsxFactory: "h", jsxFragment: "Fragment" };

export async function build({ quiet = false } = {}) {
  const t0 = Date.now();
  const log = (...a) => !quiet && console.log(...a);
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  await mkdir(IMG_CACHE, { recursive: true });

  // 1. Site module (pages + data)
  const siteOut = path.join(CACHE, `site.mjs`);
  await esbuild({
    entryPoints: [rel("src/site.tsx")],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: siteOut,
    logLevel: "error",
    ...JSX,
  });
  const site = await import(pathToFileURL(siteOut).href + `?t=${Date.now()}`);
  // On Vercel, canonical and social URLs follow the production domain
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) site.business.site.url = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  const problems = site.validateData();
  if (problems.length) throw new Error("Data problems:\n  " + problems.join("\n  "));

  // 2. Images
  const manifest = await processImages(log);
  site.setImageManifest(manifest);

  // 3. CSS
  const css = await esbuild({
    entryPoints: [rel("src/styles/index.css")],
    bundle: true,
    minify: true,
    write: false,
    external: ["/fonts/*"],
    target: ["chrome100", "safari15", "firefox100"],
    logLevel: "error",
  });
  const cssBuf = Buffer.from(css.outputFiles[0].contents);
  const cssName = `site.${hash(cssBuf)}.css`;
  await mkdir(path.join(DIST, "assets"), { recursive: true });
  await writeFile(path.join(DIST, "assets", cssName), cssBuf);
  site.assets.css = `/assets/${cssName}`;

  // 4. Client scripts
  const js = await esbuild({
    entryPoints: { site: rel("src/client/site.ts"), pricing: rel("src/client/pricing.ts"), booking: rel("src/client/booking.ts") },
    bundle: true,
    splitting: true,
    format: "esm",
    minify: true,
    target: ["chrome100", "safari15", "firefox100"],
    outdir: path.join(DIST, "assets"),
    entryNames: "[name].[hash]",
    chunkNames: "chunk.[hash]",
    metafile: true,
    logLevel: "error",
    ...JSX,
  });
  for (const [out, meta] of Object.entries(js.metafile.outputs)) {
    if (!meta.entryPoint) continue;
    const name = path.basename(meta.entryPoint, ".ts");
    site.assets.scripts[name] = "/" + path.relative(DIST, path.join(ROOT, out)).split(path.sep).join("/");
  }

  // 5. Pages
  for (const p of site.pages()) {
    const html = "<!doctype html>" + p.render().toString();
    const file = path.join(DIST, p.file);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, html);
  }

  // 6. Static files
  await copyFile(rel("assets/brand/favicon.svg"), path.join(DIST, "favicon.svg"));
  const fav = await readFile(rel("assets/brand/favicon.svg"));
  await sharp(fav, { density: 300 }).resize(32, 32).png().toFile(path.join(DIST, "favicon-32.png"));
  for (const s of [180, 192, 512]) {
    const name = s === 180 ? "apple-touch-icon.png" : `icon-${s}.png`;
    await sharp(fav, { density: 600 }).resize(s, s).flatten({ background: "#121517" }).png().toFile(path.join(DIST, name));
  }
  if (existsSync(rel("assets/brand/og.png"))) await copyFile(rel("assets/brand/og.png"), path.join(DIST, "og.png"));
  else await makeOg(path.join(DIST, "og.png"), manifest["hero-bay"].source);

  const b = site.business;
  await writeFile(
    path.join(DIST, "site.webmanifest"),
    JSON.stringify(
      {
        name: b.name,
        short_name: b.name,
        lang: "uk",
        start_url: "/",
        display: "browser",
        background_color: "#121517",
        theme_color: "#121517",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      null,
      2
    )
  );
  const urls = site.pages().filter((p) => p.sitemap).map((p) => `${b.site.url}${p.url === "/" ? "/" : p.url}`);
  await writeFile(
    path.join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`
  );
  await writeFile(
    path.join(DIST, "robots.txt"),
    b.site.indexable ? `User-agent: *\nAllow: /\n\nSitemap: ${b.site.url}/sitemap.xml\n` : `User-agent: *\nDisallow: /\n`
  );

  log(`Built ${site.pages().length} pages in ${Date.now() - t0} ms → dist/`);
}

// Fallback social image: brand lockup over the workshop drawing (no system fonts needed)
async function makeOg(out, heroSource) {
  const p = JSON.parse(await readFile(rel("assets/brand/logo-paths.json"), "utf8"));
  const lockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${p.width} 48"><g fill="#3CCFC0">${p.mark}</g><path fill="#ECE9E2" transform="translate(${p.wordX} ${24 - 17 / 2}) scale(${p.wordScale})" d="${p.word}"/></svg>`;
  const hero = await sharp(heroSource).resize(1200, 630, { fit: "cover" }).grayscale().linear(1.35, -30).modulate({ brightness: 0.55 }).png().toBuffer();
  const logo = await sharp(Buffer.from(lockup), { density: 600 }).resize({ height: 56 }).png().toBuffer();
  await sharp(hero).composite([{ input: logo, left: 64, top: 64 }]).png().toFile(out);
}

// ------------------------------------------------------------------ images
const PHOTO_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const WIDTHS = [480, 800, 1200, 1600, 2400];

async function sourceFor(name, cfg, files, log) {
  // 1. the owner's own photo in assets/images wins
  const own = PHOTO_EXT.map((e) => name + e).find((f) => files.includes(f));
  if (own) return { file: rel("assets/images", own), credit: null };
  // 2. a library photograph from Wikimedia Commons, downloaded once into .cache/remote
  if (cfg.remote) {
    const cached = path.join(CACHE, "remote", `${name}.jpg`);
    if (!existsSync(cached)) {
      try {
        const res = await fetch(cfg.remote, { headers: { "User-Agent": "HalfshaftSiteBuild/1.0 (static site build; images credited in footer)" }, redirect: "follow" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await mkdir(path.dirname(cached), { recursive: true });
        await writeFile(cached, Buffer.from(await res.arrayBuffer()));
        log(`Downloaded ${name} from Wikimedia Commons`);
      } catch (e) {
        log(`Could not download ${name} (${e.message}); using a neutral stand-in`);
      }
    }
    if (existsSync(cached)) return { file: cached, credit: cfg.credit ?? null };
  }
  // 3. offline fallback: a flat concrete-grey frame so the build still completes
  const flat = path.join(CACHE, "remote", `${name}-flat.png`);
  if (!existsSync(flat)) {
    await mkdir(path.dirname(flat), { recursive: true });
    await sharp({ create: { width: 2400, height: 1600, channels: 3, background: "#8f8b84" } }).png().toFile(flat);
  }
  return { file: flat, credit: null };
}

async function processImages(log) {
  const dir = rel("assets/images");
  const files = await readdir(dir);
  const config = JSON.parse(await readFile(path.join(dir, "images.json"), "utf8"));
  const names = Object.keys(config);
  const manifest = {};
  await mkdir(path.join(DIST, "img"), { recursive: true });
  for (const name of names) {
    const cfg = config[name] ?? {};
    const { file: src, credit } = await sourceFor(name, cfg, files, log);
    const srcStat = await stat(src);
    const fullBuf = await sharp(src).rotate().toBuffer();
    const full = await sharp(fullBuf).metadata();
    const variants = { main: { region: null, aspect: full.width / full.height } };
    if (cfg.narrow) variants.narrow = { region: cropRegion(full, cfg.narrow), aspect: cfg.narrow.aspect };

    manifest[name] = { name, ...(credit ? { credit } : {}) };
    for (const [vName, v] of Object.entries(variants)) {
      const regionW = v.region ? v.region.width : full.width;
      let widths = WIDTHS.filter((w) => w <= regionW);
      if (!widths.length) widths = [regionW];
      const suffix = vName === "main" ? "" : `-${vName}`;
      for (const w of widths) {
        const outName = `${name}${suffix}-${w}.webp`;
        const cached = path.join(IMG_CACHE, outName);
        const fresh = existsSync(cached) && (await stat(cached)).mtimeMs > srcStat.mtimeMs;
        if (!fresh) {
          let pipe = sharp(fullBuf);
          if (v.region) pipe = pipe.extract(v.region);
          await pipe.resize({ width: w }).webp({ quality: 78, effort: 5 }).toFile(cached);
        }
        await copyFile(cached, path.join(DIST, "img", outName));
      }
      const top = widths[widths.length - 1];
      manifest[name][vName] = {
        width: top,
        height: Math.round(top / (v.region ? v.region.width / v.region.height : v.aspect)),
        widths,
        pattern: `/img/${name}${suffix}-{w}.webp`,
      };
    }
    manifest[name].source = src;
  }
  log(`Images: ${names.length} photographs`);
  return manifest;
}

function cropRegion(meta, { aspect, focusX = 0.5, focusY = 0.5, scale = 1 }) {
  // largest region with the given aspect (w/h), optionally zoomed in by `scale`, centred on the focus point
  let width = meta.width, height = Math.round(width / aspect);
  if (height > meta.height) {
    height = meta.height;
    width = Math.round(height * aspect);
  }
  width = Math.round(width / scale);
  height = Math.round(height / scale);
  const left = Math.min(Math.max(0, Math.round(meta.width * focusX - width / 2)), meta.width - width);
  const top = Math.min(Math.max(0, Math.round(meta.height * focusY - height / 2)), meta.height - height);
  return { left, top, width, height };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  });
}
