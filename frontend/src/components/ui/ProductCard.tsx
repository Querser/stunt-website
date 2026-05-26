import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { formatPrice } from "../../lib/format";

export function ProductCard({
  href,
  onClick,
  image,
  label,
  title,
  price,
  badge,
  muted,
}: {
  href?: string;
  onClick?: () => void;
  image: string;
  label: string;
  title: string;
  price: number;
  badge?: string;
  muted?: boolean;
}) {
  const content = (
    <article
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={`group h-full border border-white/10 bg-[#0d0d0d] p-4 transition-all duration-300 sm:p-5 ${onClick ? "cursor-pointer text-left" : ""} ${muted ? "opacity-45 grayscale" : "hover:-translate-y-1 hover:border-[#16d8ff]"}`}
    >
      <div className="-mx-4 -mt-4 mb-4 h-[3px] origin-left scale-x-0 bg-[#ff00e6] transition-transform duration-300 group-hover:scale-x-100 sm:-mx-5 sm:-mt-5 sm:mb-5" />
      <div className="relative mb-5 aspect-[4/3] overflow-hidden bg-black sm:mb-7">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover opacity-75 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100" />
        ) : (
          <div className="grid h-full place-items-center px-4 text-center font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/20">
            Фото пока не загружено
          </div>
        )}
        {badge && <span className="absolute right-3 top-3 bg-[#ff00e6] px-3 py-1 text-xs font-black uppercase tracking-widest text-white sm:right-4 sm:top-4">{badge}</span>}
      </div>
      <div className="mb-3 truncate font-mono text-[10px] uppercase tracking-[0.24em] text-white/40 sm:mb-4 sm:text-xs sm:tracking-[0.35em]">{label}</div>
      <h3 className="min-h-[4.6rem] overflow-hidden text-xl font-black uppercase leading-tight text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] [overflow-wrap:anywhere] group-hover:text-[#16d8ff] sm:text-2xl">
        {title}
      </h3>
      <div className="mt-6 flex items-end justify-between gap-4 sm:mt-8">
        <div className="whitespace-nowrap font-mono text-xl font-black text-[#16d8ff] sm:text-3xl">{formatPrice(price)}</div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/10 text-white/40 transition-colors group-hover:border-[#ff00e6] group-hover:text-[#ff00e6]">
          <ShoppingBag className="h-5 w-5" />
        </div>
      </div>
    </article>
  );

  if (onClick) return content;
  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
