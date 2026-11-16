import { h } from "../lib/jsx";
import { Layout } from "../components/Layout";
import { PriceRow, PriceLegend } from "../components/Price";
import { Icon } from "../components/Icon";
import { categories } from "../data/services";
import { prices } from "../data/prices";
import { serviceBySlug } from "../data/services";

export function PricingPage() {
  const groups = categories.map((c) => ({ cat: c, rows: prices.filter((p) => serviceBySlug(p.service)!.category === c.id) }));
  return (
    <Layout
      title="Ціни на ремонт і обслуговування авто"
      description="Прайс Halfshaft у Вінниці: заміна оливи, колодок, амортизаторів, шиномонтаж, розвал-сходження, кондиціонер, діагностика гібридів. Пошук і фільтри за розділами."
      path="/pricing"
      section="pricing"
      scripts={["pricing"]}
    >
      <section className="page-head">
        <div className="wrap page-head__grid">
          <div>
            <h1 className="display-2">Ціни</h1>
            <p className="lead">
              Вартість роботи в гривнях. Запчастини оплачуються окремо, якщо в рядку не вказано інше. Остаточну суму узгоджуємо після огляду, до початку робіт.
            </p>
          </div>
          <PriceLegend />
        </div>
      </section>

      <div className="pricing" data-pricing>
        <div className="pricing__bar" data-js-only>
          <div className="wrap pricing__bar-inner">
            <div className="search">
              <label className="sr-only" htmlFor="price-search">
                Пошук у прайсі
              </label>
              <Icon name="search" className="icon search__icon" />
              <input
                id="price-search"
                type="search"
                className="search__input"
                placeholder="Наприклад, колодки або R17"
                autocomplete="off"
                enterkeyhint="search"
                data-search
              />
              <button type="button" className="search__clear" data-search-clear hidden>
                <Icon name="close" />
                <span className="sr-only">Очистити пошук</span>
              </button>
            </div>
            <div className="filters" role="group" aria-label="Розділ прайсу">
              <button type="button" className="chip" aria-pressed="true" data-cat-filter="all">
                Усі <span className="count">{prices.length}</span>
              </button>
              {groups.map((g) => (
                <button type="button" className="chip" aria-pressed="false" data-cat-filter={g.cat.id}>
                  {g.cat.name} <span className="count">{g.rows.length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="wrap pricing__body">
          <p className="pricing__status small muted" role="status" aria-live="polite" data-result-status></p>
          <div className="paper sheet sheet--pricing">
            {groups.map((g) => (
              <section className="price-group" data-group={g.cat.id} aria-labelledby={`g-${g.cat.id}`}>
                <h2 className="price-group__title" id={`g-${g.cat.id}`}>
                  <a href={`/services#${g.cat.id}`}>{g.cat.name}</a>
                </h2>
                <ul role="list" className="price-list">
                  {g.rows.map((p) => (
                    <PriceRow item={p} selectable />
                  ))}
                </ul>
              </section>
            ))}
            <div className="empty" data-empty hidden>
              <h2 className="h3">Нічого не знайшли</h2>
              <p data-empty-text>Спробуйте інше слово або скиньте фільтри.</p>
              <div className="actions">
                <button type="button" className="btn btn--primary" data-reset>
                  Скинути фільтри
                </button>
                <a className="btn" href="/booking?mode=symptom">
                  Описати проблему в заявці
                </a>
              </div>
            </div>
          </div>
          <p className="pricing__foot small muted">
            Ціни дійсні для легкових авто й кросоверів. Для складних компонувань вартість може відрізнятися — назвемо її до запису.
          </p>
        </div>
      </div>

      <aside className="dock" data-dock hidden aria-labelledby="dock-title">
        <div className="dock__bar">
          <button type="button" className="dock__toggle" aria-expanded="false" aria-controls="dock-panel" data-dock-toggle>
            <span className="dock__count num" data-dock-count>0</span>
            <span className="dock__summary">
              <span id="dock-title" className="dock__title">Розрахунок</span>
              <span className="dock__total num" data-dock-total></span>
            </span>
            <Icon name="down" className="icon dock__chev" />
          </button>
          <a className="btn btn--primary btn--small dock__cta" href="/booking?from=selection">
            Записатися
          </a>
        </div>
        <div className="dock__panel" id="dock-panel" data-dock-panel hidden>
          <ul role="list" className="dock__list" data-dock-list></ul>
          <div className="dock__quotes" data-dock-quotes hidden>
            <h3 className="dock__subtitle">Ціну назвемо після огляду</h3>
            <ul role="list" className="dock__list" data-dock-quote-list></ul>
          </div>
          <div className="dock__sum">
            <span>Орієнтовно за роботи</span>
            <strong className="num" data-dock-sum></strong>
          </div>
          <p className="dock__note small">Без запчастин. Остаточну суму узгодимо після огляду.</p>
          <div className="dock__actions">
            <a className="btn btn--primary btn--block" href="/booking?from=selection">
              Записатися з цими роботами
            </a>
            <button type="button" className="text-btn" data-dock-clear>
              Почати спочатку
            </button>
          </div>
        </div>
      </aside>
    </Layout>
  );
}
