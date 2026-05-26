import Link from "next/link";
import { Bike, Cog, SlidersHorizontal, Wrench } from "lucide-react";

import { HOME_IMAGES } from "../../lib/config";

const directions = [
  {
    index: "01",
    title: "Питбайки",
    href: "/catalog",
    image: HOME_IMAGES.categories[0],
    Icon: Bike,
  },
  {
    index: "02",
    title: "Конфиг",
    href: "/configurator",
    image: HOME_IMAGES.categories[1],
    Icon: SlidersHorizontal,
  },
  {
    index: "03",
    title: "Запчасти",
    href: "/parts",
    image: HOME_IMAGES.categories[2],
    Icon: Wrench,
    active: true,
  },
  {
    index: "04",
    title: "Сервис",
    href: "/service",
    image: HOME_IMAGES.categories[3],
    Icon: Cog,
  },
];

export function DirectionGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {directions.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className={`group relative min-h-[260px] overflow-hidden border bg-[#0b0b0b] p-4 transition-all duration-300 hover:-translate-y-1 sm:min-h-[300px] sm:p-5 xl:min-h-[340px] ${
            item.active
              ? "border-[#ff00c8]/60 shadow-[0_0_24px_rgba(255,0,200,0.2)]"
              : "border-white/10 hover:border-[#b8ff00]/40"
          }`}
        >
          <img
            src={item.image}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover object-center opacity-62 saturate-50 contrast-110 brightness-75 grayscale transition-all duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.36)_0%,rgba(0,0,0,0.52)_38%,rgba(0,0,0,0.94)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(255,0,200,0.1)_0%,rgba(184,255,0,0)_55%)]" />

          <div className="relative z-10 flex h-full flex-col justify-end">
            <div className="mb-auto flex items-start justify-between">
              <span className="grid h-9 w-9 place-items-center rounded border border-[#b8ff00]/50 bg-black/50 text-[#b8ff00]">
                <item.Icon className="h-[18px] w-[18px]" />
              </span>
            </div>

            <h3 className="home-main-title mt-6 text-[2.05rem] leading-[0.9] tracking-[-0.02em] text-white sm:text-[2.5rem]">
              {item.title}
            </h3>

            <div className="mt-2 flex items-center justify-between">
              <div className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-white/70">{item.index}</div>
              <span className="grid h-9 w-9 place-items-center bg-[#b8ff00] text-xl font-black text-black transition-transform group-hover:translate-x-0.5">
                ↗
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
