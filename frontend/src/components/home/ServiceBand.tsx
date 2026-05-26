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
    <section className="relative overflow-hidden border-y border-white/10 bg-[#060606]">
      <div className="homePage-container py-14 sm:py-16 md:py-20">
        <div className="grid items-stretch gap-7 lg:grid-cols-[1fr_1.08fr]">
          <div className="flex flex-col justify-center border border-white/10 bg-[linear-gradient(180deg,#050505_0%,#0a0a0a_100%)] px-5 py-8 sm:px-7 md:px-9 md:py-10">
            <div className="mb-6 flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#ff00c8]">
              <span className="h-0.5 w-4 bg-[#b8ff00]" />
              Workshop service
            </div>

            <h2 className="home-main-title text-[clamp(2.8rem,8vw,6rem)] leading-[0.9] tracking-[-0.03em] text-white">
              <span className="block">Твой байк —</span>
              <span className="home-main-title-magenta block">Наш</span>
              <span className="home-main-title-magenta block">Инструмент</span>
            </h2>

            <p className="mt-6 max-w-[470px] text-sm leading-6 text-white/68 sm:text-base sm:leading-7">
              Подготовим питбайк или мотоцикл под стант: от дублера и бугеля до полной настройки под райдера.
            </p>

            <div className="mt-8">
              <Link
                href="/service"
                className="home-cta-lime inline-flex min-h-[52px] items-center justify-center gap-2 px-7 text-[11px] font-extrabold uppercase tracking-[0.14em] text-black transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8ff00] sm:min-h-14 sm:text-[12px]"
              >
                Записаться в сервис
                <span aria-hidden>↗</span>
              </Link>
            </div>
          </div>

          <div className="relative min-h-[280px] overflow-hidden border border-white/10 bg-black sm:min-h-[360px] lg:min-h-[420px]">
            <img
              src={HOME_IMAGES.service}
              alt="Сервис Stunt Tech"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-72 saturate-60 contrast-115 brightness-70 grayscale"
            />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.7)_0%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.76)_100%)]" />
            <div className="pointer-events-none absolute -bottom-6 right-6 h-32 w-40 rotate-[-16deg] bg-[#ff00c8] opacity-80 blur-[1px] [clip-path:polygon(8%_18%,100%_0,76%_100%,0_84%)]" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-36 w-44 rotate-[-10deg] bg-[#b8ff00] opacity-85 [clip-path:polygon(18%_0,100%_12%,74%_100%,0_84%)]" />
          </div>
        </div>

        <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {serviceFeatures.map(({ label, Icon }) => (
            <li key={label} className="flex items-center gap-2.5 border border-white/10 bg-black/45 px-3 py-3">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-[#b8ff00]/55 bg-black text-[#b8ff00]">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/86 sm:text-[11px]">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
