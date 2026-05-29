import { siteContacts } from "../../lib/site";

const sections = [
  ["1. Оператор", `${siteContacts.legalName} является оператором персональных данных для сайта stunttech.ru и связанных заявок клиентов.`],
  ["2. Цели обработки", "Обработка нужна для консультаций, оформления заявок, продажи товаров, записи на сервис, доставки, аналитики сайта и поддержки клиентов."],
  ["3. Какие данные собираются", "Имя, телефон, Telegram или WhatsApp, способ связи, комментарий, состав заказа, данные о посещении сайта, cookie, IP-адрес и технические метрики."],
  ["4. Основание обработки", "Пользователь передает данные добровольно через формы сайта и продолжает пользоваться сайтом после уведомления о политике."],
  ["5. Защита и доступ", "Доступ к заявкам ограничен административной панелью и рабочими инструментами команды Stunt Tech. Данные используются только для обработки обращения и исполнения заказа."],
  ["6. Контакты по данным", `По вопросам обработки персональных данных можно написать на ${siteContacts.email} или связаться по телефонам ${siteContacts.phonePrimary}, ${siteContacts.phoneSecondary}.`],
];

export default function PrivacyPage() {
  return <LegalPage eyebrow="Legal" title="Политика конфиденциальности" sections={sections} />;
}

function LegalPage({ eyebrow, title, sections }: { eyebrow: string; title: string; sections: string[][] }) {
  return (
    <main className="min-h-screen bg-[#050505] px-6 pb-20 pt-28 text-white sm:px-8 md:px-12 md:pt-36">
      <div className="mx-auto max-w-5xl">
        <span className="mb-4 block font-mono text-[11px] font-black uppercase tracking-[0.28em] text-[#16d8ff] sm:text-xs sm:tracking-[0.4em]">{eyebrow}</span>
        <h1 className="st-display mb-10 max-w-full break-words pr-[0.12em] text-[clamp(2rem,10vw,6.5rem)] font-black uppercase italic leading-[0.92] [overflow-wrap:anywhere]">{title}</h1>
        <div className="space-y-6">
          {sections.map(([heading, body]) => (
            <section key={heading} className="border-t border-white/10 pt-6">
              <h2 className="mb-3 max-w-full break-words text-lg font-black uppercase tracking-[0.08em] [overflow-wrap:anywhere] sm:text-xl sm:tracking-[0.14em]">{heading}</h2>
              <p className="leading-7 text-white/55 [overflow-wrap:anywhere]">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
