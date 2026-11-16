import { h } from "../lib/jsx";
import { Layout } from "../components/Layout";
import { Picture } from "../components/Picture";
import { CtaBand } from "../components/Blocks";

const policies = [
  {
    title: "Фіксуємо стан авто на прийомці",
    text: "Записуємо пробіг і рівень пального, фотографуємо кузов з усіх боків і вносимо все в акт прийому. Ви підписуєте його разом з нами, до того як авто заїде в бокс.",
  },
  {
    title: "Показуємо, що знайшли",
    text: "Знос колодок міряємо штангенциркулем, люфти знімаємо на відео, коди помилок зберігаємо зі скриншотами. Усе це надсилаємо вам у месенджер, а не переказуємо по телефону.",
  },
  {
    title: "Узгоджуємо ціну до початку робіт",
    text: "Кошторис письмовий: робота окремо, кожна запчастина окремо, з виробником і ціною. Можна обрати між оригіналом і перевіреним аналогом.",
  },
  {
    title: "Додаткові роботи — лише з вашої згоди",
    text: "Якщо під час ремонту знайдеться ще щось, зупиняємось, надсилаємо фото й нову суму. Не можете відповісти — чекаємо, а не робимо на свій розсуд.",
  },
  {
    title: "Ваші запчастини теж підходять",
    text: "Можна привезти деталі, куплені самостійно. Перевіримо відповідність за артикулом до встановлення і скажемо, якщо щось не так.",
  },
  {
    title: "Повертаємо авто з поясненнями",
    text: "Показуємо замінене, віддаємо старі деталі в коробці й акт виконаних робіт з пробігом. Окремо пишемо, що варто зробити далі й через скільки кілометрів.",
  },
];

const facts = [
  "Чотири пости, два з них із підйомниками",
  "3D-стенд розвалу-сходження",
  "Окрема лінія шиномонтажу з балансувальним верстатом",
  "Станція обслуговування кондиціонерів для R134a і R1234yf",
  "Механік з допуском до робіт з високою напругою — для гібридів",
  "Зона очікування з вікном у бокс",
];

export function AboutPage() {
  return (
    <Layout
      title="Про майстерню"
      description="Як працює Halfshaft: акт прийому з фото, фіксація знахідок, письмовий кошторис до початку робіт, додаткові роботи лише з вашої згоди, старі деталі повертаємо."
      path="/about"
      section="about"
    >
      <section className="page-head">
        <div className="wrap about-head">
          <h1 className="display-2">Майстерня, де ціну називають до ремонту</h1>
          <div className="about-head__text prose">
            <p className="lead">
              Halfshaft — невелика незалежна майстерня у Вінниці на чотири пости. Обслуговуємо легкові авто різних марок, а з гібридами працюємо окремо й обережно.
            </p>
            <p className="muted">
              Ми не продаємо ремонт «про всяк випадок». Наше правило просте: спершу знаходимо причину і показуємо її вам, потім називаємо ціну, і лише після цього беремо ключ до рук.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap about-photo">
        <figure className="frame about-photo__frame">
          <Picture name="workshop" alt="Верстак майстерні: стенд з ключами й викрутками, планшет з аркушем прийому авто" sizes="100vw" priority />
        </figure>
      </section>

      <section className="section" aria-labelledby="rules-title">
        <div className="wrap">
          <div className="section-head">
            <h2 className="h2" id="rules-title">
              Правила, за якими працюємо
            </h2>
            <p className="lead">Вони однакові для заміни оливи й капітального ремонту.</p>
          </div>
          <ul role="list" className="policies">
            {policies.map((p) => (
              <li className="policy">
                <h3 className="h3">{p.title}</h3>
                <p className="muted">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--band" aria-labelledby="facts-title">
        <div className="wrap facts">
          <h2 className="h2" id="facts-title">
            Що є в майстерні
          </h2>
          <ul role="list" className="facts__list">
            {facts.map((f) => (
              <li>{f}</li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand title="Приїжджайте на огляд" text="Оберіть послугу або опишіть симптом — запропонуйте зручний час, а ми підготуємо пост." />
    </Layout>
  );
}
