export type CategoryId =
  | "maintenance"
  | "diagnostics"
  | "brakes"
  | "suspension"
  | "tires"
  | "climate"
  | "hybrid"
  | "electrical";

export interface Category {
  id: CategoryId;
  name: string;
  /** Коротко, якими словами водій описує цю групу робіт */
  blurb: string;
  image: string; // назва файлу в assets/images без розширення
}

/** Як сформовано ціну. Від цього залежить відображення і чи можна її сумувати. */
export type Price =
  | { kind: "fixed"; amount: number }
  | { kind: "from"; amount: number }
  | { kind: "range"; min: number; max: number }
  | { kind: "quote" };

export type Unit = "visit" | "axle" | "wheel" | "piece" | "set" | "season";

export interface PriceItem {
  id: string;
  /** Послуга, на сторінку якої веде рядок */
  service: string;
  name: string;
  price: Price;
  unit?: Unit;
  /** Чи входять запчастини/матеріали. Не вказано — не показуємо. */
  parts?: "included" | "excluded";
  note?: string;
  /** Показувати на головній */
  featured?: boolean;
}

export interface Service {
  slug: string;
  category: CategoryId;
  name: string;
  /** Рядок для каталогу */
  short: string;
  /** Вступ на сторінці послуги, свій для кожної */
  lead: string;
  /** Коли до нас звертаються */
  reasons: string[];
  /** Що перевіряємо або робимо */
  checks: string[];
  /** Як формується ціна, людською мовою */
  pricingBasis: string;
  /** Що з деталями і матеріалами */
  partsNote?: string;
  /** Що буде, якщо спершу потрібна діагностика */
  diagnosisFirst: string;
  duration: string;
  related: string[];
  /** Ключові слова для пошуку в прайсі й каталозі */
  keywords?: string[];
  image?: string;
}

export interface Symptom {
  id: string;
  label: string;
  service: string;
}
