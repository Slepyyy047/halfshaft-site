import type { PriceItem } from "../data/types";

export interface Line {
  item: PriceItem;
  qty: number;
}

export interface Estimate {
  /** Рядки, які можна скласти в суму */
  priced: Line[];
  /** Рядки «після огляду» — показуємо окремо */
  quoted: Line[];
  min: number;
  max: number;
  /** Є стартові ціни — верхня межа невідома */
  open: boolean;
}

/**
 * Складає орієнтовну вартість робіт.
 * fixed додається точно, range — мінімум і максимум, from — лише до мінімуму й робить суму відкритою.
 */
export function estimate(lines: Line[]): Estimate {
  const priced: Line[] = [];
  const quoted: Line[] = [];
  let min = 0, max = 0, open = false;
  for (const l of lines) {
    const p = l.item.price;
    if (p.kind === "quote") {
      quoted.push(l);
      continue;
    }
    priced.push(l);
    if (p.kind === "fixed") {
      min += p.amount * l.qty;
      max += p.amount * l.qty;
    } else if (p.kind === "range") {
      min += p.min * l.qty;
      max += p.max * l.qty;
    } else {
      min += p.amount * l.qty;
      max += p.amount * l.qty;
      open = true;
    }
  }
  return { priced, quoted, min, max, open };
}

export function estimateText(e: Estimate, fmt: (n: number) => string, amount: (n: number) => string): string {
  if (!e.priced.length) return "";
  if (e.open) return `від ${fmt(e.min)}`;
  if (e.min === e.max) return fmt(e.min);
  return `${amount(e.min)}–${fmt(e.max)}`;
}
