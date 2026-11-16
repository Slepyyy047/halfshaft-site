import { h, raw, type Child } from "../lib/jsx";
import { business } from "../data/business";
import { categories } from "../data/services";
import { assets, nav, type Section } from "../lib/site";
import { photoCredits } from "../lib/images";
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

const FONTS =
  "https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Sans+Condensed:wght@600&display=swap";

export function Layout({ title, description, path, section, scripts = [], jsonLd = [], noindex, children }: LayoutProps) {
  const url = business.site.url + (path === "/" ? "/" : path);
  const fullTitle = path === "/" ? title : `${title} | ${business.name}`;
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
        <meta name="theme-color" content="#a9a49c" />
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link rel="stylesheet" href={FONTS} />
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

const hoursLine = () =>
  hoursRows(business.hours)
    .map((r) => `${r.days} ${r.time}`)
    .join(", ");

function Header({ section }: { section: Section }) {
  return (
    <header className="site-header" data-header>
      <div className="banner">
        <div className="container banner__inner">
          <p className="banner__status" data-open-status role="status">
            {hoursLine()}
          </p>
          <a className="banner__addr" href="/contacts#addr-title">
            {business.address.street}, {business.address.city}
          </a>
        </div>
      </div>
      <div className="bar">
        <div className="container bar__inner">
          <a className="site-header__logo" href="/" aria-label={`${business.name}, на головну`} aria-current={section === "home" ? "page" : undefined}>
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
          <a className="btn btn--small site-header__cta" href="/booking" aria-current={section === "booking" ? "page" : undefined}>
            Подати заявку
          </a>
          <button className="menu-btn" type="button" aria-expanded="false" aria-controls="drawer" data-menu-open>
            <Icon name="menu" />
            <span className="sr-only">Відкрити меню</span>
          </button>
        </div>
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
          <a className="drawer__logo" href="/" aria-label={`${business.name}, на головну`} aria-current={section === "home" ? "page" : undefined}>
            <Logo />
          </a>
          <button className="menu-btn" type="button" data-drawer-close>
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
            {hoursLine()}
          </p>
          <p className="small">
            {business.address.street}, {business.address.city}
          </p>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const rows = hoursRows(business.hours);
  const credits = photoCredits();
  // one author with several photos is credited once, each photo still linked to its page
  function creditGroups(list: typeof credits) {
    const groups: { author: string; license: string; pages: string[] }[] = [];
    for (const c of list) {
      const g = groups.find((x) => x.author === c.author && x.license === c.license);
      if (g) g.pages.push(c.page);
      else groups.push({ author: c.author, license: c.license, pages: [c.page] });
    }
    return groups;
  }
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <a href="/" aria-label={`${business.name}, на головну`}>
              <Logo />
            </a>
            <p className="small">{business.summary}</p>
          </div>
          <div>
            <h2 className="site-footer__title">Послуги</h2>
            <ul role="list" className="site-footer__links">
              {categories.map((c) => (
                <li>
                  <a href={`/services#${c.id}`}>{c.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="site-footer__title">Розділи</h2>
            <ul role="list" className="site-footer__links">
              <li><a href="/pricing">Ціни</a></li>
              <li><a href="/about">Про нас</a></li>
              <li><a href="/contacts">Контакти</a></li>
              <li><a href="/booking">Онлайн-заявка</a></li>
            </ul>
          </div>
          <div>
            <h2 className="site-footer__title">Години</h2>
            <dl className="hours hours--compact">
              {rows.map((r) => (
                <div>
                  <dt>{r.days}</dt>
                  <dd>{r.time}</dd>
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
                <a href={business.phone.href}>{business.phone.label}</a>
              </p>
            ) : null}
            {business.email ? (
              <p className="small">
                <a href={business.email.href}>{business.email.label}</a>
              </p>
            ) : null}
          </div>
        </div>
        <div className="site-footer__base">
          {credits.length ? (
            <p data-credits>
              Фото з Wikimedia Commons:{" "}
              {creditGroups(credits).map((g, i) => (
                <span>
                  {i > 0 ? "; " : ""}
                  {g.pages.length === 1 ? (
                    <a href={g.pages[0]} rel="noopener">
                      {g.author}
                    </a>
                  ) : (
                    g.author
                  )}
                  , {g.license}
                  {g.pages.length > 1
                    ? g.pages.map((page, j) => (
                        <span>
                          {", "}
                          <a href={page} rel="noopener">
                            кадр {j + 1}
                          </a>
                        </span>
                      ))
                    : ""}
                </span>
              ))}
              .
            </p>
          ) : null}
          <p>
            © {new Date().getFullYear()} {business.name}. Ціни на сайті: вартість робіт без запчастин, якщо не вказано інше.
          </p>
        </div>
      </div>
    </footer>
  );
}
