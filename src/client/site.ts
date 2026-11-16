// Shared behaviour on every page: fixed header state, mobile drawer, opening status, entrance reveals.
import { business } from "../data/business";
import { openStatus } from "../lib/hours";

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ------------------------------------------------------------------ header
const header = document.querySelector<HTMLElement>("[data-header]");
const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
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

// ------------------------------------------------------------------ reveals
// Only elements below the fold at load get the entrance; nothing visible is hidden.
if ("IntersectionObserver" in window && !reduceMotion()) {
  const items = [...document.querySelectorAll<HTMLElement>("[data-reveal]")].filter(
    (el) => el.getBoundingClientRect().top > window.innerHeight * 0.92
  );
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        const el = en.target as HTMLElement;
        el.classList.add("is-revealed");
        io.unobserve(el);
      }
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  // Safety net for fast jumps (anchors, find-in-page, printing): reveal anything already passed.
  const sweep = () => {
    for (const el of items) {
      if (!el.classList.contains("is-revealed") && el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("is-revealed");
        io.unobserve(el);
      }
    }
  };
  let raf = 0;
  window.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(sweep); }, { passive: true });
  window.addEventListener("beforeprint", () => items.forEach((el) => el.classList.add("is-revealed")));
  items.forEach((el) => {
    const group = el.closest("[data-reveal-group]");
    const idx = group ? [...group.querySelectorAll("[data-reveal]")].indexOf(el) : 0;
    el.style.setProperty("--i", String(idx % 4));
    el.classList.add("reveal-pending");
    io.observe(el);
  });
}
