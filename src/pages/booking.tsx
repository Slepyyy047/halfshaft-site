import { h, raw } from "../lib/jsx";
import { Layout } from "../components/Layout";
import { Icon } from "../components/Icon";
import { business } from "../data/business";
import { categories, services, symptoms } from "../data/services";
import { prices } from "../data/prices";

const MAKES = [
  "Audi", "BMW", "Chevrolet", "Citroën", "Dacia", "Fiat", "Ford", "Honda", "Hyundai", "Jeep", "Kia", "Lexus",
  "Mazda", "Mercedes-Benz", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Renault", "Seat", "Škoda", "Subaru",
  "Suzuki", "Toyota", "Volkswagen", "Volvo",
];

const FUELS = ["Бензин", "Дизель", "Бензин + ГБО", "Гібрид", "Електро"];

/** Дані для клієнтського скрипта — з тих самих джерел, що й сторінки */
function bookingData() {
  return {
    mode: business.booking.mode,
    endpoint: business.booking.endpoint,
    rules: {
      slotStepMinutes: business.booking.slotStepMinutes,
      lastSlotBeforeCloseMinutes: business.booking.lastSlotBeforeCloseMinutes,
      leadTimeHours: business.booking.leadTimeHours,
      horizonDays: business.booking.horizonDays,
      closedDates: business.booking.closedDates,
    },
    hours: business.hours,
    services: services.map((s) => ({ slug: s.slug, name: s.name, category: s.category, basis: s.pricingBasis })),
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    prices,
    symptoms,
  };
}

function Err({ id }: { id: string }) {
  return (
    <p className="field__error" id={`${id}-error`} data-error-for={id} hidden>
      <Icon name="alert" className="icon icon--xs" />
      <span></span>
    </p>
  );
}

const STEPS = ["Послуга", "Авто", "Час і контакти", "Перевірка"];

export function BookingPage() {
  const local = business.booking.mode === "local";
  return (
    <Layout
      title="Онлайн-заявка на ремонт"
      description="Запис в автосервіс Halfshaft у Вінниці: оберіть послугу або опишіть проблему, вкажіть авто й бажаний час. Ціну узгоджуємо до початку робіт."
      path="/booking"
      section="booking"
      scripts={["booking"]}
    >
      <section className="page-head page-head--compact">
        <div className="container">
          <h1>Заявка на ремонт</h1>
          <p className="lead">Чотири короткі кроки. Обов'язкові лише послуга або опис проблеми, марка й модель, бажаний час, ім'я і телефон.</p>
        </div>
      </section>

      <div className="container booking" data-booking>
        <noscript>
          <div className="paper sheet booking__noscript">
            <p>Для онлайн-заявки потрібен увімкнений JavaScript. Ви також можете приїхати в майстерню в робочі години.</p>
            <p>
              <a className="link" href="/contacts">Контакти й години роботи</a>
            </p>
          </div>
        </noscript>

        <div className="booking__main" data-js-only>
          <ol role="list" className="steps" aria-label="Кроки заявки" data-steps>
            {STEPS.map((s, i) => (
              <li className="steps__item" data-step-indicator={i + 1}>
                <span className="steps__num num" aria-hidden="true">{i + 1}</span>
                <span className="steps__label">{s}</span>
              </li>
            ))}
          </ol>

          <form className="paper plate booking__form" novalidate data-form autocomplete="on">
            {/* ---------------- Step 1 */}
            <fieldset className="step" data-step="1" aria-labelledby="s1-title">
              <legend className="sr-only">Крок 1 з 4: послуга</legend>
              <h2 className="h3 step__title" id="s1-title" tabIndex={-1}>
                Що потрібно зробити?
              </h2>
              <div className="mode" role="radiogroup" aria-label="Як описати роботу">
                <label className="mode__option">
                  <input type="radio" name="mode" value="service" checked />
                  <span className="mode__card">
                    <span className="mode__name">Знаю, яка послуга потрібна</span>
                    <span className="mode__hint small">Оберіть зі списку, і ми покажемо ціну</span>
                  </span>
                </label>
                <label className="mode__option">
                  <input type="radio" name="mode" value="symptom" />
                  <span className="mode__card">
                    <span className="mode__name">Знаю лише, що турбує</span>
                    <span className="mode__hint small">Опишіть симптом, і ми почнемо з огляду</span>
                  </span>
                </label>
              </div>

              <div className="mode-panel" data-mode-panel="service">
                <div className="selection-carry" data-carry hidden>
                  <p className="field__label">Роботи з прайсу</p>
                  <ul role="list" className="carry-list" data-carry-list></ul>
                  <p className="small muted" data-carry-sum></p>
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="service" data-service-label>
                    Послуга
                  </label>
                  <div className="select">
                    <select id="service" name="service" aria-describedby="service-error">
                      <option value="">Оберіть послугу</option>
                      {categories.map((c) => (
                        <optgroup label={c.name}>
                          {services
                            .filter((s) => s.category === c.id)
                            .map((s) => (
                              <option value={s.slug}>{s.name}</option>
                            ))}
                        </optgroup>
                      ))}
                    </select>
                    <Icon name="down" className="icon select__chev" />
                  </div>
                  <Err id="service" />
                </div>
                <div className="price-hint" data-price-hint hidden aria-live="polite"></div>
              </div>

              <div className="mode-panel" data-mode-panel="symptom" hidden>
                <fieldset className="field">
                  <legend className="field__label">Що відбувається з авто</legend>
                  <div className="chips-input">
                    {symptoms.map((s) => (
                      <label className="check-chip">
                        <input type="checkbox" name="symptoms" value={s.id} />
                        <span>{s.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="field">
                  <label className="field__label" htmlFor="problem">
                    Опишіть своїми словами <span className="field__opt" data-problem-opt>(необов'язково, якщо обрали симптом)</span>
                  </label>
                  <textarea
                    id="problem"
                    name="problem"
                    rows={4}
                    maxlength={800}
                    aria-describedby="problem-help problem-error"
                    placeholder="Наприклад: стукає спереду праворуч на нерівностях, з'явилося після ями"
                  ></textarea>
                  <p className="field__help small" id="problem-help">
                    Коли з'являється, на якій швидкості, після чого почалося.
                  </p>
                  <Err id="problem" />
                </div>
                <div className="price-hint" data-symptom-hint hidden aria-live="polite"></div>
              </div>

              <div className="step__nav">
                <button type="button" className="btn btn--primary" data-next>
                  Далі: авто
                </button>
              </div>
            </fieldset>

            {/* ---------------- Step 2 */}
            <fieldset className="step" data-step="2" hidden aria-labelledby="s2-title">
              <legend className="sr-only">Крок 2 з 4: авто</legend>
              <h2 className="h3 step__title" id="s2-title" tabIndex={-1}>
                Яке авто?
              </h2>
              <div className="grid-2">
                <div className="field">
                  <label className="field__label" htmlFor="make">
                    Марка
                  </label>
                  <input id="make" name="make" type="text" list="makes" autocomplete="off" maxlength={40} aria-describedby="make-error" required />
                  <datalist id="makes">
                    {MAKES.map((m) => (
                      <option value={m}></option>
                    ))}
                  </datalist>
                  <Err id="make" />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="model">
                    Модель
                  </label>
                  <input id="model" name="model" type="text" autocomplete="off" maxlength={40} placeholder="Наприклад, Octavia" aria-describedby="model-error" required />
                  <Err id="model" />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="year">
                    Рік випуску <span className="field__opt">(необов'язково)</span>
                  </label>
                  <input id="year" name="year" type="text" inputmode="numeric" maxlength={4} placeholder="2016" aria-describedby="year-error" />
                  <Err id="year" />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="mileage">
                    Пробіг, км <span className="field__opt">(необов'язково)</span>
                  </label>
                  <input id="mileage" name="mileage" type="text" inputmode="numeric" maxlength={9} placeholder="148 000" aria-describedby="mileage-error" />
                  <Err id="mileage" />
                </div>
              </div>
              <fieldset className="field">
                <legend className="field__label">
                  Тип двигуна <span className="field__opt">(необов'язково)</span>
                </legend>
                <div className="chips-input">
                  {FUELS.map((f) => (
                    <label className="check-chip">
                      <input type="radio" name="fuel" value={f} />
                      <span>{f}</span>
                    </label>
                  ))}
                </div>
                <p className="field__help small" data-ev-note hidden>
                  Електромобілі обслуговуємо лише з ходовою, гальмами, шинами й кондиціонером.
                </p>
              </fieldset>
              <div className="field">
                <label className="field__label" htmlFor="vin">
                  VIN-код <span className="field__opt">(необов'язково)</span>
                </label>
                <input
                  id="vin"
                  name="vin"
                  type="text"
                  autocomplete="off"
                  autocapitalize="characters"
                  spellcheck="false"
                  maxlength={17}
                  aria-describedby="vin-help vin-error"
                  className="mono-input"
                />
                <p className="field__help small" id="vin-help">
                  17 символів з техпаспорта. Допоможе заздалегідь підібрати запчастини.
                </p>
                <Err id="vin" />
              </div>
              <div className="step__nav">
                <button type="button" className="btn" data-prev>
                  Назад
                </button>
                <button type="button" className="btn btn--primary" data-next>
                  Далі: час і контакти
                </button>
              </div>
            </fieldset>

            {/* ---------------- Step 3 */}
            <fieldset className="step" data-step="3" hidden aria-labelledby="s3-title">
              <legend className="sr-only">Крок 3 з 4: час і контакти</legend>
              <h2 className="h3 step__title" id="s3-title" tabIndex={-1}>
                Коли вам зручно?
              </h2>
              <p className="notice notice--info small">
                <Icon name="clock" />
                <span>Це бажаний час, а не підтверджений запис. Остаточний час узгоджується з адміністратором майстерні.</span>
              </p>
              <div className="field">
                <label className="field__label" htmlFor="date">
                  Дата
                </label>
                <input id="date" name="date" type="date" aria-describedby="date-help date-error" required />
                <p className="field__help small" id="date-help" data-date-help></p>
                <Err id="date" />
              </div>
              <fieldset className="field" data-slots-field>
                <legend className="field__label">Час</legend>
                <div className="slots" data-slots>
                  <p className="small muted">Спершу оберіть дату, і ми покажемо вільний час.</p>
                </div>
                <Err id="time" />
              </fieldset>
              <div className="grid-2">
                <div className="field">
                  <label className="field__label" htmlFor="name">
                    Ім'я
                  </label>
                  <input id="name" name="name" type="text" autocomplete="name" maxlength={60} aria-describedby="name-error" required />
                  <Err id="name" />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="phone">
                    Телефон
                  </label>
                  <input id="phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength={19} placeholder="+380 67 123 45 67" aria-describedby="phone-error" required />
                  <Err id="phone" />
                </div>
              </div>
              <div className="step__nav">
                <button type="button" className="btn" data-prev>
                  Назад
                </button>
                <button type="button" className="btn btn--primary" data-next>
                  Перевірити заявку
                </button>
              </div>
            </fieldset>

            {/* ---------------- Step 4 */}
            <fieldset className="step" data-step="4" hidden aria-labelledby="s4-title">
              <legend className="sr-only">Крок 4 з 4: перевірка</legend>
              <h2 className="h3 step__title" id="s4-title" tabIndex={-1}>
                Перевірте заявку
              </h2>
              <div className="review" data-review></div>
              {local ? (
                <p className="notice notice--warn small">
                  <Icon name="device" />
                  <span>
                    Заявка збережеться лише в цьому браузері на цьому пристрої й у майстерню не надсилається. Щоб підтвердити час, покажіть її адміністратору на місці.
                  </span>
                </p>
              ) : (
                <p className="notice notice--info small">
                  <Icon name="clock" />
                  <span>Після надсилання адміністратор зв'яжеться з вами, щоб підтвердити час.</span>
                </p>
              )}
              <div className="submit-error notice notice--error small" data-submit-error hidden role="alert">
                <Icon name="alert" />
                <span data-submit-error-text></span>
              </div>
              <div className="step__nav">
                <button type="button" className="btn" data-prev>
                  Назад
                </button>
                <button type="submit" className="btn btn--primary" data-submit>
                  {local ? "Зберегти заявку" : "Надіслати заявку"}
                </button>
              </div>
            </fieldset>

            {/* ---------------- Result */}
            <section className="step result" data-step="5" hidden aria-labelledby="s5-title">
              <div className="result__mark" aria-hidden="true">
                <Icon name="check" />
              </div>
              <h2 className="h3 step__title" id="s5-title" tabIndex={-1} data-result-title></h2>
              <p data-result-text></p>
              <div className="review review--result" data-result-review></div>
              <div className="actions">
                <button type="button" className="btn btn--primary" data-copy>
                  <Icon name="copy" /> Скопіювати текст заявки
                </button>
                <button type="button" className="btn" data-new>
                  Нова заявка
                </button>
              </div>
              <p className="small muted" data-copy-status role="status" aria-live="polite"></p>
              <div className="saved" data-saved hidden>
                <h3 className="saved__title">Збережені на цьому пристрої</h3>
                <ul role="list" className="saved__list" data-saved-list></ul>
              </div>
            </section>
          </form>
        </div>

        <aside className="booking__aside" aria-labelledby="ov-title" data-js-only>
          <details className="overview" data-overview open>
            <summary className="overview__summary">
              <span id="ov-title" className="overview__title">Ваша заявка</span>
              <span className="overview__brief small muted" data-ov-brief></span>
              <Icon name="down" className="icon overview__chev" />
            </summary>
            <dl className="overview__list">
              <div>
                <dt>Робота</dt>
                <dd data-ov="service">не вказано</dd>
              </div>
              <div>
                <dt>Орієнтовно</dt>
                <dd data-ov="price">не вказано</dd>
              </div>
              <div>
                <dt>Авто</dt>
                <dd data-ov="car">не вказано</dd>
              </div>
              <div>
                <dt>Бажаний час</dt>
                <dd data-ov="time">не вказано</dd>
              </div>
              <div>
                <dt>Контакт</dt>
                <dd data-ov="contact">не вказано</dd>
              </div>
            </dl>
            <p className="overview__note small">
              Ціни за прайсом, без запчастин. Остаточну вартість узгодимо після огляду, до початку робіт.
            </p>
          </details>
        </aside>
      </div>

      <script type="application/json" id="booking-data">
        {raw(JSON.stringify(bookingData()).replace(/</g, "\\u003c"))}
      </script>
    </Layout>
  );
}
