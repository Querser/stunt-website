import Link from "next/link";

import { DirectionGrid } from "../components/home/DirectionGrid";
import { HomeHero } from "../components/home/HomeHero";
import { ServiceBand } from "../components/home/ServiceBand";
import { StoryBlock } from "../components/home/StoryBlock";

export default function HomePage() {
  return (
    <main className="homePage bg-[#030303] text-[#f5f5f5]">
      <HomeHero />

      <section className="border-b border-white/10 bg-[#070707]">
        <div className="homePage-container py-14 sm:py-16 md:py-20">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="home-main-title text-[clamp(1.95rem,9.2vw,5.8rem)] leading-[0.9] tracking-[-0.02em] text-white sm:text-[clamp(2.8rem,8vw,5.8rem)]">
              <span className="block">Топовые</span>
              <span className="block text-[#b8ff00]">направления</span>
            </h2>
            <Link
              href="/catalog"
              className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/72 transition-colors hover:text-[#b8ff00] sm:mt-4"
            >
              Все категории ↗
            </Link>
          </div>
          <DirectionGrid />
        </div>
      </section>

      <ServiceBand />
      <StoryBlock />
    </main>
  );
}
