// Builds assets/brand/og.png (1200×630 social preview). Needs Inter installed for the headline.
import sharp from "sharp";
import { readFileSync } from "node:fs";
const lock = readFileSync("assets/brand/halfshaft-lockup-on-dark.svg", "utf8");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#121517"/>
<text x="72" y="300" font-family="Inter Display" font-weight="800" font-size="76" letter-spacing="-2.5" fill="#ECE9E2">Автосервіс</text>
<text x="72" y="382" font-family="Inter Display" font-weight="800" font-size="76" letter-spacing="-2.5" fill="#ECE9E2">у Вінниці</text>
<text x="72" y="468" font-family="Inter" font-weight="400" font-size="28" fill="#A4ABB0">ТО, діагностика, ходова, гібриди.</text>
<text x="72" y="510" font-family="Inter" font-weight="400" font-size="28" fill="#A4ABB0">Ціну узгоджуємо до початку робіт.</text>
<rect x="72" y="560" width="120" height="6" rx="3" fill="#3CCFC0"/>
</svg>`;
const hero = await sharp("assets/images/hero-bay.svg", { density: 72 }).resize(840).extract({ left: 160, top: 70, width: 520, height: 440 }).png().toBuffer();
const logo = await sharp(Buffer.from(lock), { density: 300 }).resize({ height: 52 }).png().toBuffer();
await sharp(Buffer.from(svg))
  .composite([{ input: hero, left: 640, top: 96, blend: "lighten" }, { input: logo, left: 72, top: 72 }])
  .png()
  .toFile("assets/brand/og.png");
console.log("og.png done");
