import { h, type Child } from "../lib/jsx";
import { business } from "../data/business";
import { hoursRows } from "../lib/hours";
import { Icon } from "./Icon";

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Навігаційний ланцюжок">
      <ol role="list">
        {items.map((it, i) => (
          <li>
            {it.href && i < items.length - 1 ? <a href={it.href}>{it.label}</a> : <span aria-current="page">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Таблиця годин роботи */
export function HoursTable({ className = "hours" }: { className?: string }) {
  return (
    <dl className={className}>
      {hoursRows(business.hours).map((r) => (
        <div className={r.closed ? "is-closed" : undefined}>
          <dt>
            <span aria-hidden="true">{r.days}</span>
            <span className="sr-only">{r.daysLong}</span>
          </dt>
          <dd className="num">{r.time}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CtaBand({ title, text, href = "/booking", label = "Подати заявку", children }: { title: string; text: string; href?: string; label?: string; children?: Child }) {
  return (
    <section className="cta-band band--ink" aria-labelledby="cta-title">
      <div className="container cta-band__inner">
        <div className="cta-band__text">
          <h2 id="cta-title">{title}</h2>
          <p className="lead">{text}</p>
        </div>
        <div className="actions">
          <a className="btn btn--primary" href={href}>
            {label}
          </a>
          {children}
        </div>
      </div>
    </section>
  );
}

export function ContactActions() {
  return (
    <ul role="list" className="contact-actions">
      {business.phone ? (
        <li>
          <a className="btn" href={business.phone.href}>
            <Icon name="phone" /> {business.phone.label}
          </a>
        </li>
      ) : null}
      {business.email ? (
        <li>
          <a className="btn" href={business.email.href}>
            <Icon name="mail" /> {business.email.label}
          </a>
        </li>
      ) : null}
      {business.messengers.map((m) => (
        <li>
          <a className="btn" href={m.href} rel="noopener">
            {m.label}
          </a>
        </li>
      ))}
      {business.mapUrl ? (
        <li>
          <a className="btn" href={business.mapUrl} rel="noopener">
            <Icon name="map" /> Відкрити на мапі
          </a>
        </li>
      ) : null}
    </ul>
  );
}
