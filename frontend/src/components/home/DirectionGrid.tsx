import Link from "next/link";

const directions = [
  {
    index: "01",
    title: "Питбайки",
    href: "/catalog",
    image: "https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=1000&q=80",
  },
  {
    index: "02",
    title: "Конфиг",
    href: "/configurator",
    image: "https://images.unsplash.com/photo-1531327431456-837da4b1d562?auto=format&fit=crop&w=1000&q=80",
  },
  {
    index: "03",
    title: "Запчасти",
    href: "/parts",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1000&q=80",
  },
  {
    index: "04",
    title: "Сервис",
    href: "/service",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1000&q=80",
  },
];

export function DirectionGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {directions.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className="group relative min-h-[300px] overflow-hidden border border-white/10 bg-[#0b0b0b] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#ff00e6] sm:min-h-[360px] sm:p-8 xl:min-h-[430px]"
        >
          <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover opacity-32 grayscale transition-all duration-500 group-hover:scale-105 group-hover:opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end">
            <div className="mb-4 font-mono text-xs font-black uppercase tracking-[0.28em] text-white/45 transition-colors group-hover:text-[#ff00e6] sm:mb-5 sm:tracking-[0.35em]">{item.index}</div>
            <h3 className="text-3xl font-black uppercase italic text-white transition-colors group-hover:text-[#ff00e6] sm:text-4xl">{item.title}</h3>
            <div className="mt-5 font-mono text-xs font-black uppercase tracking-[0.28em] text-white transition-colors group-hover:text-white sm:mt-6 sm:tracking-[0.35em] md:text-white/0">
              Смотреть ↗
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
