import Link from "next/link";
import { Globe, Headset, ShieldCheck, Truck, Zap } from "lucide-react";

import { HERO_IMAGE } from "../../lib/config";

export function HomeHero() {
  const trustItems = [
    { label: "Проверено стантерами", Icon: ShieldCheck },
    { label: "Премиум качество", Icon: Zap },
    { label: "Быстрая доставка", Icon: Truck },
    { label: "Поддержка 24/7", Icon: Headset },
  ];

  return (
    <section className="relative min-h-[760px] overflow-hidden border-b border-white/10 bg-black md:min-h-[840px]">
      <img src={HERO_IMAGE} alt="Stunt motorcycle" className="absolute inset-0 h-full w-full object-cover object-[68%_48%] md:object-right" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.98)_0%,rgba(0,0,0,0.88)_38%,rgba(0,0,0,0.36)_74%,rgba(0,0,0,0.7)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.84)_0%,rgba(8,8,8,0.35)_35%,rgba(8,8,8,0.78)_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[40vw] bg-[radial-gradient(circle_at_70%_36%,rgba(255,0,200,0.25),transparent_52%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-[10%] w-[28vw] bg-[radial-gradient(circle_at_70%_44%,rgba(184,255,0,0.2),transparent_60%)]" />

      <div className="homePage-container relative z-10 flex min-h-[760px] items-end pb-10 pt-28 sm:pb-14 sm:pt-32 md:min-h-[840px]">
        <div className="max-w-[720px]">
          <h1 className="home-main-title text-[clamp(3.3rem,11vw,8.8rem)] leading-[0.84] tracking-[-0.035em] text-white">
            <span className="block">Твой байк —</span>
            <span className="block">Твои</span>
            <span className="home-main-title-magenta block">Правила</span>
          </h1>
          <p className="mt-6 max-w-[560px] text-sm leading-6 text-white/74 sm:text-base sm:leading-7 md:mt-8 md:text-[1.1rem] md:leading-8">
            Техника, стант-тюнинг и оригинальные запчасти Stunt Tech для тех, кто живёт на заднем.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5 sm:mt-10 sm:gap-4">
            <Link
              href="/catalog"
              className="home-cta-lime inline-flex min-h-[52px] min-w-[204px] items-center justify-center gap-2 px-7 text-[11px] font-extrabold uppercase tracking-[0.14em] text-black transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8ff00] sm:min-h-14 sm:text-[12px]"
            >
              Перейти в каталог
              <span aria-hidden>↗</span>
            </Link>
            <Link
              href="/configurator"
              className="home-cta-magenta inline-flex min-h-[52px] min-w-[194px] items-center justify-center gap-2 border border-[#ff00c8]/80 bg-black/35 px-7 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white transition-all hover:border-[#ff00c8] hover:shadow-[0_0_22px_rgba(255,0,200,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff00c8] sm:min-h-14 sm:text-[12px]"
            >
              Собрать байк
              <Zap className="h-3.5 w-3.5 text-[#b8ff00]" />
            </Link>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-white sm:mt-10 sm:flex sm:flex-wrap sm:gap-7 sm:text-[11px] md:text-xs">
            {trustItems.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-[#b8ff00]/70 bg-black/60">
                  <Icon className="h-3.5 w-3.5 text-[#b8ff00]" />
                </span>
                <span className="text-white/82">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-14 right-4 z-20 hidden items-center gap-3 border border-white/15 bg-black/70 px-4 py-3 backdrop-blur-sm lg:flex">
        <Globe className="h-5 w-5 text-white/75" />
        <div>
          <div className="home-main-title text-[1.45rem] leading-none tracking-[-0.02em] text-white">STUNT</div>
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff00c8]">Approved</div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-9 right-2 hidden h-20 w-44 rotate-[-8deg] bg-[#b8ff00] [clip-path:polygon(16%_0,100%_12%,80%_100%,0_88%)] lg:block" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-full bg-[linear-gradient(180deg,rgba(3,3,3,0)_0%,rgba(3,3,3,0.92)_88%)]" />
    </section>
  );
}
