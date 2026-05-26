"use client";

import { motion } from "motion/react";
import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { siteContacts } from "../lib/site";

const phoneHref = (phone: string) => `tel:${phone.replace(/\D/g, "")}`;

const contactLinks: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "WhatsApp", href: siteContacts.whatsapp, icon: MessageCircle },
  { label: "Telegram", href: siteContacts.telegramManager, icon: MessageCircle },
  { label: "VK", href: siteContacts.vk, icon: ArrowUpRight },
  { label: "Email", href: `mailto:${siteContacts.email}`, icon: Mail },
];

const garageServices = [
  {
    title: "Выдача техники",
    text: "Самовывоз заказов, быстрый осмотр перед передачей и ответы по комплектации на месте.",
    icon: ShieldCheck,
  },
  {
    title: "Конфиги и допы",
    text: "Помогаем собрать понятный сетап: база, графика, дублер, бугель, свет и остальные позиции.",
    icon: Wrench,
  },
  {
    title: "Сервис",
    text: "Запись на обслуживание, ремонт, установку стант-комплектующих и подготовку техники.",
    icon: Clock,
  },
];

const visitSteps = [
  "Напиши менеджеру и уточни наличие техники или запчасти.",
  "Согласуй время, чтобы нужный человек был на месте.",
  "Приезжай в гараж, забирай заказ или обсуждай сборку.",
];

export function GaragePage() {
  return (
    <main className="min-h-screen bg-[#050505] px-5 pb-20 pt-28 text-white sm:px-6 md:px-12 md:pb-28 md:pt-36">
      <div className="mx-auto max-w-[1700px]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-white/10 pb-8 md:pb-12"
        >
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_520px] xl:items-end">
            <div>
              <div className="mb-5 flex items-center gap-4 font-mono text-[10px] font-black uppercase tracking-[0.35em] text-[#16d8ff]">
                <span className="h-px w-12 bg-[#16d8ff]" />
                Garage
              </div>
              <h1 className="st-display text-[clamp(3.2rem,8.2vw,9rem)] font-black uppercase italic leading-[0.86]">
                Stunt <span className="text-[#16d8ff]">гараж</span>
              </h1>
              <p className="mt-6 max-w-4xl font-mono text-sm uppercase leading-7 tracking-[0.16em] text-white/45 sm:text-base">
                Точка выдачи, сервис, сборки и живой разговор по технике без витринной суеты.
              </p>
            </div>

            <div className="border border-white/10 bg-[#0b0b0b] p-5 md:p-7">
              <div className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#ff00e6]">
                Перед приездом
              </div>
              <p className="mt-4 text-2xl font-black uppercase italic leading-tight sm:text-3xl">
                Уточни наличие и время у менеджера.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a
                  href={siteContacts.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-14 items-center justify-center border border-[#16d8ff] bg-[#16d8ff] px-4 font-mono text-xs font-black uppercase tracking-[0.2em] text-black transition-colors hover:bg-white"
                >
                  WhatsApp
                </a>
                <a
                  href={siteContacts.telegramManager}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-14 items-center justify-center border border-white/15 px-4 font-mono text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:border-[#ff00e6] hover:text-[#ff00e6]"
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 border border-[#ff00e6]/45 bg-[#170516] p-5 shadow-[0_0_60px_rgba(255,0,230,0.12)] md:p-7">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-end">
              <div>
                <div className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#ff00e6]">
                  Быстрая связь
                </div>
                <a
                  href={phoneHref(siteContacts.phonePrimary)}
                  className="mt-4 block w-fit max-w-full text-[clamp(2.25rem,6vw,6.6rem)] font-black uppercase italic leading-[0.92] text-white transition-colors hover:text-[#16d8ff]"
                >
                  {siteContacts.phonePrimary}
                </a>
              </div>
              <div className="grid gap-3 border-t border-white/10 pt-5 xl:border-l xl:border-t-0 xl:pl-7 xl:pt-0">
                <a
                  href={phoneHref(siteContacts.phoneSecondary)}
                  className="font-mono text-sm font-black uppercase tracking-[0.22em] text-white/55 transition-colors hover:text-white"
                >
                  {siteContacts.phoneSecondary}
                </a>
                <a
                  href={`mailto:${siteContacts.email}`}
                  className="font-mono text-sm font-black uppercase tracking-[0.18em] text-[#16d8ff] transition-colors hover:text-white"
                >
                  {siteContacts.email}
                </a>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          {garageServices.map(({ title, text, icon: Icon }) => (
            <article
              key={title}
              className="group min-h-[260px] border border-white/10 bg-[#0b0b0b] p-6 transition-colors hover:border-[#ff00e6]/65 md:p-7"
            >
              <div className="flex items-start justify-between gap-5">
                <div className="grid h-14 w-14 shrink-0 place-items-center border border-[#16d8ff]/35 text-[#16d8ff] transition-colors group-hover:border-[#ff00e6] group-hover:text-[#ff00e6]">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                  STG
                </span>
              </div>
              <h2 className="mt-8 text-[clamp(1.75rem,3vw,3rem)] font-black uppercase italic leading-none text-white">
                {title}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/45">{text}</p>
            </article>
          ))}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]">
          <div className="border border-white/10 bg-[#080808] p-6 md:p-8">
            <div className="flex items-center gap-4 font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#16d8ff]">
              <Navigation className="h-4 w-4" />
              Как попасть
            </div>
            <h2 className="mt-5 text-[clamp(2.3rem,5vw,5.6rem)] font-black uppercase italic leading-[0.9]">
              Приезд без лишних кругов
            </h2>
            <div className="mt-8 grid gap-4">
              {visitSteps.map((step, index) => (
                <div key={step} className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 border-t border-white/10 pt-4">
                  <span className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[#ff00e6]">
                    0{index + 1}
                  </span>
                  <p className="text-sm leading-7 text-white/55">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_300px]">
              <div className="border border-white/10 bg-[#0b0b0b] p-6 md:p-7">
                <div className="mb-5 flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#16d8ff]">
                  <MapPin className="h-4 w-4" />
                  Адрес
                </div>
                <h3 className="text-2xl font-black uppercase italic leading-tight sm:text-4xl">
                  {siteContacts.primaryAddress}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/45">
                  Дополнительная точка: {siteContacts.secondaryAddress}.
                </p>
              </div>

              <div className="border border-white/10 bg-[#0b0b0b] p-6 md:p-7">
                <div className="mb-5 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#ff00e6]">
                  Юр. данные
                </div>
                <p className="text-lg font-black uppercase italic leading-tight text-white">{siteContacts.legalName}</p>
                <p className="mt-5 font-mono text-xs font-black uppercase tracking-[0.18em] text-white/35">
                  Контакты и условия уточняются у менеджера перед оплатой.
                </p>
              </div>
            </div>

            <div className="border border-white/10 bg-[#080808] p-4">
              <div className="aspect-[16/7] min-h-[320px] overflow-hidden bg-black">
                <iframe
                  src="https://yandex.ru/map-widget/v1/?text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D0%9A%D0%B0%D1%88%D0%B8%D1%80%D1%81%D0%BA%D0%BE%D0%B5%20%D1%88%D0%BE%D1%81%D1%81%D0%B5%2C%2014&z=16"
                  className="h-full w-full grayscale contrast-125 opacity-80"
                  title="Карта Stunt Tech"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {contactLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="group flex min-h-20 items-center justify-between border border-white/10 bg-white/[0.03] px-5 font-mono text-xs font-black uppercase tracking-[0.18em] text-white/65 transition-colors hover:border-[#16d8ff] hover:text-white"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-[#16d8ff] transition-colors group-hover:text-[#ff00e6]" />
                {label}
              </span>
              <ArrowUpRight className="h-4 w-4 opacity-45" />
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
