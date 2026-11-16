import { h } from "../lib/jsx";
import { Layout } from "../components/Layout";
import { Picture } from "../components/Picture";
import { PriceRow, PriceLegend } from "../components/Price";
import { SpecPlate, CtaBand } from "../components/Blocks";
import { Icon } from "../components/Icon";
import { business } from "../data/business";
import { categories, services, symptoms } from "../data/services";
import { prices } from "../data/prices";

export function HomePage() {
  const featured = prices.filter((p) => p.featured);
  return (
    <Layout
      title={`${business.name} — автосервіс у Вінниці`}
      description="Незалежний автосервіс у Вінниці: ТО, діагностика, гальма, ходова, шини, кондиціонер, гібриди. Ціни на сайті, вартість узгоджуємо до початку робіт."
      path="/"
      section="home"
    >
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap hero__grid">
          <div className="hero__text">
            <h1 className="display-1 hero__title" id="hero-title">
              <span className="hero__line">Автосервіс Halfshaft</span> <span className="hero__line">у Вінниці</span>
            </h1>
            <p className="lead hero__lead">
              Обслуговуємо й ремонтуємо легкові авто різних марок, зокрема гібриди. Спершу знаходимо причину, потім називаємо ціну, і лише після вашої згоди беремося до роботи.
            </p>
            <div className="actions hero__actions">
              <a className="btn btn--primary" href="/booking">
                Подати заявку
              </a>
              <a className="btn" href="/pricing">
                Переглянути ціни
              </a>
            </div>
            <SpecPlate />
          </div>
          <figure className="hero__media frame">
            <Picture
              name="hero-bay"
              alt="Бокс майстерні: легкове авто піднято на підйомнику для огляду знизу"
              sizes="(min-width: 900px) 58vw, 100vw"
              priority
            />
          </figure>
        </div>
      </section>

      <section className="section" aria-labelledby="cats-title">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div>
              <h2 className="h2" id="cats-title">
                Що ремонтуємо
              </h2>
              <p className="lead">Від заміни оливи до гібридної системи. У кожному розділі — що саме робимо й скільки це коштує.</p>
            </div>
            <a className="text-btn" href="/services">
              Усі послуги <Icon name="arrow" />
            </a>
          </div>
          <ul role="list" className="cat-grid" data-reveal-group>
            {categories.map((c) => {
              const count = services.filter((s) => s.category === c.id).length;
              return (
                <li className="cat-tile" data-reveal>
                  <a href={`/services#${c.id}`} className="cat-tile__link">
                    <div className="cat-tile__media frame">
                      <Picture name={c.image} alt="" sizes="(min-width: 1100px) 22vw, (min-width: 600px) 45vw, 92vw" />
                    </div>
                    <h3 className="h3 cat-tile__name">{c.name}</h3>
                    <p className="cat-tile__blurb muted small">{c.blurb}</p>
                    <span className="cat-tile__count small">
                      {count} {count === 1 ? "послуга" : count < 5 ? "послуги" : "послуг"}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section section--band" aria-labelledby="sym-title">
        <div className="wrap symptoms">
          <div className="symptoms__head">
            <h2 className="h2" id="sym-title">
              Не знаєте, як це називається?
            </h2>
            <p className="lead">Оберіть, що відбувається з авто, — покажемо, з чого почати і скільки коштує перший крок.</p>
          </div>
          <ul role="list" className="symptom-list">
            {symptoms.map((s) => (
              <li>
                <a className="symptom" href={`/services/${s.service}`}>
                  <span>{s.label}</span>
                  <Icon name="chevron" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="prices-title">
        <div className="wrap price-preview">
          <div className="section-head section-head--split">
            <div>
              <h2 className="h2" id="prices-title">
                Ціни на часті роботи
              </h2>
              <p className="lead">Вартість роботи в гривнях. Запчастини рахуємо окремо й узгоджуємо до початку ремонту.</p>
            </div>
            <a className="btn" href="/pricing">
              Весь прайс
            </a>
          </div>
          <div className="paper sheet">
            <ul role="list" className="price-list">
              {featured.map((p) => (
                <PriceRow item={p} />
              ))}
            </ul>
            <div className="sheet__foot">
              <PriceLegend />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--band" aria-labelledby="process-title">
        <div className="wrap">
          <div className="section-head">
            <h2 className="h2" id="process-title">
              Як проходить ремонт
            </h2>
            <p className="lead">Три кроки, і на кожному ви знаєте, що відбувається з авто й скільки це коштуватиме.</p>
          </div>
          <ol role="list" className="process" data-reveal-group>
            <li className="process__step" data-reveal>
              <span className="process__num num" aria-hidden="true">1</span>
              <h3 className="h3">Знаходимо причину</h3>
              <p className="muted">
                Оглядаємо авто на підйомнику, зчитуємо помилки, за потреби робимо тест-драйв. Фото й заміри надсилаємо вам.
              </p>
            </li>
            <li className="process__step" data-reveal>
              <span className="process__num num" aria-hidden="true">2</span>
              <h3 className="h3">Узгоджуємо вартість</h3>
              <p className="muted">
                Називаємо ціну роботи й запчастин до початку ремонту. Якщо по ходу знайдеться ще щось, зупиняємось і питаємо.
              </p>
            </li>
            <li className="process__step" data-reveal>
              <span className="process__num num" aria-hidden="true">3</span>
              <h3 className="h3">Повертаємо авто</h3>
              <p className="muted">
                Показуємо, що замінили, віддаємо старі деталі й акт виконаних робіт з пробігом і рекомендаціями.
              </p>
            </li>
          </ol>
          <p className="process__more">
            <a className="text-btn" href="/about">
              Детальніше про правила майстерні <Icon name="arrow" />
            </a>
          </p>
        </div>
      </section>

      <CtaBand
        title="Запишіться на зручний час"
        text="Оберіть послугу або опишіть, що турбує, і вкажіть бажані дату й час. Займе дві хвилини."
      >
        <a className="btn" href="/contacts">
          Як нас знайти
        </a>
      </CtaBand>
    </Layout>
  );
}
