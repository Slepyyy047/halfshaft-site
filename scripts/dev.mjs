// Build, serve, and rebuild on changes in src/ and assets/.
import { watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "./build.mjs";
import { serve } from "./serve.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await build();
serve();
let timer, running = false, again = false;
const rebuild = async () => {
  if (running) return void (again = true);
  running = true;
  try {
    await build({ quiet: true });
    console.log(`Rebuilt ${new Date().toLocaleTimeString()}`);
  } catch (e) {
    console.error(e.message ?? e);
  }
  running = false;
  if (again) { again = false; rebuild(); }
};
for (const dir of ["src", "assets"]) {
  watch(path.join(ROOT, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 150);
  });
}
console.log("Watching src/ and assets/ …");
