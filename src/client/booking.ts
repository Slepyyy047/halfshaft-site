// /booking: staged appointment request with validation, review/edit, local save or endpoint delivery.
import type { OpeningHours } from "../data/business";
import type { PriceItem, Symptom } from "../data/types";
import { checkDate, slotsFor, kyivNow, addDays, formatDateLong, hoursRows, type BookingRules } from "../lib/hours";
import { estimate, estimateText } from "../lib/estimate";
import { priceText, uah, formatAmount } from "../lib/format";
import { startingPrice } from "../lib/pricing";
import { unitLabel } from "../data/prices";
import { iconSvg } from "../components/Icon";
import { readSelection, writeSelection, type Sel } from "./selection";

interface Data {
  mode: "local" | "endpoint";
  endpoint: string | null;
  rules: BookingRules;
  hours: OpeningHours[];
  services: { slug: string; name: string; category: string; basis: string }[];
  categories: { id: string; name: string }[];
  prices: PriceItem[];
  symptoms: Symptom[];
}

interface Draft {
  mode: "service" | "symptom";
  service: string;
  symptoms: string[];
  problem: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  fuel: string;
  vin: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  selection: Sel[];
  step: number;
  id: string;
}

interface SavedRequest extends Omit<Draft, "step"> {
  createdAt: string;
  estimate: string;
}

const DATA: Data = JSON.parse(document.getElementById("booking-data")!.textContent!);
const DRAFT_KEY = "halfshaft:booking-draft";
const SAVED_KEY = "halfshaft:requests";

const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const $$ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const form = $<HTMLFormElement>("[data-form]");
const steps = $$("[data-step]");
const indicators = $$("[data-step-indicator]");
const priceById = new Map(DATA.prices.map((p) => [p.id, p]));
const serviceBySlug = new Map(DATA.services.map((s) => [s.slug, s]));
const symptomById = new Map(DATA.symptoms.map((s) => [s.id, s]));

const blank = (): Draft => ({
  mode: "service",
  service: "",
  symptoms: [],
  problem: "",
  make: "",
  model: "",
  year: "",
  mileage: "",
  fuel: "",
  vin: "",
  date: "",
  time: "",
  name: "",
  phone: "",
  selection: [],
  step: 1,
  id: newId(),
});

function newId() {
  const n = Math.floor(Math.random() * 9000 + 1000);
  const d = kyivNow().date.slice(5).replace("-", "");
  return `HS-${d}-${n}`;
}

// ------------------------------------------------------------------ state
let draft: Draft = loadDraft();
let returnToReview = false;
let submitting = false;
let completed: SavedRequest | null = null;

function loadDraft(): Draft {
  let d = blank();
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (raw) d = { ...d, ...JSON.parse(raw) };
  } catch {
    /* no session storage: start fresh */
  }
  const params = new URLSearchParams(location.search);
  const svc = params.get("service");
  if (svc && serviceBySlug.has(svc)) {
    d.mode = "service";
    d.service = svc;
    d.step = 1;
  }
  const sym = params.get("symptom");
  if (params.get("mode") === "symptom" || (sym && symptomById.has(sym))) {
    d.mode = "symptom";
    if (sym && !d.symptoms.includes(sym)) d.symptoms = [...d.symptoms, sym];
    d.step = 1;
  }
  if (params.get("from") === "selection") {
    const sel = readSelection().filter((s) => priceById.has(s.id));
    if (sel.length) {
      d.selection = sel;
      d.mode = "service";
      d.step = 1;
    }
  }
  return d;
}

function saveDraft() {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

// ------------------------------------------------------------------ form <-> draft
const field = <T extends HTMLElement = HTMLInputElement>(name: string) => form.elements.namedItem(name) as unknown as T;

function fillForm() {
  $$<HTMLInputElement>('input[name="mode"]').forEach((r) => (r.checked = r.value === draft.mode));
  field<HTMLSelectElement>("service").value = draft.service;
  $$<HTMLInputElement>('input[name="symptoms"]').forEach((c) => (c.checked = draft.symptoms.includes(c.value)));
  $$<HTMLInputElement>('input[name="fuel"]').forEach((r) => (r.checked = r.value === draft.fuel));
  for (const k of ["problem", "make", "model", "year", "mileage", "vin", "date", "name", "phone"] as const) {
    field<HTMLInputElement>(k).value = draft[k];
  }
}

function readForm() {
  draft.mode = ($<HTMLInputElement>('input[name="mode"]:checked')?.value as Draft["mode"]) ?? "service";
  draft.service = field<HTMLSelectElement>("service").value;
  draft.symptoms = $$<HTMLInputElement>('input[name="symptoms"]:checked').map((c) => c.value);
  draft.fuel = $<HTMLInputElement>('input[name="fuel"]:checked')?.value ?? "";
  draft.time = $<HTMLInputElement>('input[name="time"]:checked')?.value ?? draft.time;
  for (const k of ["problem", "make", "model", "year", "mileage", "vin", "date", "name", "phone"] as const) {
    draft[k] = field<HTMLInputElement>(k).value;
  }
}

// ------------------------------------------------------------------ errors
function setError(id: string, msg: string | null) {
  const box = document.querySelector<HTMLElement>(`[data-error-for="${id}"]`);
  const input = document.getElementById(id) as HTMLElement | null;
  if (box) {
    box.hidden = !msg;
    box.querySelector("span")!.textContent = msg ?? "";
  }
  const target = input ?? box?.closest("fieldset");
  if (target) {
    if (msg) target.setAttribute("aria-invalid", "true");
    else target.removeAttribute("aria-invalid");
    target.closest(".field")?.classList.toggle("is-invalid", Boolean(msg));
  }
}

function focusFirstError(step: HTMLElement) {
  const err = step.querySelector<HTMLElement>(".field.is-invalid");
  if (!err) return;
  const control =
    err.querySelector<HTMLElement>('[aria-invalid="true"]') ??
    err.querySelector<HTMLElement>("input:not([type=hidden]), select, textarea");
  err.scrollIntoView({ block: "center", behavior: reduceMotion() ? "auto" : "smooth" });
  control?.focus({ preventScroll: true });
}

// ------------------------------------------------------------------ validation
const currentYear = Number(kyivNow().date.slice(0, 4));

function normPhone(v: string): string | null {
  let d = v.replace(/\D/g, "");
  if (d.length === 10 && d.startsWith("0")) d = "38" + d;
  else if (d.length === 9) d = "380" + d;
  if (d.length !== 12 || !d.startsWith("380")) return null;
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
}

function validate(step: number): boolean {
  readForm();
  const errs: Record<string, string | null> = {};
  if (step === 1) {
    if (draft.mode === "service") {
      errs.service = !draft.service && !draft.selection.length ? "Оберіть послугу зі списку або перейдіть на «Знаю лише, що турбує»." : null;
      errs.problem = null;
    } else {
      errs.problem =
        !draft.symptoms.length && draft.problem.trim().length < 10
          ? "Оберіть симптом вище або опишіть проблему хоча б кількома словами."
          : null;
      errs.service = null;
    }
  }
  if (step === 2) {
    errs.make = draft.make.trim() ? null : "Вкажіть марку авто.";
    errs.model = draft.model.trim() ? null : "Вкажіть модель авто.";
    const y = draft.year.trim();
    errs.year = !y || (/^\d{4}$/.test(y) && +y >= 1975 && +y <= currentYear + 1) ? null : `Рік — чотири цифри, від 1975 до ${currentYear + 1}.`;
    const m = draft.mileage.replace(/[\s ]/g, "");
    errs.mileage = !m || (/^\d{1,7}$/.test(m) && +m <= 2_000_000) ? null : "Пробіг — лише цифри, наприклад 148000.";
    const vin = draft.vin.trim().toUpperCase();
    errs.vin = !vin || /^[A-HJ-NPR-Z0-9]{17}$/.test(vin) ? null : "VIN має 17 символів: латинські літери (без I, O, Q) і цифри.";
  }
  if (step === 3) {
    const problem = checkDate(draft.date, DATA.hours, DATA.rules);
    const msgs: Record<string, string> = {
      empty: "Оберіть дату.",
      past: "Ця дата вже минула. Оберіть сьогодні або пізніше.",
      "too-far": `Можна обрати дату не пізніше ніж через ${DATA.rules.horizonDays} днів.`,
      closed: "У цей день майстерня не працює. Оберіть інший день.",
      "no-slots": "На цей день вільного часу вже немає. Оберіть інший день.",
    };
    errs.date = problem ? msgs[problem] : null;
    const slots = problem ? [] : slotsFor(draft.date, DATA.hours, DATA.rules);
    errs.time = !problem && !slots.includes(draft.time) ? "Оберіть бажаний час." : null;
    errs.name = /^[\p{L}][\p{L}\s'ʼ’.-]{1,59}$/u.test(draft.name.trim()) ? null : "Вкажіть ім'я, щоб адміністратор знав, як до вас звертатися.";
    const phone = normPhone(draft.phone);
    errs.phone = phone ? null : "Вкажіть український номер: +380 і ще 9 цифр.";
    if (phone) {
      draft.phone = phone;
      field<HTMLInputElement>("phone").value = phone;
    }
  }
  for (const [k, v] of Object.entries(errs)) setError(k, v);
  saveDraft();
  return Object.values(errs).every((v) => !v);
}

// ------------------------------------------------------------------ step navigation
let current = 1;

function goTo(n: number, { push = true, focus = true } = {}) {
  current = n;
  draft.step = n <= 4 ? n : draft.step;
  steps.forEach((s) => (s.hidden = Number(s.dataset.step) !== n));
  indicators.forEach((li) => {
    const i = Number(li.dataset.stepIndicator);
    li.classList.toggle("is-done", i < n);
    li.classList.toggle("is-current", i === n);
    if (i === n) li.setAttribute("aria-current", "step");
    else li.removeAttribute("aria-current");
  });
  $("[data-steps]").hidden = n === 5;
  // "next" label when editing from the review
  $$<HTMLButtonElement>("[data-next]").forEach((b) => {
    b.dataset.label ??= b.textContent!.trim();
    b.textContent = returnToReview && n < 4 ? "Зберегти й повернутися до перевірки" : b.dataset.label;
  });
  if (n === 3) renderSlots();
  if (n === 4) renderReview();
  if (push) history.pushState({ step: n }, "", location.href);
  if (focus) {
    const stepEl = steps.find((s) => Number(s.dataset.step) === n)!;
    const title = stepEl.querySelector<HTMLElement>(".step__title")!;
    const anchor = n < 5 ? $("[data-steps]") : form;
    const top = anchor.getBoundingClientRect().top + window.scrollY - (document.querySelector<HTMLElement>("[data-header]")?.offsetHeight ?? 64) - 16;
    if (window.scrollY > top) window.scrollTo({ top, behavior: reduceMotion() ? "auto" : "smooth" });
    title.focus({ preventScroll: true });
    stepEl.classList.remove("is-entering");
    void stepEl.offsetWidth;
    if (!reduceMotion()) stepEl.classList.add("is-entering");
  }
  saveDraft();
  renderOverview();
}

form.addEventListener("click", (e) => {
  const t = e.target as HTMLElement;
  if (t.closest("[data-next]")) {
    e.preventDefault();
    next();
  } else if (t.closest("[data-prev]")) {
    e.preventDefault();
    goTo(Math.max(1, current - 1));
  } else if (t.closest("[data-edit]")) {
    e.preventDefault();
    returnToReview = true;
    goTo(Number((t.closest("[data-edit]") as HTMLElement).dataset.edit));
  } else if (t.closest("[data-carry-remove]")) {
    const id = (t.closest("[data-carry-remove]") as HTMLElement).dataset.carryRemove!;
    draft.selection = draft.selection.filter((s) => s.id !== id);
    saveDraft();
    renderCarry();
    renderOverview();
    (draft.selection.length ? $("[data-carry-list] button") : field<HTMLSelectElement>("service"))?.focus();
  }
});

function next() {
  if (!validate(current)) {
    focusFirstError(steps.find((s) => Number(s.dataset.step) === current)!);
    return;
  }
  if (returnToReview) {
    // the edited step is valid; review again only once everything is valid
    for (let s = 1; s <= 3; s++) {
      if (!validate(s)) {
        goTo(s);
        focusFirstError(steps.find((x) => Number(x.dataset.step) === s)!);
        return;
      }
    }
    returnToReview = false;
    goTo(4);
    return;
  }
  goTo(current + 1);
}

window.addEventListener("popstate", (e) => {
  const st = (e.state as { step?: number } | null)?.step;
  if (!st) return;
  if (completed && st < 5) {
    // the request is already saved: start a fresh one instead of editing a submitted request
    resetAll({ push: false });
    return;
  }
  // never jump forward past an invalid step
  for (let s = 1; s < Math.min(st, 4); s++) {
    if (!validate(s)) {
      goTo(s, { push: false });
      return;
    }
  }
  if (st === 5 && !completed) {
    goTo(4, { push: false });
    return;
  }
  goTo(st, { push: false });
});

// Enter in a text field moves to the next step instead of submitting early
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (current < 4) next();
  else submit();
});

// ------------------------------------------------------------------ live updates
form.addEventListener("input", (e) => {
  const t = e.target as HTMLInputElement;
  if (t.id) setError(t.id, null);
  if (t.name === "time") setError("time", null);
  if (t.name === "symptoms") setError("problem", null);
  readForm();
  if (t.name === "mode") showModePanel();
  if (t.name === "service") renderPriceHint();
  if (t.name === "symptoms" || t.name === "problem") renderSymptomHint();
  if (t.name === "fuel") $("[data-ev-note]").hidden = draft.fuel !== "Електро";
  if (t.name === "date") renderSlots();
  saveDraft();
  renderOverview();
});
field<HTMLInputElement>("vin").addEventListener("blur", (e) => {
  const el = e.target as HTMLInputElement;
  el.value = el.value.toUpperCase().replace(/\s/g, "");
});
field<HTMLInputElement>("phone").addEventListener("blur", (e) => {
  const el = e.target as HTMLInputElement;
  const p = normPhone(el.value);
  if (p) el.value = p;
});

function showModePanel() {
  $$("[data-mode-panel]").forEach((p) => (p.hidden = p.dataset.modePanel !== draft.mode));
}

// ------------------------------------------------------------------ step 1 helpers
function rowsFor(slug: string) {
  return DATA.prices.filter((p) => p.service === slug);
}

function priceRowsHtml(list: PriceItem[]) {
  return `<ul role="list" class="hint-rows">${list
    .map(
      (p) =>
        `<li><span>${esc(p.name)}${p.unit ? ` <span class="muted">${esc(unitLabel[p.unit])}</span>` : ""}</span><strong class="num">${esc(priceText(p.price))}</strong></li>`
    )
    .join("")}</ul>`;
}

function renderPriceHint() {
  const box = $("[data-price-hint]");
  const s = serviceBySlug.get(draft.service);
  if (!s) {
    box.hidden = true;
    box.innerHTML = "";
    return;
  }
  box.hidden = false;
  box.innerHTML = `<p class="price-hint__title">Ціни за прайсом</p>${priceRowsHtml(rowsFor(s.slug))}<p class="small muted">${esc(
    s.basis
  )} Це не кошторис: остаточну суму узгодимо після огляду.</p>`;
}

function renderSymptomHint() {
  const box = $("[data-symptom-hint]");
  const first = draft.symptoms.map((id) => symptomById.get(id)).find(Boolean);
  $("[data-problem-opt]").textContent = draft.symptoms.length ? "(необов'язково)" : "(обов'язково, якщо не обрали симптом)";
  if (!first) {
    box.hidden = true;
    box.innerHTML = "";
    return;
  }
  const s = serviceBySlug.get(first.service)!;
  const sp = startingPrice(s.slug, DATA.prices);
  box.hidden = false;
  box.innerHTML = `<p class="price-hint__title">З чого почнемо</p><p>${esc(s.name)}${
    sp ? ` — <strong class="num">${esc(priceText(sp))}</strong>` : ""
  }.</p><p class="small muted">Ціну ремонту назвемо після огляду, до початку робіт.</p>`;
}

function renderCarry() {
  const box = $("[data-carry]");
  box.hidden = !draft.selection.length;
  $("[data-service-label]").textContent = draft.selection.length ? "Додати ще послугу (необов'язково)" : "Послуга";
  if (!draft.selection.length) return;
  const lines = draft.selection.map((s) => ({ item: priceById.get(s.id)!, qty: s.qty })).filter((l) => l.item);
  $("[data-carry-list]").innerHTML = lines
    .map(
      (l) => `<li class="carry-item">
        <span class="carry-item__name">${esc(l.item.name)}${l.qty > 1 ? ` <span class="muted">× ${l.qty}</span>` : ""}</span>
        <span class="carry-item__price num">${esc(priceText(l.item.price))}</span>
        <button type="button" class="carry-item__remove" data-carry-remove="${l.item.id}" aria-label="Прибрати: ${esc(l.item.name)}">${iconSvg("close")}</button>
      </li>`
    )
    .join("");
  const est = estimate(lines);
  const sum = estimateText(est, uah, formatAmount);
  $("[data-carry-sum]").textContent =
    (sum ? `Орієнтовно за роботи: ${sum}.` : "") + (est.quoted.length ? ` Ще ${est.quoted.length} — після огляду.` : "") + " Без запчастин.";
}

// ------------------------------------------------------------------ step 3: date & slots
const dateInput = field<HTMLInputElement>("date");
const today = kyivNow().date;
dateInput.min = today;
dateInput.max = addDays(today, DATA.rules.horizonDays);
const hoursText = hoursRows(DATA.hours)
  .map((r) => `${r.days} ${r.time}`)
  .join(", ");

function renderSlots() {
  const box = $("[data-slots]");
  const help = $("[data-date-help]");
  const d = draft.date;
  const problem = d ? checkDate(d, DATA.hours, DATA.rules) : "empty";
  help.textContent = d && !problem ? `Обрано: ${formatDateLong(d)}. Години роботи: ${hoursText}.` : `Години роботи: ${hoursText}.`;
  if (problem) {
    box.innerHTML = `<p class="small muted">${
      problem === "empty" ? "Спершу оберіть дату — покажемо вільний час." : "На цю дату вибрати час не можна. Оберіть інший день."
    }</p>`;
    if (d && problem !== "empty") validateDateOnly();
    return;
  }
  setError("date", null);
  const slots = slotsFor(d, DATA.hours, DATA.rules);
  if (!slots.includes(draft.time)) draft.time = "";
  box.innerHTML = `<div class="slots__grid">${slots
    .map(
      (s) =>
        `<label class="slot"><input type="radio" name="time" value="${s}" ${s === draft.time ? "checked" : ""}><span class="num">${s.replace(/^0/, "")}</span></label>`
    )
    .join("")}</div>`;
}

function validateDateOnly() {
  const problem = checkDate(draft.date, DATA.hours, DATA.rules);
  const msgs: Record<string, string> = {
    past: "Ця дата вже минула. Оберіть сьогодні або пізніше.",
    "too-far": `Можна обрати дату не пізніше ніж через ${DATA.rules.horizonDays} днів.`,
    closed: "У цей день майстерня не працює. Оберіть інший день.",
    "no-slots": "На цей день вільного часу вже немає. Оберіть інший день.",
  };
  if (problem && problem !== "empty") setError("date", msgs[problem]);
}

// ------------------------------------------------------------------ summary text
function workLines(): { title: string; lines: string[]; price: string } {
  if (draft.mode === "symptom") {
    const labels = draft.symptoms.map((id) => symptomById.get(id)?.label).filter(Boolean) as string[];
    const first = draft.symptoms.map((id) => symptomById.get(id)).find(Boolean);
    const sp = first ? startingPrice(first.service, DATA.prices) : null;
    const lines = [...labels];
    if (draft.problem.trim()) lines.push(`«${draft.problem.trim()}»`);
    return {
      title: "Опис проблеми",
      lines,
      price: first && sp ? `${serviceBySlug.get(first.service)!.name}: ${priceText(sp)}; ремонт — після огляду` : "Після огляду",
    };
  }
  const lines: string[] = [];
  const priceLines = draft.selection.map((s) => ({ item: priceById.get(s.id)!, qty: s.qty })).filter((l) => l.item);
  for (const l of priceLines) lines.push(l.qty > 1 ? `${l.item.name} × ${l.qty}` : l.item.name);
  const svc = serviceBySlug.get(draft.service);
  if (svc) lines.push(svc.name);
  let price = "—";
  if (priceLines.length) {
    const est = estimate(priceLines);
    const sum = estimateText(est, uah, formatAmount);
    price = [sum, est.quoted.length ? `${est.quoted.length} поз. після огляду` : ""].filter(Boolean).join(" + ");
    if (svc) price += `, плюс ${svc.name.toLowerCase()}`;
  } else if (svc) {
    const sp = startingPrice(svc.slug, DATA.prices);
    price = sp ? priceText(sp) : "—";
  }
  return { title: "Послуга", lines, price };
}

function carText() {
  const parts = [draft.make.trim(), draft.model.trim()].filter(Boolean).join(" ");
  const extra = [draft.year.trim(), draft.fuel, draft.mileage.trim() ? `${formatAmount(+draft.mileage.replace(/\D/g, "") || 0)} км` : ""].filter(Boolean);
  return parts ? parts + (extra.length ? `, ${extra.join(", ")}` : "") : "";
}

function timeText() {
  return draft.date && draft.time ? `${formatDateLong(draft.date)}, ${draft.time.replace(/^0/, "")}` : "";
}

function renderOverview() {
  const w = workLines();
  const set = (k: string, v: string) => ($(`[data-ov="${k}"]`).textContent = v || "—");
  set("service", w.lines.join("; "));
  set("price", w.lines.length ? w.price : "");
  set("car", carText());
  set("time", timeText());
  set("contact", [draft.name.trim(), draft.phone.trim()].filter(Boolean).join(", "));
  $("[data-ov-brief]").textContent = w.lines.length ? w.lines[0] : "Ще нічого не обрано";
}

function reviewHtml(editable: boolean, d: { work: ReturnType<typeof workLines>; car: string; vin: string; time: string; contact: string }) {
  const edit = (n: number, label: string) =>
    editable ? `<button type="button" class="text-btn review__edit" data-edit="${n}">${iconSvg("edit")}Змінити<span class="sr-only"> ${label}</span></button>` : "";
  const block = (n: number, title: string, body: string) =>
    `<div class="review__block"><div class="review__head"><h3 class="review__title">${title}</h3>${edit(n, title.toLowerCase())}</div>${body}</div>`;
  return [
    block(
      1,
      d.work.title,
      `<ul role="list" class="review__lines">${d.work.lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul><p class="review__price"><span class="muted">Орієнтовно за прайсом:</span> <strong class="num">${esc(
        d.work.price
      )}</strong></p>`
    ),
    block(2, "Авто", `<p>${esc(d.car)}</p>${d.vin ? `<p class="small muted">VIN ${esc(d.vin)}</p>` : ""}`),
    block(3, "Бажаний час", `<p>${esc(d.time)}</p><p class="small muted">Час ще не підтверджено.</p>`),
    block(3, "Контакт", `<p>${esc(d.contact)}</p>`),
  ].join("");
}

function snapshot() {
  return {
    work: workLines(),
    car: carText(),
    vin: draft.vin.trim().toUpperCase(),
    time: timeText(),
    contact: [draft.name.trim(), draft.phone.trim()].filter(Boolean).join(", "),
  };
}

function renderReview() {
  $("[data-review]").innerHTML = reviewHtml(true, snapshot());
  $("[data-submit-error]").hidden = true;
}

function plainText(id: string, s: ReturnType<typeof snapshot>) {
  return [
    `Заявка ${id}`,
    `${s.work.title}: ${s.work.lines.join("; ")}`,
    `Орієнтовно за прайсом: ${s.work.price}`,
    `Авто: ${s.car}${s.vin ? `, VIN ${s.vin}` : ""}`,
    `Бажаний час: ${s.time} (не підтверджено)`,
    `Контакт: ${s.contact}`,
  ].join("\n");
}

// ------------------------------------------------------------------ submit
const submitBtn = $<HTMLButtonElement>("[data-submit]");
const submitLabel = submitBtn.textContent!;

function showSubmitError(msg: string) {
  const box = $("[data-submit-error]");
  $("[data-submit-error-text]").textContent = msg;
  box.hidden = false;
  box.scrollIntoView({ block: "center", behavior: reduceMotion() ? "auto" : "smooth" });
}

function readSaved(): SavedRequest[] {
  const raw = localStorage.getItem(SAVED_KEY);
  const list = raw ? JSON.parse(raw) : [];
  return Array.isArray(list) ? list : [];
}

async function submit() {
  if (submitting) return;
  for (let s = 1; s <= 3; s++) {
    if (!validate(s)) {
      goTo(s);
      focusFirstError(steps.find((x) => Number(x.dataset.step) === s)!);
      return;
    }
  }
  submitting = true;
  submitBtn.disabled = true;
  submitBtn.setAttribute("aria-busy", "true");
  submitBtn.textContent = DATA.mode === "local" ? "Зберігаємо…" : "Надсилаємо…";
  $("[data-submit-error]").hidden = true;

  const snap = snapshot();
  const { step: _step, ...rest } = draft;
  const request: SavedRequest = { ...rest, vin: snap.vin, createdAt: new Date().toISOString(), estimate: snap.work.price };

  try {
    if (DATA.mode === "endpoint" && DATA.endpoint) {
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), 15000);
      let res: Response;
      try {
        res = await fetch(DATA.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": request.id },
          body: JSON.stringify(request),
          signal: ctrl.signal,
        });
      } finally {
        window.clearTimeout(timer);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } else {
      let list: SavedRequest[];
      try {
        list = readSaved();
        // a retry after a partial failure must not create a second copy
        if (!list.some((r) => r.id === request.id)) list.unshift(request);
        localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 20)));
      } catch {
        throw new Error("storage");
      }
    }
  } catch (err) {
    const storage = (err as Error).message === "storage";
    showSubmitError(
      storage
        ? "Не вдалося зберегти заявку: браузер не дає доступу до сховища (наприклад, у приватному режимі або коли воно заповнене). Дані у формі збережено — спробуйте ще раз або відкрийте сайт у звичайному вікні."
        : "Не вдалося надіслати заявку. Перевірте з'єднання з інтернетом і спробуйте ще раз — дані у формі збережено."
    );
    submitting = false;
    submitBtn.disabled = false;
    submitBtn.removeAttribute("aria-busy");
    submitBtn.textContent = submitLabel;
    return;
  }

  completed = request;
  if (draft.selection.length) writeSelection([]);
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
  renderResult(request, snap);
  submitting = false;
  submitBtn.disabled = false;
  submitBtn.removeAttribute("aria-busy");
  submitBtn.textContent = submitLabel;
  goTo(5);
}

function renderResult(req: SavedRequest, snap: ReturnType<typeof snapshot>) {
  const local = DATA.mode === "local";
  $("[data-result-title]").textContent = local ? "Заявку збережено на цьому пристрої" : "Заявку надіслано";
  $("[data-result-text]").innerHTML = local
    ? `Номер заявки <strong class="num">${esc(req.id)}</strong>. У майстерню вона не надсилалася: щоб підтвердити час, покажіть її адміністратору на місці або скопіюйте текст.`
    : `Номер заявки <strong class="num">${esc(req.id)}</strong>. Це ще не підтверджений запис: адміністратор зв'яжеться з вами за номером ${esc(
        req.phone
      )}, щоб підтвердити час.`;
  $("[data-result-review]").innerHTML = reviewHtml(false, snap);
  ($("[data-copy]") as HTMLElement).dataset.text = plainText(req.id, snap);
  $("[data-copy-status]").textContent = "";
  renderSaved();
}

function renderSaved() {
  const box = $("[data-saved]");
  if (DATA.mode !== "local") return;
  let list: SavedRequest[] = [];
  try {
    list = readSaved();
  } catch {
    /* ignore */
  }
  const others = list.filter((r) => r.id !== completed?.id);
  box.hidden = !others.length;
  $("[data-saved-list]").innerHTML = others
    .map(
      (r) => `<li class="saved__item"><span><strong class="num">${esc(r.id)}</strong> <span class="muted">${esc(
        r.date ? formatDateLong(r.date) : ""
      )}${r.time ? `, ${esc(r.time.replace(/^0/, ""))}` : ""}</span></span><button type="button" class="text-btn" data-delete-saved="${esc(r.id)}">Видалити<span class="sr-only"> заявку ${esc(
        r.id
      )}</span></button></li>`
    )
    .join("");
}

$("[data-saved-list]").addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-delete-saved]");
  if (!b) return;
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(readSaved().filter((r) => r.id !== b.dataset.deleteSaved)));
  } catch {
    /* ignore */
  }
  renderSaved();
  $("[data-new]").focus();
});

$("[data-copy]").addEventListener("click", async (e) => {
  const text = (e.currentTarget as HTMLElement).dataset.text ?? "";
  const statusEl = $("[data-copy-status]");
  try {
    await navigator.clipboard.writeText(text);
    statusEl.textContent = "Текст заявки скопійовано.";
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    statusEl.textContent = ok ? "Текст заявки скопійовано." : "Не вдалося скопіювати автоматично. Виділіть текст вище й скопіюйте вручну.";
  }
});

function resetAll({ push = true } = {}) {
  completed = null;
  returnToReview = false;
  draft = blank();
  form.reset();
  fillForm();
  showModePanel();
  renderCarry();
  renderPriceHint();
  renderSymptomHint();
  $$(".field.is-invalid").forEach((f) => f.classList.remove("is-invalid"));
  $$("[data-error-for]").forEach((b) => (b.hidden = true));
  history.replaceState({ step: 1 }, "", location.pathname);
  goTo(1, { push });
}
$("[data-new]").addEventListener("click", () => resetAll({ push: false }));

// ------------------------------------------------------------------ init
fillForm();
showModePanel();
renderCarry();
renderPriceHint();
renderSymptomHint();
$("[data-ev-note]").hidden = draft.fuel !== "Електро";
// open the overview on wide screens, keep it compact on phones
const ov = $<HTMLDetailsElement>("[data-overview]");
const wide = window.matchMedia("(min-width: 960px)");
ov.open = wide.matches;
wide.addEventListener("change", (e) => (ov.open = e.matches));

// restore the step only if earlier steps are valid
let start = Math.min(Math.max(1, draft.step || 1), 4);
for (let s = 1; s < start; s++) {
  if (!validate(s)) {
    start = s;
    break;
  }
}
$$(".field.is-invalid").forEach((f) => f.classList.remove("is-invalid"));
$$("[data-error-for]").forEach((b) => (b.hidden = true));
$$('[aria-invalid="true"]').forEach((el) => el.removeAttribute("aria-invalid"));
history.replaceState({ step: start }, "", location.href);
goTo(start, { push: false, focus: false });
document.querySelector<HTMLElement>("[data-booking]")?.classList.add("is-ready");
