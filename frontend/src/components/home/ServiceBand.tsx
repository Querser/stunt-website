import Link from "next/link";
import { Cog, ShieldCheck, SlidersHorizontal, Wrench } from "lucide-react";

import { HOME_IMAGES } from "../../lib/config";

const serviceFeatures = [
  { label: "Опытные спецы", Icon: Wrench },
  { label: "Точная настройка", Icon: SlidersHorizontal },
  { label: "Профессиональное оборудование", Icon: Cog },
  { label: "Гарантия на работы", Icon: ShieldCheck },
];

export function ServiceBand() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[#050505]">
      <div className="homePage-container py-14 sm:py-16 md:py-20">
        <div className="relative min-h-[460px] overflow-hidden border border-white/12 bg-black sm:min-h-[500px] lg:min-h-[540px]">
          <img
            src={HOME_IMAGES.service}
            alt="Сервис Stunt Tech"
            className="home-service-image absolute inset-0 h-full w-full object-cover object-[72%_52%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(92deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.78)_36%,rgba(0,0,0,0.28)_66%,rgba(0,0,0,0.66)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.52)_100%)]" />

          <div className="relative z-10 flex h-full w-full max-w-[96vw] flex-col justify-start px-5 pb-8 pt-8 sm:max-w-[620px] sm:px-7 sm:pb-10 sm:pt-10 lg:max-w-[58%] lg:px-9 lg:pt-11">
            <div className="mb-4 flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#ff00c8]">
              <span className="h-0.5 w-4 bg-[#b8ff00]" />
              Workshop service
            </div>

            <h2 className="home-main-title text-[clamp(1.95rem,9.2vw,6rem)] leading-[0.9] tracking-[-0.02em] text-white sm:text-[clamp(2.7rem,7.4vw,6rem)]">
              <span className="block">Твой байк -</span>
              <span className="home-brush block">Наш</span>
              <span className="home-brush block">Инструмент</span>
            </h2>

            <p className="mt-5 max-w-[560px] text-sm leading-6 text-white/78 sm:text-base sm:leading-7">
              Подготовим питбайк или мотоцикл под стант: от дублера и бугеля до полной настройки под райдера.
            </p>

            <div className="mt-7 sm:mt-8">
              <Link
                href="/service"
                className="home-cta-lime inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-6 text-[11px] font-extrabold uppercase tracking-[0.12em] text-black transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8ff00] sm:min-h-[52px] sm:w-auto sm:px-7 sm:text-[12px]"
              >
                Записаться в сервис
                <span aria-hidden>↗</span>
              </Link>
            </div>
          </div>
        </div>

        <ul className="service-feature-strip" aria-label="Преимущества сервиса">
          {serviceFeatures.map(({ label, Icon }) => (
            <li key={label} className="service-feature">
              <span className="service-feature-icon">
                <Icon />
              </span>
              <span className="service-feature-text">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
