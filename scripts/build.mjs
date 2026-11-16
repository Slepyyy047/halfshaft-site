// Static build: renders every page to dist/, processes images, bundles CSS and client scripts.
// Usage: node scripts/build.mjs
import { build as esbuild } from "esbuild";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
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
  const localFonts = existsSync(rel("assets/fonts/inter-400.woff"));
  site.assets.fonts = localFonts ? "local" : "google";
  const problems = site.validateData();
  if (problems.length) throw new Error("Data problems:\n  " + problems.join("\n  "));

  // 2. Images (placeholder drawings are generated when the SVG sources are absent)
  if (!existsSync(rel("assets/images/hero-bay.svg")) && !existsSync(rel("assets/images/hero-bay.jpg"))) {
    execFileSync(process.execPath, [rel("tools/illustrations.mjs"), rel("assets/images")], { stdio: quiet ? "ignore" : "inherit" });
  }
  const manifest = await processImages(log);
  site.setImageManifest(manifest);

  // 3. CSS
  const css = await esbuild({
    stdin: { contents: `${localFonts ? '@import "./fonts.css";\n' : ""}@import "./index.css";`, resolveDir: rel("src/styles"), loader: "css" },
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
  if (localFonts) {
    await mkdir(path.join(DIST, "fonts"), { recursive: true });
    for (const f of await readdir(rel("assets/fonts"))) await copyFile(rel("assets/fonts", f), path.join(DIST, "fonts", f));
  }
  await copyFile(rel("assets/brand/favicon.svg"), path.join(DIST, "favicon.svg"));
  const fav = await readFile(rel("assets/brand/favicon.svg"));
  await sharp(fav, { density: 300 }).resize(32, 32).png().toFile(path.join(DIST, "favicon-32.png"));
  for (const s of [180, 192, 512]) {
    const name = s === 180 ? "apple-touch-icon.png" : `icon-${s}.png`;
    await sharp(fav, { density: 600 }).resize(s, s).flatten({ background: "#121517" }).png().toFile(path.join(DIST, name));
  }
  if (existsSync(rel("assets/brand/og.png"))) await copyFile(rel("assets/brand/og.png"), path.join(DIST, "og.png"));
  else await makeOg(path.join(DIST, "og.png"));

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
async function makeOg(out) {
  const p = JSON.parse(await readFile(rel("assets/brand/logo-paths.json"), "utf8"));
  const lockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${p.width} 48"><g fill="#3CCFC0">${p.mark}</g><path fill="#ECE9E2" transform="translate(${p.wordX} ${24 - 17 / 2}) scale(${p.wordScale})" d="${p.word}"/></svg>`;
  const hero = await sharp(rel("assets/images/hero-bay.svg"), { density: 72 }).resize(1200, 630, { fit: "cover" }).modulate({ brightness: 0.5 }).png().toBuffer();
  const logo = await sharp(Buffer.from(lockup), { density: 600 }).resize({ height: 56 }).png().toBuffer();
  await sharp(hero).composite([{ input: logo, left: 64, top: 64 }]).png().toFile(out);
}

// ------------------------------------------------------------------ images
const PHOTO_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const WIDTHS = [480, 800, 1200, 1600, 2400];

async function processImages(log) {
  const dir = rel("assets/images");
  const files = await readdir(dir);
  const config = JSON.parse(await readFile(path.join(dir, "images.json"), "utf8"));
  const names = [...new Set(files.filter((f) => /\.(svg|jpe?g|png|webp)$/i.test(f)).map((f) => f.replace(/\.[^.]+$/, "")))];
  const manifest = {};
  await mkdir(path.join(DIST, "img"), { recursive: true });
  for (const name of names) {
    const photo = PHOTO_EXT.map((e) => name + e).find((f) => files.includes(f));
    const src = path.join(dir, photo ?? `${name}.svg`);
    const srcStat = await stat(src);
    const opts = photo ? {} : { density: 144 };
    let base = sharp(src, opts);
    let meta = await base.metadata();
    // render SVG at the largest width we need
    if (!photo && meta.width < 2400) {
      base = sharp(src, { density: Math.round((72 * 2400) / meta.width) });
      meta = await base.metadata();
    }
    const fullBuf = await base.rotate().toBuffer();
    const full = await sharp(fullBuf).metadata();
    const cfg = config[name] ?? {};
    const variants = { main: { region: null, aspect: full.width / full.height } };
    if (cfg.narrow) variants.narrow = { region: cropRegion(full, cfg.narrow), aspect: cfg.narrow.aspect };

    manifest[name] = { name };
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
          await pipe.resize({ width: w }).webp({ quality: photo ? 78 : 86, effort: 5 }).toFile(cached);
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
  }
  log(`Images: ${names.length} sources`);
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
