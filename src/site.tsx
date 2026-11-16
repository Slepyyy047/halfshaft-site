/**
 * Entry for the static build: lists every page and how to render it.
 * scripts/build.mjs bundles this file, fills asset and image registries, and writes dist/.
 */
import { h, type Html } from "./lib/jsx";
import { services } from "./data/services";
import { prices } from "./data/prices";
import { HomePage } from "./pages/home";
import { ServicesPage } from "./pages/services";
import { ServicePage } from "./pages/service";
import { PricingPage } from "./pages/pricing";
import { AboutPage } from "./pages/about";
import { ContactsPage } from "./pages/contacts";
import { BookingPage } from "./pages/booking";
import { NotFoundPage } from "./pages/notfound";

export { assets } from "./lib/site";
export { setImageManifest } from "./lib/images";
export { business } from "./data/business";

export interface PageDef {
  /** URL path without trailing slash */
  url: string;
  /** Output file relative to dist */
  file: string;
  render: () => Html;
  sitemap: boolean;
}

export function pages(): PageDef[] {
  return [
    { url: "/", file: "index.html", render: () => <HomePage />, sitemap: true },
    { url: "/services", file: "services.html", render: () => <ServicesPage />, sitemap: true },
    ...services.map((s) => ({
      url: `/services/${s.slug}`,
      file: `services/${s.slug}.html`,
      render: () => <ServicePage service={s} />,
      sitemap: true,
    })),
    { url: "/pricing", file: "pricing.html", render: () => <PricingPage />, sitemap: true },
    { url: "/about", file: "about.html", render: () => <AboutPage />, sitemap: true },
    { url: "/contacts", file: "contacts.html", render: () => <ContactsPage />, sitemap: true },
    { url: "/booking", file: "booking.html", render: () => <BookingPage />, sitemap: true },
    { url: "/404", file: "404.html", render: () => <NotFoundPage />, sitemap: false },
  ];
}

/** Data integrity checks used by the build and `npm run check` */
export function validateData(): string[] {
  const problems: string[] = [];
  const slugs = new Set<string>();
  for (const s of services) {
    if (slugs.has(s.slug)) problems.push(`Duplicate service slug: ${s.slug}`);
    slugs.add(s.slug);
    for (const r of s.related) if (!services.some((x) => x.slug === r)) problems.push(`${s.slug}: related "${r}" not found`);
    if (!prices.some((p) => p.service === s.slug)) problems.push(`${s.slug}: no price rows`);
  }
  const ids = new Set<string>();
  for (const p of prices) {
    if (ids.has(p.id)) problems.push(`Duplicate price id: ${p.id}`);
    ids.add(p.id);
    if (!slugs.has(p.service)) problems.push(`Price "${p.id}" points to unknown service "${p.service}"`);
  }
  return problems;
}
