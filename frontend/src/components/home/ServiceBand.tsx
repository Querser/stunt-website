import Link from "next/link";

import { HOME_IMAGES } from "../../lib/config";

export function ServiceBand() {
  return (
    <section className="overflow-hidden border-y border-white/10 bg-[#060606]">
      <div className="homePage-container py-3 sm:py-4 md:py-5">
        <div className="relative overflow-hidden border border-white/10 bg-black">
          <img
            src={HOME_IMAGES.service}
            alt="Твой байк — наш инструмент"
            className="h-[64vh] min-h-[430px] w-full object-cover object-[70%_50%] md:h-[86vh] md:min-h-[620px] md:max-h-[920px] md:object-contain md:object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.44)_100%)]" />

          <div className="absolute inset-x-0 bottom-16 z-10 hidden px-6 md:block lg:bottom-20 lg:px-8">
            <Link
              href="/service"
              className="home-cta-lime inline-flex min-h-14 items-center justify-center gap-2 px-7 text-[12px] font-extrabold uppercase tracking-[0.14em] text-black transition-all hover:brightness-110"
            >
              Записаться в сервис
              <span aria-hidden>↗</span>
            </Link>
          </div>
        </div>

        <div className="mt-4 md:hidden">
          <Link
            href="/service"
            className="home-cta-lime inline-flex min-h-[52px] w-full items-center justify-center gap-2 px-6 text-[11px] font-extrabold uppercase tracking-[0.14em] text-black transition-all hover:brightness-110"
          >
            Записаться в сервис
            <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
