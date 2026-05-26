import Link from "next/link";

import { HOME_IMAGES } from "../../lib/config";

const directions = [
  { index: "01", title: "Питбайки", href: "/catalog", image: HOME_IMAGES.categories[0] },
  { index: "02", title: "Конфиг", href: "/configurator", image: HOME_IMAGES.categories[1] },
  { index: "03", title: "Запчасти", href: "/parts", image: HOME_IMAGES.categories[2], active: true },
  { index: "04", title: "Сервис", href: "/service", image: HOME_IMAGES.categories[3] },
];

export function DirectionGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {directions.map((item) => (
        <Link
          key={item.index}
          href={item.href}
          aria-label={item.title}
          className={`group relative overflow-hidden border bg-[#0b0b0b] transition-all duration-300 hover:-translate-y-1 ${
            item.active ? "border-[#ff00c8]/60 shadow-[0_0_24px_rgba(255,0,200,0.2)]" : "border-white/10 hover:border-[#b8ff00]/40"
          }`}
        >
          <img src={item.image} alt={item.title} className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_56%,rgba(0,0,0,0.34)_100%)]" />
          <span className="sr-only">{item.title}</span>
        </Link>
      ))}
    </div>
  );
}
