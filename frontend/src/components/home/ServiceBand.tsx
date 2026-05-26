import { PrimaryLink } from "../ui/PrimaryLink";

export function ServiceBand() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[#080808]">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(22,216,255,0.18),transparent_48%)] lg:block" />
      <div className="mx-auto grid max-w-[1700px] gap-9 px-5 py-16 sm:px-6 sm:py-20 md:px-12 md:py-28 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-5 flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#16d8ff] sm:mb-6 sm:gap-4 sm:text-xs sm:tracking-[0.45em]">
            <span className="h-px w-10 bg-[#16d8ff] sm:w-12" />
            Workshop Service
          </div>
          <h2 className="st-display text-[3rem] font-black uppercase italic text-white sm:text-6xl md:text-8xl">
            Твой байк -<br />
            <span className="text-[#ff00e6] drop-shadow-[0_0_24px_rgba(255,0,230,0.45)]">наш инструмент</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/55 sm:mt-8 sm:text-lg sm:leading-8">
            Подготовим питбайк или большой мотоцикл под стант: от дублера и бугеля до полной настройки под райдера.
          </p>
          <div className="mt-8 sm:mt-10">
            <PrimaryLink href="/service">Записаться в сервис</PrimaryLink>
          </div>
        </div>
        <div className="relative min-h-[280px] overflow-hidden border border-white/10 bg-[#101820] sm:min-h-[360px] lg:min-h-[420px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(22,216,255,0.22),transparent_34%)]" />
          <div className="absolute inset-12 rounded-full border border-[#16d8ff]/25" />
          <div className="absolute inset-24 rounded-full border border-[#ff00e6]/25" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-6xl font-black uppercase italic text-white/22 sm:text-8xl md:text-[10rem]">STUNT</div>
              <div className="-mt-5 font-mono text-xs font-black uppercase tracking-[0.32em] text-[#ff00e6] sm:-mt-8 sm:text-sm sm:tracking-[0.5em]">Approved</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
