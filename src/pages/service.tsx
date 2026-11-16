import { h } from "../lib/jsx";
import { Layout } from "../components/Layout";
import { Picture } from "../components/Picture";
import { PriceRow } from "../components/Price";
import { Breadcrumbs, CtaBand } from "../components/Blocks";
import { Icon } from "../components/Icon";
import { business } from "../data/business";
import { categoryById, serviceBySlug } from "../data/services";
import { pricesForService } from "../data/prices";
import type { Service } from "../data/types";
import { startingPrice } from "./services";
import { priceText } from "../lib/format";

export function ServicePage({ service }: { service: Service }) {
  const cat = categoryById(service.category);
  const rows = pricesForService(service.slug);
  const related = service.related.map(serviceBySlug).filter(Boolean) as Service[];
  const sp = startingPrice(service.slug);
  const bookHref = `/booking?service=${service.slug}`;
  const desc = `${service.name} у Вінниці${sp ? `: ${priceText(sp)} за роботу` : ""}. ${service.short}`;
  return (
    <Layout
      title={service.name}
      description={desc}
      path={`/services/${service.slug}`}
      section="services"
      jsonLd={[
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Послуги", item: `${business.site.url}/services` },
            { "@type": "ListItem", position: 2, name: cat.name, item: `${business.site.url}/services#${cat.id}` },
            { "@type": "ListItem", position: 3, name: service.name },
          ],
        },
      ]}
    >
      <article>
        <header className="svc-head">
          <div className="wrap svc-head__grid">
            <div className="svc-head__text">
              <Breadcrumbs
                items={[
                  { href: "/services", label: "Послуги" },
                  { href: `/services#${cat.id}`, label: cat.name },
                  { label: service.name },
                ]}
              />
              <h1 className="display-2">{service.name}</h1>
              <p className="lead">{service.lead}</p>
              <div className="actions">
                <a className="btn btn--primary" href={bookHref}>
                  Записатися на цю послугу
                </a>
                <a className="btn" href="#price">
                  Ціна
                </a>
              </div>
              <p className="svc-head__duration small muted">
                <Icon name="clock" /> {service.duration}
              </p>
            </div>
            <figure className="svc-head__media frame">
              <Picture name={service.image ?? cat.image} alt={`${cat.name}: ілюстрація до послуги «${service.name}»`} sizes="(min-width: 900px) 45vw, 100vw" priority />
            </figure>
          </div>
        </header>

        <div className="wrap svc-body">
          <section className="svc-section" aria-labelledby="reasons-title">
            <h2 className="h3" id="reasons-title">
              Коли до нас звертаються
            </h2>
            <ul className="bullets">
              {service.reasons.map((r) => (
                <li>{r}</li>
              ))}
            </ul>
          </section>

          <section className="svc-section" aria-labelledby="checks-title">
            <h2 className="h3" id="checks-title">
              Що робимо
            </h2>
            <ul role="list" className="checklist">
              {service.checks.map((c) => (
                <li>
                  <Icon name="check" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="svc-section svc-price" id="price" aria-labelledby="price-title">
            <div className="paper sheet">
              <div className="sheet__head">
                <h2 className="h3" id="price-title">
                  Ціна
                </h2>
                <p className="small">{service.pricingBasis}</p>
              </div>
              <ul role="list" className="price-list">
                {rows.map((r) => (
                  <PriceRow item={r} link={false} />
                ))}
              </ul>
              <div className="sheet__foot">
                {service.partsNote ? <p className="small">{service.partsNote}</p> : null}
                <div className="actions">
                  <a className="btn btn--primary" href={bookHref}>
                    Записатися на цю послугу
                  </a>
                  <a className="btn" href={`/pricing?cat=${cat.id}`}>
                    Усі ціни розділу
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="svc-section svc-note" aria-labelledby="diag-title">
            <h2 className="h3" id="diag-title">
              Якщо спершу потрібна діагностика
            </h2>
            <p>{service.diagnosisFirst}</p>
            <p className="muted small">Вартість понад погоджену ми не додаємо: кожну додаткову роботу узгоджуємо з вами окремо.</p>
          </section>
        </div>

        {related.length ? (
          <section className="section section--tight related" aria-labelledby="rel-title">
            <div className="wrap">
              <h2 className="h3" id="rel-title">
                Часто разом із цим
              </h2>
              <ul role="list" className="related__list">
                {related.map((r) => {
                  const rp = startingPrice(r.slug);
                  return (
                    <li>
                      <a className="related__item" href={`/services/${r.slug}`}>
                        <span className="related__name">{r.name}</span>
                        <span className="related__short small muted">{r.short}</span>
                        {rp ? <span className="related__price small num">{priceText(rp)}</span> : null}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ) : null}
      </article>

      <CtaBand
        title="Запишіться на огляд"
        text="Послугу буде вже обрано у формі. Залишиться вказати авто, бажаний час і телефон."
        href={bookHref}
        label="Подати заявку"
      />
    </Layout>
  );
}
