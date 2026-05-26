import Link from "next/link";
import { Zap } from "lucide-react";

import { HERO_IMAGE } from "../../lib/config";

export function HomeHero() {
  return (
    <section className="overflow-hidden border-b border-white/10 bg-black">
      <div className="homePage-container py-3 sm:py-4 md:py-5">
        <div className="relative overflow-hidden border border-white/10 bg-black">
          <img
            src={HERO_IMAGE}
            alt="Твой байк — твои правила"
            className="h-[64vh] min-h-[430px] w-full object-cover object-[74%_50%] md:h-[86vh] md:min-h-[620px] md:max-h-[900px] md:object-contain md:object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.44)_100%)]" />

          <div className="absolute inset-x-0 bottom-16 z-10 hidden px-6 md:block lg:bottom-20 lg:px-8">
            <div className="flex max-w-[470px] gap-4">
              <Link
                href="/catalog"
                className="home-cta-lime inline-flex min-h-14 items-center justify-center gap-2 px-7 text-[12px] font-extrabold uppercase tracking-[0.14em] text-black transition-all hover:brightness-110"
              >
                Перейти в каталог
                <span aria-hidden>↗</span>
              </Link>
              <Link
                href="/configurator"
                className="home-cta-magenta inline-flex min-h-14 items-center justify-center gap-2 border border-[#ff00c8]/80 bg-black/45 px-7 text-[12px] font-extrabold uppercase tracking-[0.14em] text-white transition-all hover:border-[#ff00c8] hover:shadow-[0_0_22px_rgba(255,0,200,0.35)]"
              >
                Собрать байк
                <Zap className="h-3.5 w-3.5 text-[#b8ff00]" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:hidden">
          <Link
            href="/catalog"
            className="home-cta-lime inline-flex min-h-[52px] items-center justify-center gap-2 px-5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-black transition-all hover:brightness-110"
          >
            Перейти в каталог
            <span aria-hidden>↗</span>
          </Link>
          <Link
            href="/configurator"
            className="home-cta-magenta inline-flex min-h-[52px] items-center justify-center gap-2 border border-[#ff00c8]/80 bg-black/45 px-5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white transition-all hover:border-[#ff00c8] hover:shadow-[0_0_22px_rgba(255,0,200,0.35)]"
          >
            Собрать байк
            <Zap className="h-3.5 w-3.5 text-[#b8ff00]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
