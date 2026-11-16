// /pricing: search, category filters, empty state, and the "your estimate" selection dock.
import { prices, unitLabel, unitMaxQty } from "../data/prices";
import { categories } from "../data/services";
import { estimate, estimateText } from "../lib/estimate";
import { priceText, uah, formatAmount, plural } from "../lib/format";
import { iconSvg } from "../components/Icon";
import { readSelection, writeSelection, onSelection, type Sel } from "./selection";
import type { PriceItem } from "../data/types";

const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const $$ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const root = $("[data-pricing]");
const input = $<HTMLInputElement>("[data-search]");
const clearBtn = $<HTMLButtonElement>("[data-search-clear]");
const chips = $$<HTMLButtonElement>("[data-cat-filter]");
const rows = $$("[data-price-row]");
const groups = $$("[data-group]");
const empty = $("[data-empty]");
const emptyText = $("[data-empty-text]");
const status = $("[data-result-status]");
const byId = new Map(prices.map((p) => [p.id, p]));

// ------------------------------------------------------------------ filtering
const params = new URLSearchParams(location.search);
let q = params.get("q") ?? "";
let cat = categories.some((c) => c.id === params.get("cat")) ? params.get("cat")! : "all";
input.value = q;

const norm = (s: string) => s.toLowerCase().replace(/ʼ|’|'/g, "").replace(/ё/g, "е").trim();
const matches = (row: HTMLElement, tokens: string[]) => {
  const hay = norm(row.dataset.search ?? "");
  return tokens.every((t) => hay.includes(t));
};

function apply({ animate = true } = {}) {
  const tokens = norm(q).split(/\s+/).filter(Boolean);
  const counts: Record<string, number> = { all: 0 };
  let shown = 0;
  for (const row of rows) {
    const textOk = matches(row, tokens);
    const c = row.dataset.cat!;
    if (textOk) {
      counts[c] = (counts[c] ?? 0) + 1;
      counts.all++;
    }
    const visible = textOk && (cat === "all" || cat === c);
    const was = !row.hidden;
    row.hidden = !visible;
    if (visible) {
      shown++;
      if (animate && !was && !reduceMotion()) {
        row.classList.remove("is-entering");
        void row.offsetWidth;
        row.classList.add("is-entering");
      }
    }
  }
  for (const g of groups) g.hidden = !g.querySelector("[data-price-row]:not([hidden])");
  for (const chip of chips) {
    const id = chip.dataset.catFilter!;
    chip.setAttribute("aria-pressed", String(id === cat));
    const n = counts[id] ?? 0;
    chip.querySelector(".count")!.textContent = String(n);
    chip.classList.toggle("is-zero", n === 0 && id !== cat);
  }
  empty.hidden = shown > 0;
  if (!shown) {
    const catName = categories.find((c) => c.id === cat)?.name;
    emptyText.textContent =
      (q ? `За запитом «${q}»` : "У цьому розділі") +
      (catName ? ` у розділі «${catName}»` : "") +
      " нічого немає. Спробуйте інше слово, скиньте фільтри або опишіть проблему в заявці, і ми почнемо з огляду.";
  }
  status.textContent = q || cat !== "all" ? `Показано ${shown} ${plural(shown, "позицію", "позиції", "позицій")} з ${rows.length}` : "";
  clearBtn.hidden = !q;

  const url = new URL(location.href);
  q ? url.searchParams.set("q", q) : url.searchParams.delete("q");
  cat !== "all" ? url.searchParams.set("cat", cat) : url.searchParams.delete("cat");
  history.replaceState(history.state, "", url);
}

let t = 0;
input.addEventListener("input", () => {
  window.clearTimeout(t);
  t = window.setTimeout(() => {
    q = input.value;
    apply();
  }, 120);
});
input.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && input.value) {
    e.preventDefault();
    q = input.value = "";
    apply();
  }
});
clearBtn.addEventListener("click", () => {
  q = input.value = "";
  apply();
  input.focus();
});
chips.forEach((chip) =>
  chip.addEventListener("click", () => {
    const id = chip.dataset.catFilter!;
    cat = cat === id && id !== "all" ? "all" : id;
    apply();
  })
);
$("[data-reset]").addEventListener("click", () => {
  q = input.value = "";
  cat = "all";
  apply();
  input.focus();
});

apply({ animate: false });
root.classList.add("is-ready");

// ------------------------------------------------------------------ selection dock
const dock = $("[data-dock]");
const dockToggle = $<HTMLButtonElement>("[data-dock-toggle]");
const dockPanel = $("[data-dock-panel]");
const dockCount = $("[data-dock-count]");
const dockTotal = $("[data-dock-total]");
const dockList = $("[data-dock-list]");
const dockQuotes = $("[data-dock-quotes]");
const dockQuoteList = $("[data-dock-quote-list]");
const dockSum = $("[data-dock-sum]");
let sel: Sel[] = readSelection().filter((s) => byId.has(s.id));

function save(next: Sel[]) {
  sel = next;
  writeSelection(sel);
}

function lineHtml(item: PriceItem, qty: number, withQty: boolean) {
  const max = item.unit ? unitMaxQty[item.unit] : undefined;
  const p = item.price;
  const lineTotal =
    p.kind === "fixed" ? uah(p.amount * qty) : p.kind === "from" ? `від ${uah(p.amount * qty)}` : p.kind === "range" ? `${formatAmount(p.min * qty)}-${uah(p.max * qty)}` : "";
  const qtyHtml =
    withQty && max
      ? `<div class="qty" role="group" aria-label="Кількість: ${esc(item.name)}">
           <button type="button" class="qty__btn" data-qty="-1" data-id="${item.id}" ${qty <= 1 ? "disabled" : ""} aria-label="Менше">${iconSvg("minus")}</button>
           <span class="qty__val num" aria-live="polite">${qty}</span>
           <button type="button" class="qty__btn" data-qty="1" data-id="${item.id}" ${qty >= max ? "disabled" : ""} aria-label="Більше">${iconSvg("plus")}</button>
           <span class="qty__unit small">${esc(unitLabel[item.unit!].replace("за ", ""))}</span>
         </div>`
      : item.unit
        ? `<span class="small muted">${esc(unitLabel[item.unit])}</span>`
        : "";
  return `<li class="dock-line">
    <div class="dock-line__main">
      <span class="dock-line__name">${esc(item.name)}</span>
      <div class="dock-line__meta">${qtyHtml}</div>
    </div>
    <span class="dock-line__price num">${lineTotal || esc(priceText(p))}</span>
    <button type="button" class="dock-line__remove" data-remove="${item.id}" aria-label="Прибрати: ${esc(item.name)}">${iconSvg("close")}</button>
  </li>`;
}

function renderDock({ bump = false } = {}) {
  const ids = new Set(sel.map((s) => s.id));
  $$<HTMLButtonElement>("[data-add]").forEach((b) => {
    const on = ids.has(b.dataset.add!);
    b.setAttribute("aria-pressed", String(on));
    b.querySelector(".add-btn__label")!.textContent = on ? "Додано" : "Додати";
    b.closest("[data-price-row]")?.classList.toggle("is-selected", on);
  });
  const lines = sel.map((s) => ({ item: byId.get(s.id)!, qty: s.qty }));
  const est = estimate(lines);
  dock.hidden = !sel.length;
  document.body.classList.toggle("has-dock", sel.length > 0);
  if (!sel.length) {
    setPanel(false);
    return;
  }
  dockCount.textContent = String(sel.length);
  const sumText = estimateText(est, uah, formatAmount);
  dockTotal.textContent = est.priced.length
    ? `${sumText}${est.quoted.length ? ` + ${est.quoted.length} після огляду` : ""}`
    : `${est.quoted.length} ${plural(est.quoted.length, "позиція", "позиції", "позицій")} після огляду`;
  dockList.innerHTML = est.priced.map((l) => lineHtml(l.item, l.qty, true)).join("");
  dockList.hidden = !est.priced.length;
  dockQuotes.hidden = !est.quoted.length;
  dockQuoteList.innerHTML = est.quoted.map((l) => lineHtml(l.item, l.qty, false)).join("");
  dockSum.textContent = est.priced.length ? sumText : "";
  if (bump && !reduceMotion()) {
    dockCount.classList.remove("is-bump");
    void dockCount.offsetWidth;
    dockCount.classList.add("is-bump");
  }
}

function setPanel(open: boolean) {
  dockPanel.hidden = !open;
  dockToggle.setAttribute("aria-expanded", String(open));
  dock.classList.toggle("is-expanded", open);
}

document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const add = target.closest<HTMLButtonElement>("[data-add]");
  if (add) {
    const id = add.dataset.add!;
    const exists = sel.some((s) => s.id === id);
    save(exists ? sel.filter((s) => s.id !== id) : [...sel, { id, qty: 1 }]);
    renderDock({ bump: !exists });
    return;
  }
  const rm = target.closest<HTMLButtonElement>("[data-remove]");
  if (rm) {
    save(sel.filter((s) => s.id !== rm.dataset.remove));
    renderDock();
    if (sel.length) dockToggle.focus();
    else input.focus();
    return;
  }
  const qb = target.closest<HTMLButtonElement>("[data-qty]");
  if (qb) {
    const id = qb.dataset.id!, d = Number(qb.dataset.qty);
    const item = byId.get(id)!;
    const max = (item.unit && unitMaxQty[item.unit]) || 1;
    save(sel.map((s) => (s.id === id ? { ...s, qty: Math.min(max, Math.max(1, s.qty + d)) } : s)));
    renderDock();
    // keep focus on the same control after re-render
    dockList.querySelector<HTMLButtonElement>(`[data-qty="${d}"][data-id="${id}"]`)?.focus();
  }
});
dockToggle.addEventListener("click", () => setPanel(Boolean(dockPanel.hidden)));
$("[data-dock-clear]").addEventListener("click", () => {
  save([]);
  renderDock();
  input.focus();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !dockPanel.hidden) {
    setPanel(false);
    dockToggle.focus();
  }
});
onSelection((list) => {
  sel = list.filter((s) => byId.has(s.id));
  renderDock();
});
renderDock();
