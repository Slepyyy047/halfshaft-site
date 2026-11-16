import type { PriceItem, Unit } from "./types";

/**
 * Прайс. Суми — вартість роботи в гривнях.
 * kind: "fixed" — точна ціна; "from" — стартова; "range" — діапазон; "quote" — після огляду.
 * parts: "excluded" — запчастини окремо; "included" — матеріали включено; не вказано — не показуємо.
 */
export const prices: PriceItem[] = [
  // ТО
  { id: "oil-engine", service: "oil-change", name: "Заміна оливи двигуна й масляного фільтра", price: { kind: "fixed", amount: 450 }, unit: "visit", parts: "excluded", featured: true },
  { id: "filter-air", service: "oil-change", name: "Заміна повітряного фільтра", price: { kind: "fixed", amount: 150 }, parts: "excluded" },
  { id: "filter-cabin", service: "oil-change", name: "Заміна салонного фільтра", price: { kind: "from", amount: 200 }, parts: "excluded", note: "Залежить від доступу до фільтра" },
  { id: "filter-fuel", service: "scheduled-service", name: "Заміна паливного фільтра", price: { kind: "from", amount: 400 }, parts: "excluded" },
  { id: "spark-plugs", service: "scheduled-service", name: "Заміна свічок запалювання, 4 шт.", price: { kind: "from", amount: 400 }, unit: "set", parts: "excluded", note: "V-подібні двигуни: дорожче через доступ" },
  { id: "service-regular", service: "scheduled-service", name: "ТО за регламентом виробника", price: { kind: "from", amount: 1200 }, unit: "visit", parts: "excluded", note: "Точна сума: за VIN і пробігом" },
  { id: "gearbox-oil", service: "scheduled-service", name: "Заміна оливи в механічній КПП", price: { kind: "fixed", amount: 500 }, parts: "excluded" },
  { id: "atf-change", service: "scheduled-service", name: "Заміна оливи в АКПП або варіаторі", price: { kind: "range", min: 900, max: 1800 }, parts: "excluded", note: "Залежить від типу коробки й способу заміни" },
  { id: "timing-belt-kit", service: "timing-belt", name: "Заміна ременя ГРМ з роликами", price: { kind: "range", min: 2800, max: 6500 }, parts: "excluded" },
  { id: "aux-belt", service: "timing-belt", name: "Заміна ременя приводу агрегатів", price: { kind: "from", amount: 500 }, parts: "excluded" },
  { id: "timing-chain", service: "timing-belt", name: "Заміна ланцюга ГРМ", price: { kind: "quote" }, parts: "excluded", note: "Після перевірки розтягу ланцюга" },

  // Діагностика
  { id: "diag-computer", service: "computer-diagnostics", name: "Комп'ютерна діагностика", price: { kind: "fixed", amount: 600 }, unit: "visit", featured: true, note: "Не оплачується, якщо ремонт у нас" },
  { id: "diag-prepurchase", service: "pre-purchase-inspection", name: "Перевірка авто перед купівлею", price: { kind: "fixed", amount: 1800 }, unit: "visit" },
  { id: "diag-fault", service: "computer-diagnostics", name: "Пошук несправності електроніки двигуна", price: { kind: "from", amount: 900 }, note: "Погодинно, після комп'ютерної діагностики" },

  // Гальма
  { id: "pads-front", service: "brake-pads", name: "Заміна передніх гальмівних колодок", price: { kind: "fixed", amount: 650 }, unit: "axle", parts: "excluded", featured: true },
  { id: "pads-rear-disc", service: "brake-pads", name: "Заміна задніх колодок, дискові гальма", price: { kind: "fixed", amount: 750 }, unit: "axle", parts: "excluded", note: "З електроручником: через сканер, ціна та сама" },
  { id: "pads-rear-drum", service: "brake-pads", name: "Заміна задніх колодок, барабанні гальма", price: { kind: "from", amount: 1100 }, unit: "axle", parts: "excluded" },
  { id: "discs-pads", service: "brake-discs", name: "Заміна гальмівних дисків і колодок", price: { kind: "fixed", amount: 1300 }, unit: "axle", parts: "excluded" },
  { id: "brake-fluid", service: "brake-fluid", name: "Заміна гальмівної рідини з прокачуванням", price: { kind: "fixed", amount: 750 }, unit: "visit", parts: "excluded" },
  { id: "caliper-service", service: "brake-pads", name: "Обслуговування супорта: чистка й змащення напрямних", price: { kind: "fixed", amount: 350 }, unit: "piece", parts: "included" },
  { id: "caliper-repair", service: "brake-discs", name: "Ремонт закислого супорта", price: { kind: "quote" }, parts: "excluded" },

  // Підвіска
  { id: "diag-suspension", service: "suspension-diagnostics", name: "Діагностика ходової частини", price: { kind: "fixed", amount: 400 }, unit: "visit", featured: true, note: "Не оплачується, якщо ремонт у нас" },
  { id: "struts-front", service: "shock-absorbers", name: "Заміна передніх стійок", price: { kind: "from", amount: 1800 }, unit: "axle", parts: "excluded" },
  { id: "shocks-rear", service: "shock-absorbers", name: "Заміна задніх амортизаторів", price: { kind: "from", amount: 900 }, unit: "axle", parts: "excluded" },
  { id: "silent-block", service: "suspension-joints", name: "Заміна сайлентблока важеля", price: { kind: "from", amount: 450 }, unit: "piece", parts: "excluded" },
  { id: "ball-joint", service: "suspension-joints", name: "Заміна кульової опори", price: { kind: "from", amount: 400 }, unit: "piece", parts: "excluded" },
  { id: "stab-link", service: "suspension-joints", name: "Заміна тяги стабілізатора", price: { kind: "fixed", amount: 250 }, unit: "piece", parts: "excluded" },
  { id: "tie-rod-end", service: "suspension-joints", name: "Заміна рульового наконечника", price: { kind: "fixed", amount: 350 }, unit: "piece", parts: "excluded" },
  { id: "steering-rack", service: "suspension-joints", name: "Ремонт рульової рейки", price: { kind: "quote" }, parts: "excluded" },
  { id: "alignment-1", service: "wheel-alignment", name: "Розвал-сходження, одна вісь", price: { kind: "fixed", amount: 700 } },
  { id: "alignment-2", service: "wheel-alignment", name: "Розвал-сходження, дві осі", price: { kind: "fixed", amount: 1100 }, featured: true },

  // Шини
  { id: "tires-r15", service: "tire-fitting", name: "Шиномонтаж комплекту R13-R15", price: { kind: "fixed", amount: 800 }, unit: "set", parts: "included" },
  { id: "tires-r17", service: "tire-fitting", name: "Шиномонтаж комплекту R16-R17", price: { kind: "fixed", amount: 1000 }, unit: "set", parts: "included", featured: true },
  { id: "tires-r19", service: "tire-fitting", name: "Шиномонтаж комплекту R18-R19", price: { kind: "fixed", amount: 1300 }, unit: "set", parts: "included" },
  { id: "tires-r20", service: "tire-fitting", name: "Шиномонтаж комплекту R20 і більше", price: { kind: "from", amount: 1600 }, unit: "set", parts: "included", note: "Низький профіль і run-flat: дорожче" },
  { id: "balance-1", service: "tire-fitting", name: "Балансування колеса", price: { kind: "fixed", amount: 120 }, unit: "wheel", parts: "included" },
  { id: "wheel-swap", service: "tire-fitting", name: "Перестановка коліс у зборі", price: { kind: "fixed", amount: 400 }, unit: "set" },
  { id: "tire-storage", service: "tire-fitting", name: "Сезонне зберігання шин", price: { kind: "fixed", amount: 1200 }, unit: "season", note: "Комплект із чотирьох шин або коліс" },
  { id: "puncture", service: "puncture-repair", name: "Ремонт проколу латкою-грибком", price: { kind: "fixed", amount: 350 }, unit: "wheel", parts: "included" },
  { id: "tpms-sensor", service: "puncture-repair", name: "Заміна датчика тиску в шині", price: { kind: "fixed", amount: 300 }, unit: "wheel", parts: "excluded" },

  // Клімат
  { id: "ac-check", service: "ac-service", name: "Перевірка кондиціонера на герметичність", price: { kind: "fixed", amount: 500 }, unit: "visit" },
  { id: "ac-r134a", service: "ac-service", name: "Заправка кондиціонера, R134a", price: { kind: "from", amount: 1100 }, unit: "visit", parts: "included", featured: true },
  { id: "ac-r1234yf", service: "ac-service", name: "Заправка кондиціонера, R1234yf", price: { kind: "range", min: 2600, max: 4800 }, unit: "visit", parts: "included", note: "За фактичною вагою холодоагенту" },
  { id: "ac-clean", service: "ac-service", name: "Антибактеріальна обробка випарника", price: { kind: "fixed", amount: 450 }, parts: "included" },
  { id: "coolant", service: "cooling-system", name: "Заміна антифризу", price: { kind: "fixed", amount: 900 }, unit: "visit", parts: "excluded" },
  { id: "cooling-pressure", service: "cooling-system", name: "Перевірка системи охолодження тиском", price: { kind: "fixed", amount: 400 } },
  { id: "water-pump", service: "cooling-system", name: "Заміна помпи", price: { kind: "from", amount: 1500 }, parts: "excluded", note: "Якщо помпу приводить ремінь ГРМ: разом із ним" },
  { id: "radiator", service: "cooling-system", name: "Заміна радіатора охолодження", price: { kind: "from", amount: 1400 }, parts: "excluded" },

  // Гібриди
  { id: "hybrid-diag", service: "hybrid-diagnostics", name: "Діагностика гібридної системи", price: { kind: "fixed", amount: 900 }, unit: "visit", featured: true },
  { id: "hybrid-fan", service: "hybrid-battery-cooling", name: "Чистка вентилятора тягової батареї", price: { kind: "fixed", amount: 1500 }, parts: "included" },
  { id: "hybrid-modules", service: "hybrid-diagnostics", name: "Заміна блоків тягової батареї", price: { kind: "quote" }, parts: "excluded", note: "Після перевірки кожного блоку" },
  { id: "hybrid-inverter-coolant", service: "hybrid-diagnostics", name: "Заміна антифризу в контурі інвертора", price: { kind: "fixed", amount: 950 }, parts: "excluded" },

  // Електрика
  { id: "battery-test", service: "battery-check", name: "Перевірка акумулятора й системи заряджання", price: { kind: "fixed", amount: 250 }, unit: "visit" },
  { id: "battery-swap", service: "battery-check", name: "Заміна акумулятора", price: { kind: "fixed", amount: 200 }, parts: "excluded" },
  { id: "battery-swap-ss", service: "battery-check", name: "Заміна акумулятора з реєстрацією в блоці (start-stop)", price: { kind: "fixed", amount: 450 }, parts: "excluded" },
  { id: "parasitic-drain", service: "battery-check", name: "Пошук витоку струму", price: { kind: "from", amount: 800 } },
  { id: "alternator", service: "battery-check", name: "Ремонт генератора або стартера", price: { kind: "quote" }, parts: "excluded" },
];

export const unitLabel: Record<Unit, string> = {
  visit: "за візит",
  axle: "за вісь",
  wheel: "за колесо",
  piece: "за шт.",
  set: "за комплект",
  season: "за сезон",
};

/** Скільки одиниць можна вибрати в калькуляторі */
export const unitMaxQty: Partial<Record<Unit, number>> = { axle: 2, wheel: 4, piece: 4 };

export const priceById = (id: string) => prices.find((p) => p.id === id);
export const pricesForService = (slug: string) => prices.filter((p) => p.service === slug);
