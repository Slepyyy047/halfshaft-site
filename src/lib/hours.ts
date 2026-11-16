import type { OpeningHours, Weekday } from "../data/business";

export const TZ = "Europe/Kyiv";
const DAY_SHORT = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const DAY_LONG = ["неділя", "понеділок", "вівторок", "середа", "четвер", "пʼятниця", "субота"];
const DAY_ACC = ["неділю", "понеділок", "вівторок", "середу", "четвер", "пʼятницю", "суботу"];
const ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fromMin = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
/** 08:30 -> 8:30 для відображення */
export const showTime = (hhmm: string) => fromMin(toMin(hhmm));

/** «Пн–Пт», «Сб» для набору днів (послідовні дні в порядку тижня) */
export function daysLabel(days: Weekday[]): string {
  const idx = ORDER.map((d, i) => (days.includes(d) ? i : -1)).filter((i) => i >= 0);
  if (!idx.length) return "";
  const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (contiguous && idx.length > 1) return `${DAY_SHORT[ORDER[idx[0]]]}–${DAY_SHORT[ORDER[idx[idx.length - 1]]]}`;
  return idx.map((i) => DAY_SHORT[ORDER[i]]).join(", ");
}

export function hoursFor(hours: OpeningHours[], day: number) {
  return hours.find((h) => h.days.includes(day as Weekday)) ?? null;
}

/** Згруповані рядки для таблиці годин: «Пн–Пт 8:30–19:00», «Нд вихідний» */
export function hoursRows(hours: OpeningHours[]) {
  const rows: { days: string; time: string; closed: boolean; daysLong: string }[] = [];
  let i = 0;
  while (i < ORDER.length) {
    const d = ORDER[i];
    const h = hoursFor(hours, d);
    let j = i;
    while (j + 1 < ORDER.length) {
      const n = hoursFor(hours, ORDER[j + 1]);
      if ((h === null && n === null) || (h && n && h.open === n.open && h.close === n.close)) j++;
      else break;
    }
    const first = ORDER[i], last = ORDER[j];
    rows.push({
      days: i === j ? DAY_SHORT[first] : `${DAY_SHORT[first]}–${DAY_SHORT[last]}`,
      daysLong: i === j ? DAY_LONG[first] : `${DAY_LONG[first]} – ${DAY_LONG[last]}`,
      time: h ? `${showTime(h.open)}–${showTime(h.close)}` : "вихідний",
      closed: !h,
    });
    i = j + 1;
  }
  return rows;
}

/** Поточна дата й час у Києві, незалежно від часового поясу відвідувача */
export function kyivNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  return { date, minutes: Number(get("hour")) * 60 + Number(get("minute")), day: dayOf(date) };
}

/** День тижня для дати YYYY-MM-DD (календарний, без часових поясів) */
export function dayOf(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("uk-UA", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d))
  );
}

/** Статус «зараз відчинено/зачинено» для шапки й контактів */
export function openStatus(hours: OpeningHours[], closedDates: string[], now = kyivNow()) {
  const today = closedDates.includes(now.date) ? null : hoursFor(hours, now.day);
  if (today && now.minutes >= toMin(today.open) && now.minutes < toMin(today.close)) {
    return { open: true, text: `Зараз відчинено до ${showTime(today.close)}` };
  }
  // наступне відкриття
  for (let i = 0; i < 8; i++) {
    const date = addDays(now.date, i);
    if (closedDates.includes(date)) continue;
    const h = hoursFor(hours, dayOf(date));
    if (!h) continue;
    if (i === 0 && now.minutes >= toMin(h.open)) continue;
    const when = i === 0 ? "сьогодні" : i === 1 ? "завтра" : `у ${DAY_ACC[dayOf(date)]}`;
    return { open: false, text: `Зачинено, відкриємося ${when} о ${showTime(h.open)}` };
  }
  return { open: false, text: "Зачинено" };
}

export interface BookingRules {
  slotStepMinutes: number;
  lastSlotBeforeCloseMinutes: number;
  leadTimeHours: number;
  horizonDays: number;
  closedDates: string[];
}

/** Доступні слоти на дату з урахуванням годин роботи і мінімального запасу часу */
export function slotsFor(iso: string, hours: OpeningHours[], rules: BookingRules, now = kyivNow()): string[] {
  if (rules.closedDates.includes(iso)) return [];
  const h = hoursFor(hours, dayOf(iso));
  if (!h) return [];
  const out: string[] = [];
  const last = toMin(h.close) - rules.lastSlotBeforeCloseMinutes;
  for (let m = toMin(h.open); m <= last; m += rules.slotStepMinutes) {
    if (iso === now.date && m < now.minutes + rules.leadTimeHours * 60) continue;
    if (iso < now.date) continue;
    out.push(fromMin(m).padStart(5, "0"));
  }
  return out;
}

export type DateProblem = null | "empty" | "past" | "too-far" | "closed" | "no-slots";

export function checkDate(iso: string, hours: OpeningHours[], rules: BookingRules, now = kyivNow()): DateProblem {
  if (!iso) return "empty";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "empty";
  if (iso < now.date) return "past";
  if (iso > addDays(now.date, rules.horizonDays)) return "too-far";
  if (rules.closedDates.includes(iso) || !hoursFor(hours, dayOf(iso))) return "closed";
  if (!slotsFor(iso, hours, rules, now).length) return "no-slots";
  return null;
}
