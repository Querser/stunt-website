import Link from "next/link";

import { HOME_IMAGES } from "../../lib/config";

const directions = [
  {
    index: "01",
    title: "Питбайки",
    href: "/catalog",
    image: HOME_IMAGES.categories[0],
  },
  {
    index: "02",
    title: "Конфиг",
    href: "/configurator",
    image: HOME_IMAGES.categories[1],
  },
  {
    index: "03",
    title: "Запчасти",
    href: "/parts",
    image: HOME_IMAGES.categories[2],
    active: true,
  },
  {
    index: "04",
    title: "Сервис",
    href: "/service",
    image: HOME_IMAGES.categories[3],
  },
];

export function DirectionGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {directions.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          aria-label={item.title}
          className={`group relative overflow-hidden border bg-[#0b0b0b] transition-all duration-300 hover:-translate-y-1 ${
            item.active
              ? "border-[#ff00c8]/60 shadow-[0_0_22px_rgba(255,0,200,0.2)]"
              : "border-white/12 hover:border-[#b8ff00]/45"
          }`}
        >
          <div className="relative aspect-[3/4] min-h-[290px] sm:min-h-[340px]">
            <img
              src={item.image}
              alt={item.title}
              className="home-direction-image absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.15)_58%,rgba(0,0,0,0.34)_100%)]" />
            <div className="absolute left-0 top-0 h-24 w-24 bg-[linear-gradient(135deg,rgba(3,3,3,0.98)_0%,rgba(3,3,3,0.3)_100%)]" />
            <div className="absolute bottom-0 right-0 h-24 w-24 bg-[linear-gradient(315deg,rgba(3,3,3,0.98)_0%,rgba(3,3,3,0.34)_100%)]" />

            <span className="sr-only">{item.title}</span>
            <span className="sr-only">{item.index}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
