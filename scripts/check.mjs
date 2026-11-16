// Post-build checks: every internal link and asset in dist/ resolves, data is consistent.
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "./build.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
await build({ quiet: true });

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}
const exists = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };
async function resolves(url) {
  const clean = url.split(/[?#]/)[0];
  if (clean === "" || clean === "/") return exists(path.join(DIST, "index.html"));
  const rel = clean.replace(/^\//, "");
  return (await exists(path.join(DIST, rel))) || (await exists(path.join(DIST, rel + ".html")));
}

const html = (await walk(DIST)).filter((f) => f.endsWith(".html"));
const problems = [];
for (const file of html) {
  const src = await readFile(file, "utf8");
  const ids = new Set([...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of src.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    if (url.startsWith("#")) {
      if (url.length > 1 && !ids.has(url.slice(1))) problems.push(`${path.relative(DIST, file)}: missing anchor ${url}`);
      continue;
    }
    if (!(await resolves(url))) problems.push(`${path.relative(DIST, file)}: broken ${url}`);
  }
  for (const m of src.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of m[1].split(",")) {
      const u = part.trim().split(" ")[0];
      if (!(await resolves(u))) problems.push(`${path.relative(DIST, file)}: broken image ${u}`);
    }
  }
  if (!/<title>[^<]+<\/title>/.test(src)) problems.push(`${path.relative(DIST, file)}: no <title>`);
  if ((src.match(/<h1[\s>]/g) ?? []).length !== 1) problems.push(`${path.relative(DIST, file)}: expected exactly one <h1>`);
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`OK: ${html.length} pages, links and images resolve.`);
