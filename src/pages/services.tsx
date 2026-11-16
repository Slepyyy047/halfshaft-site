import { h } from "../lib/jsx";
import { Layout } from "../components/Layout";
import { PriceTag } from "../components/Price";
import { CtaBand } from "../components/Blocks";
import { categories, services, symptoms } from "../data/services";
import { prices } from "../data/prices";
import { startingPrice as startingPriceOf } from "../lib/pricing";

export const startingPrice = (slug: string) => startingPriceOf(slug, prices);

export function ServicesPage() {
  return (
    <Layout
      title="Послуги автосервісу"
      description="Каталог послуг Halfshaft у Вінниці: ТО, діагностика, гальма, підвіска, шини, кондиціонер, гібриди, акумулятор. Ціни й опис робіт для кожної послуги."
      path="/services"
      section="services"
    >
      <section className="page-head">
        <div className="container">
          <h1>Послуги</h1>
          <p className="lead">
            Шукайте за групою робіт або почніть із симптому. Кожна послуга має сторінку з тим, що ми перевіряємо, і ціною.
          </p>
        </div>
      </section>

      <section className="container finder" aria-labelledby="finder-title">
        <h2 id="finder-title">
          Що турбує?
        </h2>
        <ul role="list" className="finder__list">
          {symptoms.map((s) => (
            <li>
              <a className="chip" href={`/services/${s.service}`}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <nav className="cat-nav" aria-label="Групи послуг">
        <div className="container">
          <ul role="list" className="cat-nav__list">
            {categories.map((c) => (
              <li>
                <a className="chip" href={`#${c.id}`}>
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="container catalog">
        {categories.map((c) => {
          const list = services.filter((s) => s.category === c.id);
          return (
            <section className="catalog__group" id={c.id} aria-labelledby={`${c.id}-title`}>
              <div className="catalog__aside">
                <h2 id={`${c.id}-title`}>
                  {c.name}
                </h2>
                <p>{c.blurb}</p>
              </div>
              <ul role="list" className="service-list">
                {list.map((s) => {
                  const sp = startingPrice(s.slug);
                  return (
                    <li>
                      <a className="service-item" href={`/services/${s.slug}`}>
                        <span className="service-item__text">
                          <span className="service-item__name">{s.name}</span>
                          <span className="service-item__short">{s.short}</span>
                        </span>
                        <span className="service-item__price">{sp ? <PriceTag price={sp} /> : null}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <CtaBand
        title="Не знайшли свою проблему?"
        text="Опишіть у заявці, що відбувається з авто. Почнемо з огляду й назвемо ціну до будь-яких робіт."
        href="/booking?mode=symptom"
        label="Описати проблему"
      >
        <a className="btn btn--ghost" href="/pricing">
          Переглянути ціни
        </a>
      </CtaBand>
    </Layout>
  );
}
