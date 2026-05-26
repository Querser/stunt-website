import { Search, UserRound, ShoppingCart } from "lucide-react";

import { HERO_IMAGE } from "../../lib/config";
import { PrimaryLink } from "../ui/PrimaryLink";

export function HomeHero() {
  return (
    <section className="relative min-h-[760px] overflow-hidden border-b border-white/10 bg-black md:min-h-[92vh]">
      <img src={HERO_IMAGE} alt="Stunt rider on motorcycle" className="absolute inset-0 h-full w-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.58)_46%,rgba(0,0,0,0.34)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,5,20,0.68)_0%,rgba(0,0,0,0)_42%,#050505_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[760px] max-w-[1700px] flex-col justify-center px-5 pb-14 pt-28 sm:px-6 md:min-h-[92vh] md:px-12 md:pt-32">
        <div className="mb-5 flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#16d8ff] sm:mb-6 sm:gap-4 sm:text-xs sm:tracking-[0.45em]">
          <span className="h-px w-10 bg-[#16d8ff] sm:w-14" />
          Street Moto Culture
        </div>
        <h1 className="st-display max-w-5xl text-[3.45rem] font-black uppercase italic text-white sm:text-7xl md:text-[8rem]">
          Твой байк -<br />
          твои <span className="text-[#ff00e6] drop-shadow-[0_0_28px_rgba(255,0,230,0.45)]">правила</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/55 sm:mt-8 sm:text-xl sm:leading-9">
          Техника, стант-тюнинг и собственные запчасти Stunt Tech для тех, кто живет на заднем.
        </p>
        <div className="mt-9 flex flex-wrap gap-4 sm:mt-12 sm:gap-5">
          <PrimaryLink href="/catalog">Перейти в каталог</PrimaryLink>
          <PrimaryLink href="/configurator" tone="magenta">Собрать байк</PrimaryLink>
        </div>

        <div className="absolute right-6 top-8 hidden items-center gap-8 text-white/80 md:flex">
          <Search className="h-6 w-6" />
          <UserRound className="h-6 w-6" />
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -right-3 -top-3 grid h-5 w-5 place-items-center rounded-full bg-[#ff00e6] text-xs font-black text-white">3</span>
          </div>
        </div>

        <div className="absolute bottom-20 right-12 hidden h-72 items-center gap-8 lg:flex">
          <div className="h-full w-px bg-white/15" />
          <div className="rotate-180 font-mono text-[10px] uppercase tracking-[0.55em] text-white/35 [writing-mode:vertical-rl]">
            Since 2018 / Stunt Tech Workshop
          </div>
        </div>
      </div>
    </section>
  );
}
