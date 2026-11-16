// Local static server with the same URL rules as production hosting:
// /pricing -> pricing.html, /services/brake-pads -> services/brake-pads.html, unknown -> 404.html (status 404).
// Usage: node scripts/serve.mjs [port]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml",
  ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", 
  ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon",
};

async function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/\/+$/, "") || "/";
  if (clean.includes("..")) return null;
  const candidates = clean === "/" ? ["index.html"] : [clean.slice(1), `${clean.slice(1)}.html`, `${clean.slice(1)}/index.html`];
  for (const c of candidates) {
    const file = path.join(DIST, c);
    try {
      if ((await stat(file)).isFile()) return file;
    } catch {}
  }
  return null;
}

export function serve(port = Number(process.env.PORT) || 4321) {
  const server = createServer(async (req, res) => {
    // canonical URLs: /pricing.html -> /pricing, /pricing/ -> /pricing
    const u = new URL(req.url, "http://x");
    if (u.pathname !== "/" && (u.pathname.endsWith(".html") || u.pathname.endsWith("/"))) {
      const target = u.pathname.replace(/\.html$/, "").replace(/\/+$/, "").replace(/\/index$/, "") || "/";
      res.writeHead(301, { Location: target + u.search });
      return res.end();
    }
    const file = await resolve(u.pathname);
    const status = file ? 200 : 404;
    const body = await readFile(file ?? path.join(DIST, "404.html"));
    const ext = path.extname(file ?? "x.html");
    res.writeHead(status, {
      "Content-Type": TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": file && /\/assets\/|\/img\/|\/fonts\//.test(file) ? "public, max-age=31536000, immutable" : "no-cache",
    });
    res.end(body);
  });
  server.listen(port, () => console.log(`Halfshaft: http://localhost:${port}`));
  return server;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) serve(Number(process.argv[2]) || undefined);
