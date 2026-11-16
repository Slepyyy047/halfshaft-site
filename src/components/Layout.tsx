import { h, raw, Fragment, type Child } from "../lib/jsx";
import { business } from "../data/business";
import { assets, nav, type Section } from "../lib/site";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { hoursRows } from "../lib/hours";

interface LayoutProps {
  title: string;
  description: string;
  path: string;
  section: Section;
  scripts?: string[];
  jsonLd?: object[];
  noindex?: boolean;
  children?: Child;
}

export function Layout({ title, description, path, section, scripts = [], jsonLd = [], noindex, children }: LayoutProps) {
  const url = business.site.url + (path === "/" ? "/" : path);
  const fullTitle = path === "/" ? title : `${title} — ${business.name}`;
  const robots = !business.site.indexable || noindex ? "noindex, nofollow" : "index, follow";
  return (
    <html lang="uk">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="robots" content={robots} />
        <link rel="canonical" href={url} />
        <meta name="theme-color" content="#121517" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={business.site.locale} />
        <meta property="og:site_name" content={business.name} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${business.site.url}/og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        {assets.fonts === "local" ? (
          <>
            <link rel="preload" href="/fonts/inter-400.woff" as="font" type="font/woff" crossorigin="" />
            <link rel="preload" href="/fonts/inter-display-800.woff" as="font" type="font/woff" crossorigin="" />
          </>
        ) : (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..800&display=swap" />
          </>
        )}
        <link rel="stylesheet" href={assets.css} />
        {jsonLd.map((d) => (
          <script type="application/ld+json">{raw(JSON.stringify(d).replace(/</g, "\\u003c"))}</script>
        ))}
        <script>{raw(`document.documentElement.classList.add("js")`)}</script>
      </head>
      <body data-section={section}>
        <a className="skip-link" href="#main">
          Перейти до змісту
        </a>
        <Header section={section} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <Drawer section={section} />
        <script type="module" src={assets.scripts.site}></script>
        {scripts.map((s) => (
          <script type="module" src={assets.scripts[s]}></script>
        ))}
      </body>
    </html>
  );
}

function Header({ section }: { section: Section }) {
  return (
    <header className="site-header" data-header>
      <div className="wrap site-header__inner">
        <a className="site-header__logo" href="/" aria-label={`${business.name} — на головну`} aria-current={section === "home" ? "page" : undefined}>
          <Logo />
        </a>
        <nav className="site-nav" aria-label="Основна навігація">
          <ul role="list">
            {nav.map((n) => (
              <li>
                <a href={n.href} aria-current={section === n.section ? "page" : undefined}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="btn btn--primary btn--small site-header__cta" href="/booking" aria-current={section === "booking" ? "page" : undefined}>
          Подати заявку
        </a>
        <button className="menu-btn" type="button" aria-expanded="false" aria-controls="drawer" data-menu-open>
          <Icon name="menu" />
          <span className="sr-only">Відкрити меню</span>
        </button>
      </div>
    </header>
  );
}

function Drawer({ section }: { section: Section }) {
  return (
    <div className="drawer" id="drawer" data-drawer hidden>
      <div className="drawer__backdrop" data-drawer-close></div>
      <div className="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabIndex={-1}>
        <div className="drawer__head">
          <h2 className="sr-only" id="drawer-title">
            Меню
          </h2>
          <a className="drawer__logo" href="/" aria-label={`${business.name} — на головну`} aria-current={section === "home" ? "page" : undefined}>
            <Logo />
          </a>
          <button className="menu-btn menu-btn--close" type="button" data-drawer-close>
            <Icon name="close" />
            <span className="sr-only">Закрити меню</span>
          </button>
        </div>
        <nav aria-label="Меню для мобільних">
          <ul role="list" className="drawer__nav">
            <li>
              <a href="/" aria-current={section === "home" ? "page" : undefined}>
                Головна
              </a>
            </li>
            {nav.map((n) => (
              <li>
                <a href={n.href} aria-current={section === n.section ? "page" : undefined}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="drawer__foot">
          <a className="btn btn--primary btn--block" href="/booking" aria-current={section === "booking" ? "page" : undefined}>
            Подати заявку
          </a>
          <p className="drawer__status small" data-open-status>
            {hoursRows(business.hours).map((r) => `${r.days} ${r.time}`).join(", ")}
          </p>
          <p className="small muted">
            {business.address.street}, {business.address.city}
          </p>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const rows = hoursRows(business.hours);
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__grid">
        <div className="site-footer__brand">
          <a href="/" aria-label={`${business.name} — на головну`}>
            <Logo />
          </a>
          <p className="small muted">{business.summary}</p>
        </div>
        <div>
          <h2 className="site-footer__title">Розділи</h2>
          <ul role="list" className="site-footer__links">
            <li><a href="/services">Послуги</a></li>
            <li><a href="/pricing">Ціни</a></li>
            <li><a href="/about">Про нас</a></li>
            <li><a href="/contacts">Контакти</a></li>
            <li><a href="/booking">Онлайн-заявка</a></li>
          </ul>
        </div>
        <div>
          <h2 className="site-footer__title">Години роботи</h2>
          <dl className="hours hours--compact">
            {rows.map((r) => (
              <div>
                <dt>{r.days}</dt>
                <dd className="num">{r.time}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="site-footer__title">Адреса</h2>
          <p className="small">
            {business.address.street}
            <br />
            {business.address.city}
          </p>
          {business.phone ? (
            <p className="small">
              <a className="link" href={business.phone.href}>{business.phone.label}</a>
            </p>
          ) : null}
          {business.email ? (
            <p className="small">
              <a className="link" href={business.email.href}>{business.email.label}</a>
            </p>
          ) : null}
        </div>
      </div>
      <div className="wrap site-footer__base small muted">
        <p>© {new Date().getFullYear()} {business.name}</p>
        <p>Ціни на сайті — вартість робіт без запчастин, якщо не вказано інше.</p>
      </div>
    </footer>
  );
}
