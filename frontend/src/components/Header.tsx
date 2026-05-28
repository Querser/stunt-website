"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";

import { api } from "../lib/api";
import { buildPartGroups, PART_GROUPS } from "../lib/partGroups";
import type { Part } from "../lib/types";
import { BrandMark } from "./ui/BrandMark";
import { useCartStore } from "../store/useCartStore";

const defaultLinks = [
  { name: "Каталог", href: "/catalog" },
  { name: "Конфигуратор", href: "/configurator" },
  { name: "Запчасти", href: "/parts" },
  { name: "Сервис", href: "/service" },
  { name: "Гараж", href: "/garage" },
];

const homeLinks = [
  { name: "Питбайки", href: "/catalog" },
  { name: "Конфиг", href: "/configurator" },
  { name: "Запчасти", href: "/parts" },
  { name: "Сервис", href: "/service" },
  { name: "О нас", href: "/garage" },
  { name: "Контакты", href: "/contacts" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [partsMenuOpen, setPartsMenuOpen] = useState(false);
  const [partsMenuRequested, setPartsMenuRequested] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const cartCount = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));
  const isHome = pathname === "/";
  const navLinks = isHome ? homeLinks : defaultLinks;

  const partGroups = useMemo(
    () =>
      parts.length
        ? buildPartGroups(parts)
        : [{ id: "all", name: "Все товары", count: 0 }, ...PART_GROUPS.map((group) => ({ id: group.id, name: group.name, count: 0 }))],
    [parts],
  );

  const openPartsMenu = () => {
    setPartsMenuOpen(true);
    if (partsMenuRequested) return;
    setPartsMenuRequested(true);
    api.parts().then(setParts).catch(() => setParts([]));
  };

  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 border-b ${isHome ? "border-white/10 bg-[#050505]/86 backdrop-blur-md" : "border-white/10 bg-[#120c15]/70 backdrop-blur-xl"}`}
      onMouseLeave={() => setPartsMenuOpen(false)}
    >
      <div className="mx-auto flex h-[72px] max-w-[1700px] items-center justify-between px-5 sm:px-6 md:h-[84px] md:px-12">
        {isHome ? (
          <Link href="/" className="home-logo">
            <span className="home-logo-stunt">STUNT</span>
            <span className="home-logo-tech">TECH</span>
          </Link>
        ) : (
          <BrandMark />
        )}

        <nav className={`hidden items-center ${isHome ? "gap-7 xl:flex" : "gap-12 lg:flex"}`}>
          {navLinks.map((link) =>
            link.href === "/parts" ? (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={openPartsMenu}
                onFocus={openPartsMenu}
                className={`${isHome ? "text-[12px] tracking-[0.1em]" : "font-mono text-sm tracking-[0.22em]"} font-black uppercase transition-colors ${
                  pathname === link.href
                    ? isHome
                      ? "text-[#b8ff00]"
                      : "text-[#16d8ff]"
                    : isHome
                      ? "text-white/85 hover:text-[#b8ff00]"
                      : "text-white/80 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setPartsMenuOpen(false)}
                className={`${isHome ? "text-[12px] tracking-[0.1em]" : "font-mono text-sm tracking-[0.22em]"} font-black uppercase transition-colors ${
                  pathname === link.href
                    ? isHome
                      ? "text-[#b8ff00]"
                      : "text-[#16d8ff]"
                    : isHome
                      ? "text-white/85 hover:text-[#b8ff00]"
                      : "text-white/80 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3 text-white sm:gap-5">
          <Link
            href="/catalog"
            aria-label="Поиск по каталогу"
            className={`hidden transition-opacity hover:opacity-100 md:block ${isHome ? "opacity-90" : "opacity-85"}`}
          >
            <Search className="h-6 w-6" />
          </Link>
          <Link
            href="/cart"
            aria-label="Корзина"
            className={`relative opacity-85 transition-opacity hover:opacity-100 ${pathname === "/cart" ? (isHome ? "text-[#b8ff00]" : "text-[#16d8ff]") : ""}`}
          >
            <ShoppingBag className="h-6 w-6" />
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center bg-[#ff00c8] px-1 text-[10px] font-black text-white">
                {cartCount}
              </span>
            ) : (
              isHome && <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-[#ff00c8]" />
            )}
          </Link>
          <Link href="/garage" aria-label="Гараж и контакты" className="hidden opacity-85 transition-opacity hover:opacity-100 md:block">
            <UserRound className="h-6 w-6" />
          </Link>

          {isHome && (
            <Link
              href="/configurator"
              className="hidden min-h-[44px] items-center border border-[#ff00c8] px-6 text-[11px] font-extrabold uppercase tracking-[0.13em] text-white transition-all hover:shadow-[0_0_20px_rgba(255,0,200,0.35)] xl:inline-flex"
            >
              Подобрать байк
            </Link>
          )}

          <button
            aria-label={menuOpen ? "Закрыть меню" : "Меню"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            className={`grid h-10 w-10 place-items-center border text-white/80 transition-colors sm:h-11 sm:w-11 lg:hidden ${
              isHome ? "border-[#b8ff00]/40 hover:border-[#ff00c8] hover:text-white" : "border-white/10 hover:border-[#ff00e6] hover:text-white"
            }`}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {partsMenuOpen && (
        <div className="hidden border-t border-white/10 bg-[#050505]/98 shadow-[0_28px_80px_rgba(0,0,0,0.55)] lg:block">
          <div className="mx-auto max-w-[1700px] px-12 py-6">
            <div className="mb-4 flex items-center justify-between gap-6">
              <div className={`flex items-center gap-4 font-mono text-[10px] font-black uppercase tracking-[0.34em] ${isHome ? "text-[#b8ff00]" : "text-[#16d8ff]"}`}>
                <span className={`h-px w-12 ${isHome ? "bg-[#b8ff00]" : "bg-[#16d8ff]"}`} />
                Разделы запчастей
              </div>
              <Link href="/parts" className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/45 transition-colors hover:text-white">
                Все товары
              </Link>
            </div>
            <div className="grid gap-3 xl:grid-cols-5">
              {partGroups.map((group) => (
                <Link
                  key={group.id}
                  href={group.id === "all" ? "/parts" : `/parts?group=${group.id}`}
                  onClick={() => setPartsMenuOpen(false)}
                  className={`group relative min-h-[96px] overflow-hidden border border-white/10 bg-[#0d0d0d] p-4 transition-all hover:-translate-y-0.5 ${
                    isHome ? "hover:border-[#ff00c8] hover:bg-[#1b061a]" : "hover:border-[#ff00e6] hover:bg-[#1b061a]"
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
                      isHome ? "bg-[#ff00c8]" : "bg-[#ff00e6]"
                    }`}
                  />
                  <div className="text-xl font-black uppercase italic leading-tight text-white/70 transition-colors group-hover:text-white">
                    {group.name}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className={`font-mono text-[10px] font-black uppercase tracking-[0.26em] ${isHome ? "text-[#b8ff00]" : "text-[#16d8ff]"}`}>
                      {group.count ? `${group.count} шт.` : "Раздел"}
                    </span>
                    <span className="font-mono text-[9px] font-black uppercase tracking-[0.22em] text-white/0 transition-colors group-hover:text-white/55">
                      Смотреть
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {menuOpen && (
        <nav className="border-t border-white/10 bg-[#080808]/95 px-5 py-4 sm:px-6 sm:py-5 lg:hidden">
          <div className="grid gap-2">
            {(isHome ? homeLinks : defaultLinks).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`border px-4 py-3.5 text-xs font-black uppercase tracking-[0.16em] transition-colors sm:px-5 sm:py-4 sm:tracking-[0.22em] ${
                  pathname === link.href
                    ? isHome
                      ? "border-[#b8ff00] bg-[#b8ff00] text-black"
                      : "border-[#16d8ff] bg-[#16d8ff] text-black"
                    : isHome
                      ? "border-white/10 bg-white/[0.03] text-white/70 hover:border-[#ff00c8] hover:text-white"
                      : "border-white/10 bg-white/[0.03] text-white/70 hover:border-[#ff00e6] hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className={`border px-4 py-3.5 text-xs font-black uppercase tracking-[0.16em] transition-colors sm:px-5 sm:py-4 sm:tracking-[0.22em] ${
                pathname === "/cart"
                  ? isHome
                    ? "border-[#b8ff00] bg-[#b8ff00] text-black"
                    : "border-[#16d8ff] bg-[#16d8ff] text-black"
                  : isHome
                    ? "border-white/10 bg-white/[0.03] text-white/70 hover:border-[#ff00c8] hover:text-white"
                    : "border-white/10 bg-white/[0.03] text-white/70 hover:border-[#ff00e6] hover:text-white"
              }`}
            >
              Корзина{cartCount > 0 ? ` / ${cartCount}` : ""}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
