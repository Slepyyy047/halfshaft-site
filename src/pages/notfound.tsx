import { h } from "../lib/jsx";
import { Layout } from "../components/Layout";
import { Icon } from "../components/Icon";

export function NotFoundPage() {
  return (
    <Layout
      title="Сторінку не знайдено"
      description="Такої сторінки немає. Перейдіть до послуг, цін або на головну."
      path="/404"
      section="none"
      noindex
    >
      <section className="page-head notfound">
        <div className="wrap">
          <p className="notfound__code num" aria-hidden="true">404</p>
          <h1 className="display-2">Такої сторінки немає</h1>
          <p className="lead">Можливо, адреса змінилася або в посиланні помилка. Почніть з одного з розділів.</p>
          <ul role="list" className="notfound__links">
            <li>
              <a className="notfound__link" href="/services">
                <span>Послуги</span>
                <span className="small muted">Каталог робіт і симптоми</span>
                <Icon name="arrow" />
              </a>
            </li>
            <li>
              <a className="notfound__link" href="/pricing">
                <span>Ціни</span>
                <span className="small muted">Прайс із пошуком</span>
                <Icon name="arrow" />
              </a>
            </li>
            <li>
              <a className="notfound__link" href="/">
                <span>Головна</span>
                <span className="small muted">Про майстерню й години роботи</span>
                <Icon name="arrow" />
              </a>
            </li>
          </ul>
        </div>
      </section>
    </Layout>
  );
}
