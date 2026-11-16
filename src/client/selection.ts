// Price-list selection shared between /pricing and /booking (localStorage, per device).
export interface Sel {
  id: string;
  qty: number;
}

const KEY = "halfshaft:selection";
const listeners = new Set<(s: Sel[]) => void>();

export function readSelection(): Sel[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Sel[]) : [];
    return Array.isArray(list) ? list.filter((s) => typeof s.id === "string" && s.qty > 0) : [];
  } catch {
    return [];
  }
}

export function writeSelection(list: Sel[]) {
  try {
    if (list.length) localStorage.setItem(KEY, JSON.stringify(list));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: selection works for this page view only */
  }
  listeners.forEach((fn) => fn(list));
}

export function onSelection(fn: (s: Sel[]) => void) {
  listeners.add(fn);
}

// keep tabs in sync
window.addEventListener("storage", (e) => {
  if (e.key === KEY) listeners.forEach((fn) => fn(readSelection()));
});
