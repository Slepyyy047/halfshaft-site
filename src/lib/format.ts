import type { Price } from "../data/types";

const NBSP = " ";

export function formatAmount(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

export const uah = (n: number) => `${formatAmount(n)}${NBSP}₴`;

/** Повний текст ціни: «650 ₴», «від 850 ₴», «2 800–6 500 ₴», «Після огляду» */
export function priceText(p: Price): string {
  switch (p.kind) {
    case "fixed":
      return uah(p.amount);
    case "from":
      return `від${NBSP}${uah(p.amount)}`;
    case "range":
      return `${formatAmount(p.min)}–${uah(p.max)}`;
    case "quote":
      return "Після огляду";
  }
}

export const priceKindLabel: Record<Price["kind"], string> = {
  fixed: "Фіксована ціна",
  from: "Стартова ціна",
  range: "Діапазон",
  quote: "Після огляду",
};

/** Кількість у родовому відмінку: 1 колесо, 2 колеса, 5 коліс */
export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
