// Generates the placeholder workshop drawings in assets/images/*.svg.
// They are line drawings in the brand palette and stand in for photographs.
// To use real photos, drop e.g. assets/images/brakes.jpg next to brakes.svg:
// the build prefers .jpg/.jpeg/.png/.webp over .svg with the same name.
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = process.argv[2] ?? "assets/images";
mkdirSync(OUT, { recursive: true });

const C = {
  bg: "#171B1E",
  glow: "#232A2E",
  grid: "#1F2528",
  line: "#D9D5CC",
  dim: "#69737A",
  teal: "#3CCFC0",
  fill: "#1B2023",
  fill2: "#232A2E",
};

const f = (n) => Math.round(n * 10) / 10;

function frame(w, h, body, { cx = w / 2, cy = h / 2, grid = 48 } = {}) {
  let g = "";
  for (let x = grid; x < w; x += grid) g += `M${x} 0V${h}`;
  for (let y = grid; y < h; y += grid) g += `M0 ${y}H${w}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs><radialGradient id="glow" cx="${f(cx / w)}" cy="${f(cy / h)}" r="0.65"><stop offset="0" stop-color="${C.glow}"/><stop offset="1" stop-color="${C.bg}"/></radialGradient></defs>
<rect width="${w}" height="${h}" fill="url(#glow)"/>
<path d="${g}" stroke="${C.grid}" stroke-width="1" fill="none" opacity="0.7"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</g>
</svg>`;
}

const S = (w = 3, c = C.line) => `stroke="${c}" stroke-width="${w}"`;
const ln = (x1, y1, x2, y2, s = S()) => `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}" ${s}/>`;
const circ = (cx, cy, r, s = S(), fill = "none") => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" ${s} fill="${fill}"/>`;
const rect = (x, y, w, h, rx = 0, s = S(), fill = "none") =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}" ${s} fill="${fill}"/>`;

// Dimension line with end ticks (technical-drawing style)
function dimV(x, y1, y2, c = C.teal) {
  return `<path d="M${x} ${y1}V${y2}M${x - 14} ${y1}H${x + 14}M${x - 14} ${y2}H${x + 14}" stroke="${c}" stroke-width="2" stroke-dasharray="10 8"/>`;
}
function dimH(y, x1, x2, c = C.dim) {
  return `<path d="M${x1} ${y}H${x2}M${x1} ${y - 14}V${y + 14}M${x2} ${y - 14}V${y + 14}" stroke="${c}" stroke-width="2"/>`;
}
function ground(y, x1, x2) {
  let hatch = "";
  for (let x = x1; x < x2; x += 36) hatch += `M${x} ${y + 6}l-22 26`;
  return `<path d="M${x1} ${y}H${x2}" ${S(3)}/><path d="${hatch}" ${S(1.5, C.dim)}/>`;
}

function wheel(cx, cy, r) {
  let spokes = "";
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 - 90) * (Math.PI / 180);
    spokes += `M${f(cx + Math.cos(a) * r * 0.2)} ${f(cy + Math.sin(a) * r * 0.2)}L${f(cx + Math.cos(a) * r * 0.62)} ${f(cy + Math.sin(a) * r * 0.62)}`;
  }
  return (
    circ(cx, cy, r, S(3), C.fill) +
    circ(cx, cy, r * 0.66, S(2.5)) +
    `<path d="${spokes}" ${S(2.5)}/>` +
    circ(cx, cy, r * 0.16, S(3, C.teal), C.fill)
  );
}

// ---------------------------------------------------------------- hero bay
function heroBay() {
  const w = 2400, h = 1500, floor = 1260;
  const lift = 230; // how high the car is raised
  const oy = -lift; // car offset
  const car = (y) => y + oy + 90;
  const body = `M640 ${car(930)}L640 ${car(845)}Q644 ${car(800)} 690 ${car(792)}L905 ${car(765)}Q975 ${car(758)} 1030 ${car(742)}L1190 ${car(652)}Q1205 ${car(645)} 1225 ${car(644)}L1450 ${car(642)}Q1470 ${car(643)} 1484 ${car(652)}L1600 ${car(732)}L1725 ${car(752)}Q1752 ${car(758)} 1752 ${car(790)}L1750 ${car(900)}L1748 ${car(930)}L1652 ${car(930)}A132 132 0 0 0 1388 ${car(930)}L1003 ${car(930)}A132 132 0 0 0 739 ${car(930)}Z`;
  const glass = `M1052 ${car(760)}L1196 ${car(672)}L1316 ${car(668)}L1316 ${car(756)}ZM1336 ${car(756)}L1336 ${car(668)}L1450 ${car(667)}L1566 ${car(750)}Z`;
  const doors = `M1046 ${car(772)}L1046 ${car(918)}M1326 ${car(760)}L1326 ${car(918)}M1590 ${car(752)}L1590 ${car(900)}M1120 ${car(790)}h46M1400 ${car(790)}h46`;
  let tools = "";
  for (let i = 0; i < 4; i++) tools += rect(352, 1018 + i * 58, 176, 46, 4, S(2.5));
  for (let i = 0; i < 4; i++) tools += ln(420, 1041 + i * 58, 460, 1041 + i * 58, S(3));
  return frame(
    w, h,
    // bay opening
    `<path d="M240 ${floor}V170H2160V${floor}" ${S(5)}/>
     <path d="M276 ${floor}V206H2124V${floor}" ${S(2, C.dim)}/>
     ${rect(700, 224, 380, 22, 11, S(2), C.fill2)}${rect(1320, 224, 380, 22, 11, S(2), C.fill2)}
     <path d="M890 246V280M1510 246V280" ${S(1.5, C.dim)}/>
     <g transform="translate(1200 ${floor}) scale(1.24) translate(-1200 -${floor})">
     <!-- lift post behind the car -->
     ${rect(1176, 520, 64, floor - 520, 4, S(3), C.fill)}
     ${rect(1160, floor - 18, 96, 18, 2, S(3), C.fill)}
     ${ln(1208, 550, 1208, floor - 30, S(1.5, C.dim))}
     ${rect(1150, car(930) + 6, 116, 64, 6, S(3), C.fill2)}
     <!-- car -->
     <path d="${body}" ${S(3.5)} fill="${C.fill}"/>
     <path d="${glass}" ${S(2.5)} fill="${C.fill2}"/>
     <path d="${doors}" ${S(2.5)}/>
     <path d="M652 ${car(820)}h46M1716 ${car(780)}h26" ${S(3)}/>
     ${wheel(871, car(930), 112)}${wheel(1520, car(930), 112)}
     <!-- lift arms and pads -->
     <path d="M990 ${car(948)}H1420" ${S(4)}/>
     ${rect(966, car(932), 56, 16, 3, S(3, C.teal), C.fill)}${rect(1392, car(932), 56, 16, 3, S(3, C.teal), C.fill)}
     ${dimV(1850, car(930) + 112, floor)}
     </g>
     ${ground(floor, 240, 2160)}
     ${tools}${rect(340, 1006, 200, floor - 1006, 6, S(3))}`,
    { cx: 1200, cy: 700 }
  );
}

// ---------------------------------------------------------------- brakes
function brakes() {
  const w = 1600, h = 1200, cx = 680, cy = 620, R = 340;
  let holes = "";
  for (let ring = 0; ring < 3; ring++) {
    const rr = 215 + ring * 38;
    for (let i = 0; i < 12; i++) {
      const a = ((i * 30 + ring * 10) * Math.PI) / 180;
      holes += circ(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 7, S(2));
    }
  }
  let lugs = "";
  for (let i = 0; i < 5; i++) {
    const a = ((i * 72 - 90) * Math.PI) / 180;
    lugs += circ(cx + Math.cos(a) * 92, cy + Math.sin(a) * 92, 16, S(2.5));
  }
  // caliper as thick arc over the top-right
  const arc = (r, a0, a1) => {
    const p = (a) => [cx + Math.cos((a * Math.PI) / 180) * r, cy + Math.sin((a * Math.PI) / 180) * r];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return { x0, y0, x1, y1 };
  };
  const o = arc(R + 34, -70, 0), i = arc(R - 110, -70, 0);
  const caliper = `M${f(o.x0)} ${f(o.y0)}A${R + 34} ${R + 34} 0 0 1 ${f(o.x1)} ${f(o.y1)}L${f(i.x1)} ${f(i.y1)}A${R - 110} ${R - 110} 0 0 0 ${f(i.x0)} ${f(i.y0)}Z`;
  return frame(
    w, h,
    `${circ(cx, cy, R, S(3.5), C.fill)}${circ(cx, cy, R - 24, S(1.5, C.dim))}${circ(cx, cy, 160, S(3), C.fill2)}
     ${holes}${lugs}${circ(cx, cy, 44, S(3))}
     <path d="${caliper}" ${S(3.5, C.teal)} fill="${C.fill}"/>
     <path d="M${f(o.x0 + 18)} ${f(o.y0 + 40)}l30 -12M${f(o.x1 - 40)} ${f(o.y1 - 30)}l12 30" ${S(2, C.teal)}/>
     ${dimH(1040, cx - R, cx + R)}
     <!-- loose pad -->
     <g transform="translate(1150 380) rotate(-8)">
       <path d="M0 40Q0 0 40 0H230Q270 0 270 40V150Q270 190 230 190H40Q0 190 0 150Z" ${S(3)} fill="${C.fill}"/>
       <path d="M24 56Q24 30 50 30H220Q246 30 246 56V140Q246 166 220 166H50Q24 166 24 140Z" ${S(2.5, C.teal)}/>
       <path d="M135 30V166" ${S(2, C.teal)}/>
       ${dimV(310, 30, 166, C.dim)}
     </g>
     <g transform="translate(1150 700) rotate(6)">
       <path d="M0 40Q0 0 40 0H230Q270 0 270 40V150Q270 190 230 190H40Q0 190 0 150Z" ${S(3)} fill="${C.fill}"/>
       <path d="M24 120H246V140Q246 166 220 166H50Q24 166 24 140Z" ${S(2.5)}/>
     </g>`,
    { cx: 760, cy: 600 }
  );
}

// ---------------------------------------------------------------- suspension
function suspension() {
  const w = 1600, h = 1200, x = 640;
  let coil = "";
  const top = 300, bottom = 720, turns = 7, rw = 150;
  for (let i = 0; i < turns; i++) {
    const y0 = top + ((bottom - top) / turns) * i;
    const y1 = y0 + (bottom - top) / turns;
    coil += `M${x - rw} ${f(y0 + 14)}Q${x} ${f(y0 - 22)} ${x + rw} ${f(y0 + 14)}`;
    coil += `M${x + rw} ${f(y0 + 14)}Q${x} ${f(y1 + 50)} ${x - rw} ${f(y1 + 14)}`;
  }
  return frame(
    w, h,
    `${rect(x - 170, 230, 340, 60, 30, S(3), C.fill2)}${ln(x, 160, x, 230, S(4))}${circ(x, 160, 18, S(3))}
     ${rect(x - 22, 290, 44, 330, 6, S(3), C.fill)}
     ${rect(x - 64, 600, 128, 330, 14, S(3.5), C.fill)}
     <path d="${coil}" ${S(3.5, C.teal)}/>
     ${rect(x - 170, 720, 340, 30, 10, S(3), C.fill2)}
     <path d="M${x - 64} 930L${x - 90} 1010H${x + 120}L${x + 64} 930" ${S(3)} fill="${C.fill}"/>
     ${circ(x + 40, 1000, 20, S(3))}
     <!-- lower control arm -->
     <path d="M${x + 60} 1000L1260 900L1290 1010L${x + 80} 1040Z" ${S(3)} fill="${C.fill}"/>
     ${circ(1275, 955, 44, S(3.5, C.teal), C.fill2)}${circ(1275, 955, 18, S(3))}
     ${circ(x + 70, 1020, 30, S(3.5, C.teal), C.fill2)}
     <path d="M1060 520v-170M1036 374l24-24 24 24M1060 560v120M1036 656l24 24 24-24" ${S(3, C.dim)}/>
     ${ground(1110, 200, 1400)}`,
    { cx: 760, cy: 620 }
  );
}

// ---------------------------------------------------------------- tires
function tires() {
  const w = 1600, h = 1200, cx = 640, cy = 600, R = 400;
  let tread = "";
  for (let i = 0; i < 48; i++) {
    const a = ((i * 7.5) * Math.PI) / 180;
    const a2 = (((i * 7.5) + 3.2) * Math.PI) / 180;
    tread += `M${f(cx + Math.cos(a) * R)} ${f(cy + Math.sin(a) * R)}L${f(cx + Math.cos(a2) * (R - 36))} ${f(cy + Math.sin(a2) * (R - 36))}`;
  }
  let spokes = "";
  for (let i = 0; i < 10; i++) {
    const a = ((i * 36) * Math.PI) / 180, b = (((i * 36) + 9) * Math.PI) / 180;
    spokes += `M${f(cx + Math.cos(a) * 70)} ${f(cy + Math.sin(a) * 70)}L${f(cx + Math.cos(a) * 225)} ${f(cy + Math.sin(a) * 225)}L${f(cx + Math.cos(b) * 225)} ${f(cy + Math.sin(b) * 225)}L${f(cx + Math.cos(b) * 70)} ${f(cy + Math.sin(b) * 70)}`;
  }
  // tread section with depth gauge
  let blocks = "";
  for (let i = 0; i < 6; i++) blocks += rect(1140 + i * 52, 430, 40, 64, 4, S(2.5));
  return frame(
    w, h,
    `${circ(cx, cy, R, S(3.5), C.fill)}<path d="${tread}" ${S(2.5)}/>${circ(cx, cy, R - 44, S(2, C.dim))}
     ${circ(cx, cy, 250, S(3), C.fill2)}${circ(cx, cy, 236, S(1.5, C.dim))}
     <path d="${spokes}" ${S(2.5)}/>${circ(cx, cy, 62, S(3, C.teal), C.fill)}${circ(cx, cy, 22, S(3))}
     ${rect(1120, 494, 340, 120, 18, S(3), C.fill)}${blocks}
     <path d="M1300 300V470" ${S(4, C.teal)}/>${rect(1270, 250, 60, 60, 8, S(3, C.teal), C.fill)}
     ${dimV(1500, 430, 494, C.teal)}
     ${ground(1030, 180, 1460)}`,
    { cx: 760, cy: 600 }
  );
}

// ---------------------------------------------------------------- maintenance
function maintenance() {
  const w = 1600, h = 1200;
  let flutes = "";
  for (let i = 0; i < 9; i++) flutes += ln(520 + i * 30, 470, 520 + i * 30, 860, S(2));
  return frame(
    w, h,
    `<!-- oil filter -->
     <path d="M480 430Q480 400 510 400H790Q820 400 820 430V880Q820 910 790 910H510Q480 910 480 880Z" ${S(3.5)} fill="${C.fill}"/>
     ${flutes}${rect(470, 380, 360, 44, 10, S(3, C.teal), C.fill2)}
     <!-- jug -->
     <path d="M960 520L1010 430H1180L1230 470V900Q1230 930 1200 930H990Q960 930 960 900Z" ${S(3.5)} fill="${C.fill}"/>
     ${rect(1000, 380, 90, 50, 8, S(3), C.fill2)}
     <path d="M1230 520H1290Q1320 520 1320 550V700Q1320 730 1290 730H1230" ${S(3)}/>
     <path d="M970 700H1230" ${S(2, C.dim)}/><path d="M960 700V900Q960 930 990 930H1200Q1230 930 1230 900V700" ${S(3, C.teal)}/>
     <!-- dipstick -->
     <path d="M300 260L300 980" ${S(4)}/>${circ(300, 230, 30, S(3.5, C.teal))}
     <path d="M280 860H320M280 920H320" ${S(3, C.teal)}/>${dimV(360, 860, 920, C.dim)}
     ${ground(990, 200, 1420)}`,
    { cx: 800, cy: 640 }
  );
}

// ---------------------------------------------------------------- diagnostics
function diagnostics() {
  const w = 1600, h = 1200;
  let wave = "M560 520";
  for (let i = 0; i <= 24; i++) wave += `L${560 + i * 18} ${f(520 + Math.sin(i * 0.9) * (i % 6 === 0 ? 60 : 26))}`;
  let ticks = "";
  for (let i = 0; i <= 10; i++) {
    const a = ((200 + i * 14) * Math.PI) / 180;
    ticks += `M${f(1150 + Math.cos(a) * 190)} ${f(760 + Math.sin(a) * 190)}L${f(1150 + Math.cos(a) * 160)} ${f(760 + Math.sin(a) * 160)}`;
  }
  return frame(
    w, h,
    `<!-- scanner -->
     ${rect(460, 330, 500, 640, 40, S(3.5), C.fill)}${rect(510, 390, 400, 280, 14, S(2.5), C.fill2)}
     <path d="${wave}" ${S(3, C.teal)}/>
     ${circ(600, 790, 34, S(3))}${circ(710, 790, 34, S(3))}${circ(820, 790, 34, S(3))}
     ${rect(560, 880, 300, 30, 15, S(2.5))}
     <!-- cable + connector -->
     <path d="M710 970C710 1080 300 1040 300 900V700" ${S(4)}/>
     <path d="M240 560H360L380 700H220Z" ${S(3.5, C.teal)} fill="${C.fill}"/>
     <path d="M260 600h80M265 640h70" ${S(2, C.teal)}/>
     <!-- gauge -->
     <path d="M${f(1150 + Math.cos(200 * Math.PI / 180) * 210)} ${f(760 + Math.sin(200 * Math.PI / 180) * 210)}A210 210 0 0 1 ${f(1150 + Math.cos(340 * Math.PI / 180) * 210)} ${f(760 + Math.sin(340 * Math.PI / 180) * 210)}" ${S(3.5)}/>
     <path d="${ticks}" ${S(2.5)}/><path d="M1150 760L1260 640" ${S(4, C.teal)}/>${circ(1150, 760, 16, S(3), C.fill2)}
     <!-- engine warning glyph -->
     <path d="M1080 860h40v-16h50l20 16h24v-14h16v54h-16v-12h-20l-14 22h-80v-16h-20v-34z" ${S(3, C.teal)}/>`,
    { cx: 820, cy: 620 }
  );
}

// ---------------------------------------------------------------- climate
function climate() {
  const w = 1600, h = 1200;
  let fins = "";
  for (let x = 330; x <= 830; x += 20) fins += `M${x} 340V860`;
  let blades = "";
  for (let i = 0; i < 7; i++) {
    const a = (i * 360) / 7;
    blades += `<path d="M0 -40C40 -120 110 -150 150 -110C120 -60 70 -40 0 -40Z" transform="translate(1150 600) rotate(${a})" ${S(3)} fill="${C.fill2}"/>`;
  }
  return frame(
    w, h,
    `${rect(300, 300, 560, 600, 12, S(3.5), C.fill)}<path d="${fins}" ${S(1.5, C.dim)}/>
     ${rect(270, 300, 30, 600, 6, S(3), C.fill2)}${rect(860, 300, 30, 600, 6, S(3), C.fill2)}
     <path d="M875 340C960 340 960 200 1100 200H1300" ${S(5, C.teal)}/>
     <path d="M285 860C200 860 200 1000 360 1000H700" ${S(5, C.teal)}/>
     ${circ(1150, 600, 200, S(3.5), C.fill)}${blades}${circ(1150, 600, 42, S(3), C.fill)}
     ${circ(1150, 600, 230, S(1.5, C.dim))}`,
    { cx: 800, cy: 600 }
  );
}

// ---------------------------------------------------------------- hybrid
function hybrid() {
  const w = 1600, h = 1200;
  let cells = "";
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 8; c++) cells += rect(330 + c * 112, 420 + r * 92, 96, 76, 10, S(2.5), C.fill2);
  return frame(
    w, h,
    `${rect(290, 380, 980, 420, 22, S(3.5), C.fill)}${cells}
     <path d="M290 840H1270" ${S(5, C.teal)}/><path d="M330 840V880M1230 840V880" ${S(3, C.teal)}/>
     <path d="M310 870C260 870 230 920 230 980" ${S(5, C.teal)}/>
     ${rect(1300, 500, 120, 180, 18, S(3.5), C.fill2)}${circ(1360, 560, 18, S(3, C.teal))}${circ(1360, 620, 18, S(3, C.teal))}
     <path d="M1420 590C1500 590 1500 760 1420 840H1300" ${S(4)}/>
     ${dimH(330, 290, 1270)}
     ${ground(1000, 200, 1450)}`,
    { cx: 800, cy: 600 }
  );
}

// ---------------------------------------------------------------- electrical
function electrical() {
  const w = 1600, h = 1200;
  return frame(
    w, h,
    `${rect(300, 460, 620, 440, 24, S(3.5), C.fill)}${rect(300, 460, 620, 80, 24, S(3), C.fill2)}
     ${rect(380, 400, 90, 60, 8, S(3), C.fill2)}${rect(750, 400, 90, 60, 8, S(3), C.fill2)}
     <path d="M405 430h40M425 410v40" ${S(3, C.teal)}/><path d="M775 430h40" ${S(3)}/>
     <path d="M360 620H860M360 680H860M360 740H860" ${S(1.5, C.dim)}/>
     <!-- multimeter -->
     ${rect(1060, 300, 300, 520, 34, S(3.5), C.fill)}${rect(1100, 350, 220, 130, 12, S(2.5), C.fill2)}
     <path d="M1130 440V400M1160 440V390M1190 440V410M1220 440V380M1250 440V400" ${S(4, C.teal)}/>
     ${circ(1210, 620, 70, S(3))}<path d="M1210 620L1250 570" ${S(3)}/>
     ${circ(1140, 760, 16, S(3))}${circ(1280, 760, 16, S(3, C.teal))}
     <path d="M1280 776C1280 900 700 980 425 470" ${S(3.5, C.teal)}/>
     <path d="M1140 776C1140 960 860 1000 795 470" ${S(3.5)}/>
     ${ground(990, 200, 1450)}`,
    { cx: 800, cy: 600 }
  );
}

// ---------------------------------------------------------------- about / workshop
function workshop() {
  const w = 1600, h = 1200;
  let peg = "";
  for (let y = 180; y < 620; y += 40) for (let x = 220; x < 1380; x += 40) peg += `M${x} ${y}h0.1`;
  const wrench = (x, len, s) =>
    `<g transform="translate(${x} 230)"><path d="M0 0L0 ${len}" ${S(s * 5)}/>${circ(0, 0, s * 9, S(3), C.fill)}${circ(0, len + 8, s * 7, S(3), C.fill)}</g>`;
  let wrenches = "";
  [10, 12, 14, 16, 18].forEach((n, i) => (wrenches += wrench(300 + i * 70, 200 + i * 30, 0.8 + i * 0.12)));
  return frame(
    w, h,
    `${rect(200, 160, 1200, 480, 10, S(3), C.fill)}<path d="${peg}" stroke="${C.dim}" stroke-width="6" stroke-linecap="round"/>
     ${wrenches}
     <!-- screwdrivers -->
     ${[0, 1, 2].map((i) => `${rect(760 + i * 70, 220, 34, 110, 14, S(3, i === 1 ? C.teal : C.line), C.fill2)}${ln(777 + i * 70, 330, 777 + i * 70, 470, S(4))}`).join("")}
     <!-- clipboard with job card -->
     <g transform="translate(1060 210) rotate(3)">
       ${rect(0, 0, 250, 340, 12, S(3), C.fill2)}${rect(80, -18, 90, 36, 8, S(3), C.fill)}
       ${[60, 110, 160, 210, 260].map((y, i) => `<path d="M30 ${y}l14 14 24 -28" ${S(3, i < 3 ? C.teal : C.dim)}/><path d="M90 ${y}H220" ${S(2, C.dim)}/>`).join("")}
     </g>
     <!-- bench -->
     ${rect(160, 700, 1280, 50, 8, S(3.5), C.fill2)}
     <path d="M220 750V1040M1380 750V1040M220 900H1380" ${S(3.5)}/>
     ${rect(980, 600, 260, 100, 10, S(3), C.fill)}<path d="M980 640H1240" ${S(2, C.dim)}/>
     ${rect(360, 610, 180, 90, 10, S(3, C.teal), C.fill)}
     ${ground(1040, 140, 1460)}`,
    { cx: 800, cy: 520 }
  );
}

const out = {
  "hero-bay": heroBay(),
  brakes: brakes(),
  suspension: suspension(),
  tires: tires(),
  maintenance: maintenance(),
  diagnostics: diagnostics(),
  climate: climate(),
  hybrid: hybrid(),
  electrical: electrical(),
  workshop: workshop(),
};
for (const [k, v] of Object.entries(out)) writeFileSync(`${OUT}/${k}.svg`, v);
console.log("wrote", Object.keys(out).length, "drawings");
