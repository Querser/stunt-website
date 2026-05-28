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
    <section className="relative min-h-[660px] overflow-hidden border-b border-white/10 bg-black sm:min-h-[760px] md:min-h-[860px]">
      <img
        src={HERO_IMAGE}
        alt="Stunt motorcycle"
        className="home-hero-image absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.84)_40%,rgba(0,0,0,0.36)_72%,rgba(0,0,0,0.68)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.78)_0%,rgba(8,8,8,0.24)_38%,rgba(8,8,8,0.84)_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-[2%] w-[24vw] bg-[radial-gradient(circle_at_78%_44%,rgba(255,0,205,0.18),transparent_60%)]" />

      <div className="homePage-container home-hero-shell relative z-10 flex min-h-[660px] items-end pb-8 pt-24 sm:min-h-[760px] sm:pb-12 sm:pt-28 md:min-h-[860px] md:pb-14 md:pt-32">
        <div className="home-hero-content max-w-[780px]">
          <h1 className="home-main-title max-w-[94vw] text-[clamp(1.95rem,9.6vw,8.8rem)] leading-[0.87] tracking-[-0.02em] text-white sm:text-[clamp(3rem,10.2vw,8.8rem)]">
            <span className="block">Твой байк -</span>
            <span className="block">Твои</span>
            <span className="home-brush block text-[1.04em]">Правила</span>
          </h1>

          <p className="mt-5 max-w-[580px] text-sm leading-6 text-white/74 sm:mt-6 sm:text-base sm:leading-7 md:mt-8 md:text-[1.1rem] md:leading-8">
            Техника, стант-тюнинг и оригинальные запчасти Stunt Tech для тех, кто живет на заднем.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link
              href="/catalog"
              className="home-cta-lime inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-6 text-[11px] font-extrabold uppercase tracking-[0.12em] text-black transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8ff00] sm:min-h-[52px] sm:min-w-[206px] sm:w-auto sm:px-7 sm:text-[12px]"
            >
              Перейти в каталог
              <span aria-hidden>↗</span>
            </Link>
            <Link
              href="/configurator"
              className="home-cta-magenta inline-flex min-h-[48px] w-full items-center justify-center gap-2 bg-black/35 px-6 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white transition-all hover:border-[#ff00c8] hover:shadow-[0_0_22px_rgba(255,0,200,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff00c8] sm:min-h-[52px] sm:min-w-[194px] sm:w-auto sm:px-7 sm:text-[12px]"
            >
              Собрать байк
              <Zap className="h-3.5 w-3.5 text-[#b8ff00]" />
            </Link>
          </div>

          <div className="hero-perks-wrap">
            <ul className="hero-perks" aria-label="Преимущества сервиса">
              {trustItems.map(({ label, Icon }) => (
                <li key={label} className="hero-perk">
                  <span className="hero-perk-icon">
                    <Icon />
                  </span>
                  <span className="hero-perk-text">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-14 right-4 z-20 hidden items-center gap-3 border border-white/15 bg-black/68 px-4 py-3 backdrop-blur-sm lg:flex">
        <Globe className="h-5 w-5 text-white/78" />
        <div>
          <div className="home-main-title text-[1.45rem] leading-none tracking-[-0.02em] text-white">STUNT</div>
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff00c8]">Approved</div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 right-2 hidden h-20 w-44 rotate-[-8deg] bg-[#b8ff00] [clip-path:polygon(16%_0,100%_12%,80%_100%,0_88%)] lg:block" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-20 w-full bg-[linear-gradient(180deg,rgba(3,3,3,0)_0%,rgba(3,3,3,0.9)_90%)]" />
    </section>
  );
}
