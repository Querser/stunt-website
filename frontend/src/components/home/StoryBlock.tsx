import { Boxes, Clock3, ShieldCheck, Users } from "lucide-react";

import { HOME_IMAGES } from "../../lib/config";

const stats = [
  { value: "10+", label: "Лет в теме", Icon: ShieldCheck },
  { value: "25K+", label: "Довольных райдеров", Icon: Users },
  { value: "1000+", label: "Товаров в наличии", Icon: Boxes },
  { value: "24/7", label: "Поддержка", Icon: Clock3 },
];

export function StoryBlock() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[#040404]">
      <div className="homePage-container grid items-center gap-9 py-14 sm:py-16 lg:grid-cols-[1fr_1.06fr] lg:py-20">
        <div className="relative grid grid-cols-10 gap-3">
          <div className="col-span-7 overflow-hidden border border-white/10 bg-black">
            <img
              src={HOME_IMAGES.storyMain}
              alt="Райдер Stunt Tech"
              className="h-full w-full object-cover object-center grayscale contrast-125 brightness-85"
            />
          </div>
          <div className="col-span-7 col-start-4 -mt-5 overflow-hidden border border-white/10 bg-black sm:-mt-8">
            <img
              src={HOME_IMAGES.storySecondary}
              alt="Мотоциклетное комьюнити"
              className="h-full w-full object-cover object-center grayscale contrast-125 brightness-80"
            />
          </div>
          <div className="absolute -bottom-4 left-5 -rotate-12 border-2 border-[#b8ff00] bg-[#ff00c8] px-6 py-5 sm:left-8">
            <div className="home-main-title text-[15px] leading-[1.05] tracking-[0.02em] text-white">
              <span className="block">Authentic</span>
              <span className="block">Riders</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="home-main-title text-[clamp(3rem,7vw,5.6rem)] leading-[0.9] tracking-[-0.03em] text-white">
            <span className="block">Мы не просто</span>
            <span className="block text-[#b8ff00]">Магазин</span>
          </h2>

          <p className="mt-6 max-w-[560px] text-sm leading-7 text-white/72 sm:text-base sm:leading-8">
            Stunt Tech зародился в гаражной пыли и запахе перегретого масла. Мы строим место для своих: тех, кто не
            представляет жизнь без станта, ночных переборок и чистого проезда в выходные.
          </p>

          <ul className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-5">
            {stats.map(({ value, label, Icon }) => (
              <li key={label} className="border border-white/10 bg-black/40 px-4 py-4">
                <Icon className="mb-3 h-5 w-5 text-[#b8ff00]" />
                <div className="home-main-title text-[2rem] leading-none tracking-[-0.01em] text-white sm:text-[2.3rem]">{value}</div>
                <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/74 sm:text-[11px]">{label}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
