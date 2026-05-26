import { Boxes, Clock3, ShieldCheck, Users } from "lucide-react";

const stats = [
  { value: "10+", label: "Лет в теме", Icon: ShieldCheck },
  { value: "25K+", label: "Довольных райдеров", Icon: Users },
  { value: "1000+", label: "Товаров в наличии", Icon: Boxes },
  { value: "24/7", label: "Поддержка", Icon: Clock3 },
];

export function StoryBlock() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[#040404]">
      <div className="homePage-container grid items-start gap-8 py-12 sm:py-14 lg:grid-cols-[1.32fr_0.86fr] lg:gap-10 lg:py-18">
        <div className="relative overflow-hidden border border-white/10 bg-black">
          <img src="/home/story-collage-new.png" alt="Мы не просто магазин" className="h-full min-h-[360px] w-full object-cover object-center sm:min-h-[520px] lg:min-h-[700px]" />
        </div>

        <div className="min-w-0">
          <h2 className="home-main-title max-w-full text-[clamp(2.3rem,9vw,5rem)] leading-[0.9] tracking-[-0.02em] text-white">
            <span className="block">Мы не просто</span>
            <span className="block text-[#b8ff00]">Магазин</span>
          </h2>

          <p className="mt-5 max-w-[560px] text-sm leading-6 text-white/74 sm:text-base sm:leading-7">
            Stunt Tech зародился в гаражной пыли и запахе перегретого масла. Мы строим место для своих: тех, кто не представляет жизнь без станта, ночных
            переборок и чистого проезда в выходные.
          </p>

          <ul className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4">
            {stats.map(({ value, label, Icon }) => (
              <li key={label} className="border border-white/10 bg-black/40 px-3 py-3 sm:px-4 sm:py-4">
                <Icon className="mb-2 h-4 w-4 text-[#b8ff00] sm:h-5 sm:w-5" />
                <div className="home-main-title text-[1.6rem] leading-none tracking-[-0.01em] text-white sm:text-[2.1rem]">{value}</div>
                <div className="mt-1 break-words text-[10px] font-semibold uppercase tracking-[0.06em] text-white/74 sm:text-[11px]">{label}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
