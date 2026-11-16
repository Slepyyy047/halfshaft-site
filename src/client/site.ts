// Shared behaviour on every page: fixed header state, mobile drawer, opening status, entrance reveals.
import { business } from "../data/business";
import { openStatus, slotsFor, kyivNow, addDays, dayOf } from "../lib/hours";

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ------------------------------------------------------------------ header
const header = document.querySelector<HTMLElement>("[data-header]");
// the banner (today's hours, the address) retracts once the page scrolls; the bar stays
const onScroll = () => header?.classList.toggle("is-condensed", window.scrollY > 36);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// ------------------------------------------------------------------ opening status
function renderStatus() {
  const st = openStatus(business.hours, business.booking.closedDates);
  document.querySelectorAll<HTMLElement>("[data-open-status]").forEach((el) => {
    el.textContent = st.text;
    el.classList.toggle("is-open", st.open);
    el.classList.add("has-status");
  });
}
renderStatus();
setInterval(renderStatus, 60_000);

// ------------------------------------------------------------------ drawer
const drawer = document.querySelector<HTMLElement>("[data-drawer]");
const openBtn = document.querySelector<HTMLButtonElement>("[data-menu-open]");
const desktop = window.matchMedia("(min-width: 960px)");
let lastFocus: HTMLElement | null = null;
let closeTimer = 0;

const focusables = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );

function setInert(on: boolean) {
  for (const sel of ["main", ".site-footer", ".site-header", ".skip-link"]) {
    const el = document.querySelector<HTMLElement>(sel);
    if (!el) continue;
    if (on) el.setAttribute("inert", "");
    else el.removeAttribute("inert");
  }
}

function openDrawer() {
  if (!drawer || !openBtn) return;
  window.clearTimeout(closeTimer);
  lastFocus = document.activeElement as HTMLElement;
  drawer.hidden = false;
  void drawer.offsetWidth; // start transition from the closed state
  drawer.classList.add("is-open");
  document.body.classList.add("is-locked");
  openBtn.setAttribute("aria-expanded", "true");
  setInert(true);
  const panel = drawer.querySelector<HTMLElement>(".drawer__panel")!;
  const current = panel.querySelector<HTMLElement>('.drawer__nav [aria-current="page"]');
  (current ?? focusables(panel)[0] ?? panel).focus({ preventScroll: true });
}

function closeDrawer({ restore = true } = {}) {
  if (!drawer || drawer.hidden || !openBtn) return;
  drawer.classList.remove("is-open");
  openBtn.setAttribute("aria-expanded", "false");
  setInert(false);
  document.body.classList.remove("is-locked");
  const finish = () => {
    drawer.hidden = true;
  };
  if (reduceMotion()) finish();
  else closeTimer = window.setTimeout(finish, 300);
  if (restore) {
    const target = lastFocus && lastFocus.offsetParent !== null ? lastFocus : openBtn.offsetParent !== null ? openBtn : document.querySelector<HTMLElement>(".site-header__logo");
    target?.focus({ preventScroll: true });
  }
}

openBtn?.addEventListener("click", openDrawer);
drawer?.querySelectorAll("[data-drawer-close]").forEach((el) => el.addEventListener("click", () => closeDrawer()));
drawer?.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) =>
  a.addEventListener("click", (e) => {
    // same-page link: just close; otherwise let navigation happen and close without restoring focus
    const url = new URL(a.href, location.href);
    if (url.pathname === location.pathname && !url.hash) {
      e.preventDefault();
      closeDrawer();
    } else closeDrawer({ restore: false });
  })
);
document.addEventListener("keydown", (e) => {
  if (!drawer || drawer.hidden) return;
  if (e.key === "Escape") {
    e.preventDefault();
    closeDrawer();
  } else if (e.key === "Tab") {
    const panel = drawer.querySelector<HTMLElement>(".drawer__panel")!;
    const list = focusables(panel);
    if (!list.length) return;
    const first = list[0], last = list[list.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
desktop.addEventListener("change", (e) => {
  if (e.matches) closeDrawer({ restore: false });
});
// back/forward cache: never come back to an open drawer
window.addEventListener("pageshow", (e) => {
  if ((e as PageTransitionEvent).persisted) closeDrawer({ restore: false });
});

// ------------------------------------------------------------------ home: the week strip and the next times to request
const week = document.querySelector<HTMLElement>("[data-week]");
if (week) {
  const today = kyivNow().day;
  week.querySelector(`[data-day="${today}"]`)?.classList.add("is-today");
  week.querySelector(`[data-day="${today}"]`)?.setAttribute("aria-current", "date");
}
const timesBox = document.querySelector<HTMLElement>("[data-next-times]");
if (timesBox) {
  const now = kyivNow();
  const DAY = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const out: { date: string; time: string }[] = [];
  for (let i = 0; i <= business.booking.horizonDays && out.length < 6; i++) {
    const date = addDays(now.date, i);
    // spread the suggestions: at most three per day
    for (const time of slotsFor(date, business.hours, business.booking).filter((_, k) => k % 4 === 0).slice(0, 3)) {
      if (out.length < 6) out.push({ date, time });
    }
  }
  const label = (iso: string) => {
    if (iso === now.date) return "Сьогодні";
    if (iso === addDays(now.date, 1)) return "Завтра";
    const [, m, d] = iso.split("-");
    return `${DAY[dayOf(iso)]}, ${Number(d)}.${m}`;
  };
  timesBox.innerHTML = out
    .map(
      (t) =>
        `<a class="time-btn" href="/booking?date=${t.date}&amp;time=${t.time}"><span class="time-btn__day">${label(t.date)}</span><span class="time-btn__time">${t.time.replace(/^0/, "")}</span></a>`
    )
    .join("");
}
