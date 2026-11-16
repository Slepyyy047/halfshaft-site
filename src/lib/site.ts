/** Build-time registry for hashed asset URLs and navigation. */
export const assets = {
  css: "/assets/site.css",
  /** "local" — self-hosted Inter from assets/fonts; "google" — Google Fonts (used when assets/fonts is absent) */
  fonts: "local" as "local" | "google",
  scripts: {} as Record<string, string>,
};

export type Section = "home" | "services" | "pricing" | "about" | "contacts" | "booking" | "none";

export const nav: { href: string; label: string; section: Section }[] = [
  { href: "/services", label: "Послуги", section: "services" },
  { href: "/pricing", label: "Ціни", section: "pricing" },
  { href: "/about", label: "Про нас", section: "about" },
  { href: "/contacts", label: "Контакти", section: "contacts" },
];

export const bookingHref = (params?: Record<string, string>) => {
  if (!params) return "/booking";
  const q = new URLSearchParams(params).toString();
  return `/booking?${q}`;
};
