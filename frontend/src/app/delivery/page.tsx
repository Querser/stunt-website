import { siteContacts, siteTerms } from "../../lib/site";

const blocks = [
  {
    kicker: "01",
    title: "Как заказать",
    body: "Выбираешь технику, сборку или товар, добавляешь в корзину и оставляешь контакты. Менеджер подтверждает наличие, комплектацию, доставку и оплату.",
  },
  {
    kicker: "02",
    title: "Оплата",
    body: `${siteTerms.paymentStore} ${siteTerms.paymentOnline}`,
  },
  {
    kicker: "03",
    title: "Предоплата",
    body: siteTerms.paymentPrepay,
  },
  {
    kicker: "04",
    title: "Самовывоз",
    body: `${siteTerms.pickup} Адрес: ${siteContacts.primaryAddress}.`,
  },
  {
    kicker: "05",
    title: "Доставка",
    body: `${siteTerms.moscowDelivery} ${siteTerms.regionDelivery}`,
  },
  {
    kicker: "06",
    title: "Сроки",
    body: "По Москве доставка обычно возможна от одного дня при наличии товара. Через транспортную компанию сроки обычно от 3 дней. Для сборок и заказных позиций срок согласуется отдельно.",
  },
  {
    kicker: "07",
    title: "Юрлица",
    body: siteTerms.legalInvoices,
  },
  {
    kicker: "08",
    title: "Возврат и гарантия",
    body: `${siteTerms.warranty} ${siteTerms.returnPolicy}`,
  },
];

export default function DeliveryPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-5 pb-20 pt-28 text-white sm:px-6 md:px-12 md:pt-36">
      <div className="mx-auto max-w-[1400px]">
        <span className="mb-4 block font-mono text-xs font-black uppercase tracking-[0.4em] text-[#16d8ff]">Info</span>
        <h1 className="st-display max-w-[1100px] text-[clamp(3.3rem,8vw,7rem)] font-black uppercase italic leading-[0.9]">
          Доставка <span className="text-[#16d8ff]">и оплата</span>
        </h1>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {blocks.map((item) => (
            <section key={item.title} className="border border-white/10 bg-[#0a0a0a] p-5 transition-colors hover:border-[#16d8ff]/50 sm:p-6">
              <div className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#ff00e6]">{item.kicker}</div>
              <h2 className="mt-5 text-2xl font-black uppercase italic leading-tight">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/50">{item.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-8 border border-[#16d8ff]/25 bg-[#071014] p-5 sm:p-7">
          <div className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#16d8ff]">Questions</div>
          <h2 className="mt-4 text-2xl font-black uppercase italic sm:text-4xl">Остались вопросы?</h2>
          <p className="mt-4 max-w-3xl leading-7 text-white/55">
            Задай их менеджеру: {siteContacts.phonePrimary}, {siteContacts.phoneSecondary} или {siteContacts.email}.
          </p>
        </section>
      </div>
    </main>
  );
}
