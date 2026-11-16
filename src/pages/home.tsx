import { h } from "../lib/jsx";
import { Layout } from "../components/Layout";
import { Picture } from "../components/Picture";
import { PriceRow, PriceLegend, PriceTag } from "../components/Price";
import { business } from "../data/business";
import { categories, services, symptoms, serviceBySlug } from "../data/services";
import { prices } from "../data/prices";
import { startingPrice } from "../lib/pricing";
import { hoursFor, showTime } from "../lib/hours";
import { plural, priceText } from "../lib/format";

const WEEK = [
  { d: 1, name: "Пн" },
  { d: 2, name: "Вт" },
  { d: 3, name: "Ср" },
  { d: 4, name: "Чт" },
  { d: 5, name: "Пт" },
  { d: 6, name: "Сб" },
  { d: 0, name: "Нд" },
];

export function HomePage() {
  const featured = prices.filter((p) => p.featured);
  return (
    <Layout
      title={`${business.name}: автосервіс у Вінниці`}
      description="Незалежний автосервіс у Вінниці: ТО, діагностика, гальма, ходова, шини, кондиціонер, гібриди. Ціни на сайті, вартість узгоджуємо до початку робіт."
      path="/"
      section="home"
    >
      {/* Hero: Ledge. The workshop is the field; the name rests at its base. */}
      <section className="hero" aria-labelledby="hero-title">
        <Picture
          name="hero-bay"
          className="hero__photo"
          slot="hero"
          alt="Легкове авто на підйомнику в боксі, біля колеса розкладено інструмент"
          slotAlt="Ваш бокс: авто на підйомнику, механік за роботою"
          sizes="100vw"
          focus="50% 45%"
          priority
        />
        <div className="hero__scrim" aria-hidden="true"></div>
        <div className="container hero__content">
          <h1 className="hero__title" id="hero-title">
            <span className="hero__line">Автосервіс Halfshaft</span>
            <span className="hero__line">у Вінниці</span>
          </h1>
          <div className="hero__foot">
            <p className="lead hero__lead">Знаходимо причину, називаємо ціну, ремонтуємо лише з вашої згоди.</p>
            <div className="actions hero__actions">
              <a className="btn btn--primary" href="/booking">
                Подати заявку
              </a>
              <a className="btn btn--ghost" href="/pricing">
                Переглянути ціни
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What we repair: an index of the work, each row with its starting price */}
      <section className="section" aria-labelledby="cats-title">
        <div className="container">
          <div className="section-head section-head--split">
            <h2 id="cats-title">Що ремонтуємо</h2>
            <p className="lead">{business.vehicleScope.short}. Від заміни оливи до гібридної системи.</p>
          </div>
          <ul role="list" className="index-list">
            {categories.map((c) => {
              const list = services.filter((s) => s.category === c.id);
              const minPrice = list
                .map((s) => startingPrice(s.slug, prices))
                .filter((p) => p && p.kind !== "quote")
                .map((p) => (p!.kind === "range" ? p!.min : (p as { amount: number }).amount));
              return (
                <li className="index-row">
                  <a href={`/services#${c.id}`}>
                    <span className="index-row__name">{c.name}</span>
                    <span className="index-row__blurb">{c.blurb}</span>
                    <span className="index-row__count small">
                      {list.length} {plural(list.length, "послуга", "послуги", "послуг")}
                    </span>
                    <span className="index-row__price">{minPrice.length ? <PriceTag price={{ kind: "from", amount: Math.min(...minPrice) }} /> : null}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Symptoms: the driver's words, mapped to where we start and what it costs */}
      <section className="section band--cast" aria-labelledby="sym-title">
        <div className="container symptoms">
          <div className="symptoms__head">
            <h2 id="sym-title">Не знаєте, як це називається?</h2>
            <p className="lead">Оберіть, що відбувається з авто. Покажемо, з чого почати і скільки коштує перший крок.</p>
          </div>
          <ul role="list" className="symptom-list">
            {symptoms.map((s) => {
              const svc = serviceBySlug(s.service)!;
              const sp = startingPrice(svc.slug, prices);
              return (
                <li>
                  <a className="symptom" href={`/services/${s.service}`}>
                    <span className="symptom__label">{s.label}</span>
                    <span className="symptom__to">
                      {svc.name}
                      {sp && sp.kind !== "quote" ? `, ${priceText(sp)}` : null}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Prices: the frequent jobs, cast as a plate */}
      <section className="section" aria-labelledby="prices-title">
        <div className="container">
          <div className="section-head">
            <h2 id="prices-title">Ціни на часті роботи</h2>
          </div>
          <div className="price-preview">
            <div className="plate sheet">
              <ul role="list" className="price-list">
                {featured.map((p) => (
                  <PriceRow item={p} />
                ))}
              </ul>
            </div>
            <div className="price-preview__aside">
              <p className="lead">Вартість роботи в гривнях. Запчастини рахуємо окремо й узгоджуємо до початку ремонту.</p>
              <PriceLegend />
              <p>
                <a className="text-link" href="/pricing">
                  Весь прайс
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How a repair goes: three pours */}
      <section className="section band--cast" aria-labelledby="process-title">
        <div className="container">
          <div className="section-head section-head--split">
            <h2 id="process-title">Як проходить ремонт</h2>
            <p className="lead">На кожному кроці ви знаєте, що відбувається з авто й скільки це коштуватиме.</p>
          </div>
          <ol role="list" className="pour">
            <li className="pour__step">
              <h3>Знаходимо причину</h3>
              <p>Оглядаємо авто на підйомнику, зчитуємо помилки, за потреби робимо тест-драйв. Фото й заміри надсилаємо вам.</p>
            </li>
            <li className="pour__step">
              <h3>Узгоджуємо вартість</h3>
              <p>Називаємо ціну роботи й запчастин до початку ремонту. Якщо по ходу знайдеться ще щось, зупиняємось і питаємо.</p>
            </li>
            <li className="pour__step">
              <h3>Повертаємо авто</h3>
              <p>Показуємо, що замінили, віддаємо старі деталі й акт виконаних робіт з пробігом і рекомендаціями.</p>
            </li>
          </ol>
          <p className="pour__more">
            <a className="text-link" href="/about">
              Детальніше про правила майстерні
            </a>
          </p>
        </div>
      </section>

      {/* The bench, full bleed, no head */}
      <Picture
        name="bench"
        className="bench"
        alt="Верстак під вікном майстерні, на ньому розкладені гайкові ключі"
        slotAlt="Ваш верстак або стенд з інструментом"
        sizes="100vw"
        focus="50% 55%"
      />

      {/* Hours and the address, a section of its own, with the next times to request */}
      <section className="section" aria-labelledby="visit-title">
        <div className="container visit">
          <div className="visit__place">
            <h2 id="visit-title">Години й адреса</h2>
            <p className="visit__address">
              {business.address.street}, {business.address.city}
            </p>
            <div className="visit__notes">
              {business.arrival.slice(0, 2).map((a) => (
                <p>{a}</p>
              ))}
            </div>
            <p>
              <a className="text-link" href="/contacts">
                Як заїхати й залишити авто
              </a>
            </p>
          </div>
          <div className="visit__times">
            <ol role="list" className="week" aria-label="Години роботи за днями" data-week>
              {WEEK.map((w) => {
                const hrs = hoursFor(business.hours, w.d);
                return (
                  <li className="week__day" data-day={w.d}>
                    <span className="week__name">{w.name}</span>
                    <span className="week__time">{hrs ? `${showTime(hrs.open)}-${showTime(hrs.close)}` : "вихідний"}</span>
                  </li>
                );
              })}
            </ol>
            <div className="times" data-js-only>
              <h3>Найближчий час для заявки</h3>
              <div className="times__grid" data-next-times></div>
              <p className="times__note">Це бажаний час: майстерня підтвердить його або запропонує інший.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The close: the booking beside one last photograph */}
      <section className="section band--ink" aria-labelledby="cta-title">
        <div className="container close">
          <div className="close__text">
            <h2 id="cta-title">Запишіться на зручний час</h2>
            <p className="lead">Оберіть послугу або опишіть, що турбує, і вкажіть бажані дату й час. Займе дві хвилини.</p>
            <div className="actions">
              <a className="btn btn--primary" href="/booking">
                Подати заявку
              </a>
              <a className="btn btn--ghost" href="/contacts">
                Як нас знайти
              </a>
            </div>
          </div>
          <Picture
            name="mechanic"
            className="close__photo"
            alt="Механік у рукавицях підпирає стійкою підвіску піднятого авто"
            slotAlt="Механік вашої майстерні за роботою"
            sizes="(min-width: 60rem) 40vw, 100vw"
            focus="50% 40%"
          />
        </div>
      </section>
    </Layout>
  );
}
