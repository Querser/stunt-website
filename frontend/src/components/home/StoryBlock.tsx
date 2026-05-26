import { WORKSHOP_IMAGE } from "../../lib/config";

export function StoryBlock() {
  return (
    <section className="mx-auto grid max-w-[1700px] gap-10 px-5 py-16 sm:px-6 sm:py-20 md:px-12 md:py-28 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div className="relative grid grid-cols-8 gap-4">
        <img src={WORKSHOP_IMAGE} alt="Stunt Tech workshop" className="col-span-5 aspect-[4/3] w-full object-cover grayscale" />
        <img src={WORKSHOP_IMAGE} alt="Workshop interior" className="col-span-4 col-start-5 aspect-[4/3] w-full object-cover grayscale" />
        <img src={WORKSHOP_IMAGE} alt="Service zone" className="col-span-6 aspect-[16/9] w-full object-cover grayscale" />
        <div className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 rotate-12 place-items-center bg-[#ff00e6] p-3 text-center text-sm font-black uppercase italic text-white sm:h-44 sm:w-44 sm:text-xl">
          Authentic Riders
        </div>
      </div>
      <div>
        <h2 className="st-display text-[3rem] font-black uppercase italic text-white sm:text-6xl md:text-7xl">
          Мы не просто<br />
          <span className="text-[#ff00e6]">магазин</span>
        </h2>
        <p className="mt-6 text-base leading-7 text-white/55 sm:mt-8 sm:text-xl sm:leading-9">
          Stunt Tech зародился в гаражной пыли и запахе перегретого масла. Мы строим место для своих: тех, кто не представляет жизни без станта, ночных переборок и чистого проезда в выходные.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-5 border-t border-white/10 pt-7 sm:mt-10 sm:pt-8">
          <div>
            <div className="text-4xl font-black italic text-[#16d8ff] sm:text-5xl">500+</div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 sm:text-xs sm:tracking-[0.35em]">Custom projects</div>
          </div>
          <div>
            <div className="text-4xl font-black italic text-[#ff00e6] sm:text-5xl">15K</div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 sm:text-xs sm:tracking-[0.35em]">Community members</div>
          </div>
        </div>
      </div>
    </section>
  );
}
