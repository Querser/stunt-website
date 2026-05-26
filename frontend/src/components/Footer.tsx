"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteContacts } from "../lib/site";
import { BrandMark } from "./ui/BrandMark";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto grid max-w-[1700px] gap-12 px-6 py-16 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:px-12">
        <div>
          <BrandMark />
          <p className="mt-6 max-w-sm text-white/45">
            Витрина техники, конфигуратор стант-сборок и собственные детали Stunt Tech.
          </p>
        </div>

        <div>
          <h4 className="mb-5 font-mono text-xs font-black uppercase tracking-[0.35em] text-[#16d8ff]">Разделы</h4>
          <div className="space-y-3 text-sm font-black uppercase tracking-widest text-white/55">
            <Link className="block hover:text-white" href="/catalog">Каталог</Link>
            <Link className="block hover:text-white" href="/configurator">Конфигуратор</Link>
            <Link className="block hover:text-white" href="/parts">Запчасти</Link>
            <Link className="block hover:text-white" href="/service">Сервис</Link>
            <Link className="block hover:text-white" href="/garage">Гараж</Link>
          </div>
        </div>

        <div>
          <h4 className="mb-5 font-mono text-xs font-black uppercase tracking-[0.35em] text-[#ff00e6]">Связь</h4>
          <div className="space-y-3 text-sm font-black uppercase tracking-widest text-white/55">
            <div>{siteContacts.phonePrimary}</div>
            <div>{siteContacts.phoneSecondary}</div>
            <div>{siteContacts.email}</div>
            <div>{siteContacts.primaryAddress}</div>
          </div>
        </div>

        <div>
          <h4 className="mb-5 font-mono text-xs font-black uppercase tracking-[0.35em] text-white/40">Документы</h4>
          <div className="space-y-3 text-sm font-black uppercase tracking-widest text-white/55">
            <Link className="block hover:text-white" href="/privacy">Политика</Link>
            <Link className="block hover:text-white" href="/offer">Оферта</Link>
            <Link className="block hover:text-white" href="/delivery">Доставка и оплата</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6 md:px-12">
        <div className="mx-auto flex max-w-[1700px] flex-col gap-4 font-mono text-[10px] uppercase tracking-[0.35em] text-white/25 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Stunt Tech Core</span>
          <span>Stay tuned / stay wild</span>
          <span>Telegram · VKontakte · WhatsApp</span>
        </div>
      </div>
    </footer>
  );
}
