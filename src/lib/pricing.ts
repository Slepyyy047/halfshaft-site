import type { Price, PriceItem } from "../data/types";

/** Підсумкова ціна послуги для каталогу: одна фіксована або «від» мінімальної */
export function startingPrice(slug: string, all: PriceItem[]): Price | null {
  const rows = all.filter((p) => p.service === slug);
  if (!rows.length) return null;
  const known = rows.filter((p) => p.price.kind !== "quote");
  if (!known.length) return { kind: "quote" };
  if (known.length === 1 && rows.length === 1 && known[0].price.kind !== "from") return known[0].price;
  const min = Math.min(...known.map((p) => (p.price.kind === "range" ? p.price.min : (p.price as { amount: number }).amount)));
  return { kind: "from", amount: min };
}
