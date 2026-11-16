import { h } from "../lib/jsx";
import { Layout } from "../components/Layout";
import { HoursTable, ContactActions } from "../components/Blocks";
import { Icon } from "../components/Icon";
import { business } from "../data/business";
import { daysLabel, showTime, toMin, fromMin } from "../lib/hours";

export function ContactsPage() {
  const lastSlots = business.hours.map(
    (h) => `${daysLabel(h.days)} о ${showTime(fromMin(toMin(h.close) - business.booking.lastSlotBeforeCloseMinutes))}`
  );
  const hasDirect = Boolean(business.phone || business.email || business.mapUrl || business.messengers.length);
  return (
    <Layout
      title="Контакти й години роботи"
      description={`Halfshaft: ${business.address.street}, ${business.address.city}. Години роботи, як заїхати й залишити авто, онлайн-заявка на ремонт.`}
      path="/contacts"
      section="contacts"
    >
      <section className="page-head">
        <div className="container">
          <h1>Контакти</h1>
          <p className="lead">Запис через онлайн-заявку. Оберіть послугу й бажаний час, а на місці вас зустріне адміністратор.</p>
        </div>
      </section>

      <div className="container contacts">
        <section className="contacts__card plate" aria-labelledby="hours-title">
          <h2 id="hours-title">
            Години роботи
          </h2>
          <p className="contacts__status small" data-open-status></p>
          <HoursTable className="hours hours--paper" />
          <p className="small muted">У святкові дні графік може змінюватися.</p>
          <div className="contacts__book">
            <h3 className="contacts__subtitle">Бажаний час у заявці</h3>
            <p className="small">
              Можна обрати в робочі години, з кроком {business.booking.slotStepMinutes} хвилин. Останній запис: {lastSlots.join(", ")}.
            </p>
            <a className="btn btn--primary btn--block" href="/booking">
              Подати заявку
            </a>
          </div>
        </section>

        <section className="contacts__info" aria-labelledby="addr-title">
          <h2 id="addr-title">
            Адреса
          </h2>
          <p className="contacts__address">
            <Icon name="pin" />
            <span>
              {business.address.street}
              <br />
              {business.address.city}
            </span>
          </p>

          <h2 id="arrive-title">
            Як заїхати й залишити авто
          </h2>
          <ul className="bullets">
            {business.arrival.map((a) => (
              <li>{a}</li>
            ))}
          </ul>

          <h2>Як з нами зв'язатися</h2>
          <ul role="list" className="contact-methods">
            <li>
              <a className="contact-method" href="/booking">
                <span className="contact-method__name">Онлайн-заявка</span>
                <span className="small muted">Оберіть послугу або опишіть проблему, вкажіть авто й бажаний час.</span>
              </a>
            </li>
            <li>
              <div className="contact-method contact-method--static">
                <span className="contact-method__name">Особисто в майстерні</span>
                <span className="small muted">Адміністратор на місці в робочі години. Огляд без запису, якщо є вільний пост.</span>
              </div>
            </li>
          </ul>
          {hasDirect ? <ContactActions /> : null}

          <h2>Що обслуговуємо</h2>
          <ul className="bullets">
            {business.vehicleScope.serviced.map((s) => (
              <li>{s}</li>
            ))}
            {business.vehicleScope.limited.map((s) => (
              <li className="muted">{s}</li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  );
}
