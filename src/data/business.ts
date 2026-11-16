/**
 * Business details — the single place to edit the shop's facts.
 *
 * Everything on the site (header, footer, contacts, booking hours, metadata)
 * reads from here. Contact actions render only when a usable value is set:
 * leave `phone`, `email`, `mapUrl` or a messenger as `null` to hide it.
 */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = неділя, як у Date.getDay()

export interface OpeningHours {
  days: Weekday[];
  open: string; // "HH:MM"
  close: string; // "HH:MM"
}

export interface ContactLink {
  label: string; // що бачить відвідувач, напр. "+38 0XX XXX XX XX"
  href: string; // tel:, mailto:, https://
}

export const business = {
  name: "Halfshaft",
  /** Короткий опис для title, meta description і футера */
  descriptor: "Автосервіс у Вінниці",
  summary:
    "Незалежна майстерня для легкових авто різних марок, зокрема гібридів. Діагностуємо, називаємо ціну до початку робіт і показуємо, що замінили.",

  city: "Вінниця",
  address: {
    street: "вул. Карданна, 8",
    city: "Вінниця",
    postal: null as string | null,
  },
  arrival: [
    "Заїзд у двір через ворота з табличкою Halfshaft, зліва від шиномонтажного боксу.",
    "Для клієнтів — чотири місця біля адміністративного входу. Не ставте авто перед воротами боксів.",
    "Авто можна залишити з вечора: ключі й техпаспорт передайте адміністратору до закриття.",
    "Поки чекаєте, можна посидіти в зоні очікування з вікном у бокс: там є Wi-Fi і кавомашина.",
  ],

  /** Контакти. null = не показувати. Головна дія сайту — онлайн-заявка. */
  phone: null as ContactLink | null,
  email: null as ContactLink | null,
  mapUrl: null as string | null,
  messengers: [] as ContactLink[],

  hours: [
    { days: [1, 2, 3, 4, 5], open: "08:30", close: "19:00" },
    { days: [6], open: "09:00", close: "16:00" },
  ] as OpeningHours[],

  vehicleScope: {
    short: "Легкові авто й кросовери різних марок, бензин, дизель і гібриди",
    serviced: [
      "Легкові авто й кросовери до 3,5 т",
      "Бензинові, дизельні та авто з ГБО",
      "Гібриди: Toyota, Lexus, Honda, Hyundai, Kia та інші",
    ],
    limited: [
      "Електромобілі — лише ходова, гальма, шини й кондиціонер",
      "Комерційний транспорт понад 3,5 т не обслуговуємо",
    ],
  },

  booking: {
    /**
     * "local"    — заявка зберігається лише в браузері відвідувача (без бекенду).
     * "endpoint" — заявка надсилається POST-запитом на `endpoint` (JSON).
     */
    mode: "local" as "local" | "endpoint",
    endpoint: null as string | null,
    slotStepMinutes: 30,
    /** Останній слот — за стільки хвилин до закриття */
    lastSlotBeforeCloseMinutes: 60,
    /** Мінімум годин від поточного моменту до бажаного часу */
    leadTimeHours: 2,
    /** На скільки днів уперед можна обрати дату */
    horizonDays: 45,
    /** Святкові й неробочі дні (YYYY-MM-DD) */
    closedDates: ["2026-12-25", "2027-01-01", "2027-01-07"],
  },

  site: {
    url: "https://halfshaft.example",
    locale: "uk_UA",
    /**
     * Дані вигадані, тому за замовчуванням сайт закрито від індексації,
     * а структуровані дані LocalBusiness не публікуються.
     * Для справжнього бізнесу: замініть дані й поставте true.
     */
    indexable: false,
    publishLocalBusinessSchema: false,
  },
};

export type Business = typeof business;
