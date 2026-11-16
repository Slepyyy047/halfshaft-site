import { h } from "../lib/jsx";
import type { Price as PriceT, PriceItem } from "../data/types";
import { formatAmount, priceKindLabel } from "../lib/format";
import { unitLabel } from "../data/prices";
import { serviceBySlug, categoryById } from "../data/services";
import { Icon } from "./Icon";

/** Ціна з візуальним розрізненням типу: фіксована / від / діапазон / після огляду */
export function PriceTag({ price }: { price: PriceT }) {
  const label = priceKindLabel[price.kind];
  switch (price.kind) {
    case "fixed":
      return (
        <span className="price price--fixed num" title={label}>
          {formatAmount(price.amount)}&nbsp;₴
        </span>
      );
    case "from":
      return (
        <span className="price price--from num" title={label}>
          <span className="price__pre">від</span> {formatAmount(price.amount)}&nbsp;₴
        </span>
      );
    case "range":
      return (
        <span className="price price--range num" title={label}>
          {formatAmount(price.min)}-{formatAmount(price.max)}&nbsp;₴
        </span>
      );
    case "quote":
      return <span className="price price--quote">Після огляду</span>;
  }
}

export function PartsNote({ parts }: { parts?: PriceItem["parts"] }) {
  if (parts === "included") return <span className="tag tag--ok"><Icon name="check" className="icon icon--xs" />матеріали включено</span>;
  if (parts === "excluded") return <span className="tag">запчастини окремо</span>;
  return null;
}

interface RowProps {
  item: PriceItem;
  /** Show link to the service page on the name */
  link?: boolean;
  /** Add "select" toggle for the pricing calculator */
  selectable?: boolean;
  /** Show category name (used in mixed lists) */
  showCategory?: boolean;
}

export function PriceRow({ item, link = true, selectable = false, showCategory = false }: RowProps) {
  const service = serviceBySlug(item.service)!;
  const cat = categoryById(service.category);
  const search = [item.name, item.note, service.name, cat.name, ...(service.keywords ?? [])].filter(Boolean).join(" ").toLowerCase();
  return (
    <li
      className="price-row"
      data-price-row
      data-id={item.id}
      data-cat={cat.id}
      data-search={search}
      data-kind={item.price.kind}
    >
      <div className="price-row__main">
        {link ? (
          <a className="price-row__name" href={`/services/${service.slug}`}>
            {item.name}
          </a>
        ) : (
          <span className="price-row__name">{item.name}</span>
        )}
        <div className="price-row__meta">
          {showCategory ? <span className="tag tag--plain">{cat.name}</span> : null}
          {item.unit ? <span className="tag tag--unit">{unitLabel[item.unit]}</span> : null}
          <PartsNote parts={item.parts} />
          {item.note ? <span className="price-row__note">{item.note}</span> : null}
        </div>
      </div>
      <div className="price-row__price">
        <PriceTag price={item.price} />
      </div>
      {selectable ? (
        <div className="price-row__action">
          <button className="add-btn" type="button" aria-pressed="false" data-add={item.id} aria-label={`Додати до розрахунку: ${item.name}`}>
            <Icon name="plus" className="icon add-btn__plus" />
            <Icon name="check" className="icon add-btn__check" />
            <span className="add-btn__label" aria-hidden="true">Додати</span>
          </button>
        </div>
      ) : null}
    </li>
  );
}

export function PriceLegend() {
  return (
    <dl className="legend" aria-label="Як читати ціни">
      <div>
        <dt><span className="price price--fixed num">650&nbsp;₴</span></dt>
        <dd>точна ціна роботи</dd>
      </div>
      <div>
        <dt><span className="price price--from num"><span className="price__pre">від</span> 400&nbsp;₴</span></dt>
        <dd>мінімум, точну суму назвемо після огляду</dd>
      </div>
      <div>
        <dt><span className="price price--range num">900-1&nbsp;800&nbsp;₴</span></dt>
        <dd>залежить від моделі, назвемо за VIN</dd>
      </div>
      <div>
        <dt><span className="price price--quote">Після огляду</span></dt>
        <dd>ціну називаємо лише після діагностики</dd>
      </div>
    </dl>
  );
}
