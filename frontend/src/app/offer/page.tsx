import { siteContacts, siteTerms } from "../../lib/site";

const sections = [
  ["1. Продавец", `${siteContacts.legalName}. Контакты: ${siteContacts.email}, ${siteContacts.phonePrimary}, ${siteContacts.phoneSecondary}.`],
  ["2. Предмет", "Сайт Stunt Tech является витриной мототехники, запчастей, конфигуратора стант-сборок и сервисных заявок."],
  ["3. Оформление заказа", "Отправка формы на сайте фиксирует заявку. Наличие, итоговая комплектация, срок сборки, способ доставки и финальная стоимость подтверждаются менеджером."],
  ["4. Оплата", `${siteTerms.paymentStore} ${siteTerms.paymentOnline} ${siteTerms.paymentPrepay}`],
  ["5. Доставка", `${siteTerms.pickup} ${siteTerms.moscowDelivery} ${siteTerms.regionDelivery}`],
  ["6. Возврат и гарантия", `${siteTerms.warranty} ${siteTerms.returnPolicy}`],
  ["7. Юридические лица", siteTerms.legalInvoices],
];

export default function OfferPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-5 pb-20 pt-28 text-white sm:px-6 md:px-12 md:pt-36">
      <div className="mx-auto max-w-5xl">
        <span className="mb-4 block font-mono text-xs font-black uppercase tracking-[0.4em] text-[#ff00e6]">Legal</span>
        <h1 className="st-display mb-10 text-[clamp(3rem,7vw,6.5rem)] font-black uppercase italic leading-[0.9]">Оферта</h1>
        <div className="space-y-6">
          {sections.map(([heading, body]) => (
            <section key={heading} className="border-t border-white/10 pt-6">
              <h2 className="mb-3 text-lg font-black uppercase tracking-[0.14em] sm:text-xl">{heading}</h2>
              <p className="leading-7 text-white/55">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
