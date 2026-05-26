"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { api } from "../lib/api";
import { getMainImage } from "../lib/format";
import type { Bike, Part } from "../lib/types";
import { DirectionGrid } from "../components/home/DirectionGrid";
import { HomeHero } from "../components/home/HomeHero";
import { ServiceBand } from "../components/home/ServiceBand";
import { StoryBlock } from "../components/home/StoryBlock";
import { ProductCard } from "../components/ui/ProductCard";
import { SectionTitle } from "../components/ui/SectionTitle";

export default function HomePage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [activeTab, setActiveTab] = useState<"BIKES" | "PARTS">("BIKES");

  useEffect(() => {
    Promise.all([api.bikes(), api.parts()])
      .then(([bikeData, partData]) => {
        setBikes(bikeData);
        setParts(partData);
      })
      .catch(() => {
        setBikes([]);
        setParts([]);
      });
  }, []);

  const selection = useMemo(() => {
    if (activeTab === "PARTS") {
      return [...parts].sort((a, b) => Number(b.in_stock) - Number(a.in_stock) || a.name.localeCompare(b.name, "ru")).slice(0, 6).map((part) => ({
        id: `part-${part.id}`,
        href: "/parts",
        image: part.image_url,
        label: part.category.name,
        title: part.name,
        price: part.price,
        muted: !part.in_stock,
      }));
    }

    return [...bikes].sort((a, b) => Number(b.in_stock) - Number(a.in_stock) || a.name.localeCompare(b.name, "ru")).slice(0, 6).map((bike) => ({
      id: `bike-${bike.id}`,
      href: `/catalog/${bike.id}`,
      image: getMainImage(bike.images),
      label: bike.bike_type === "PITBIKE" ? "Pitbikes" : bike.has_pts ? "Байки с ПТС" : "Stunt Bikes",
      title: bike.name,
      price: bike.price,
      muted: !bike.in_stock,
      badge: bike.has_pts ? "ПТС" : undefined,
    }));
  }, [activeTab, bikes, parts]);

  return (
    <main className="bg-[#050505] text-white">
      <HomeHero />

      <section className="mx-auto max-w-[1700px] px-5 py-16 sm:px-6 sm:py-20 md:px-12 md:py-28">
        <SectionTitle eyebrow="Top categories" title="Топовые" accent="направления">
          <Link href="/catalog" className="font-mono text-xs font-black uppercase tracking-[0.35em] text-white/45 underline decoration-white/25 underline-offset-8 transition-colors hover:text-white">
            Все категории
          </Link>
        </SectionTitle>
        <div className="mt-9 sm:mt-12 md:mt-14">
          <DirectionGrid />
        </div>
      </section>

      <section className="mx-auto max-w-[1700px] px-5 py-16 sm:px-6 sm:py-20 md:px-12">
        <div className="mb-9 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-8">
          <SectionTitle eyebrow="Hits" title="Top gear" accent="selection" />
          <div className="flex gap-6 font-mono text-xs font-black uppercase tracking-[0.2em] sm:gap-8 sm:tracking-[0.28em]">
            {(["BIKES", "PARTS"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b pb-3 transition-colors ${activeTab === tab ? "border-[#16d8ff] text-white" : "border-white/15 text-white/35 hover:text-white"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
          {selection.map((item) => (
            <ProductCard key={item.id} {...item} />
          ))}
        </div>

        <div className="mt-14 text-center sm:mt-20">
          <Link href={activeTab === "BIKES" ? "/catalog" : "/parts"} className="inline-block border-b-4 border-[#ff00e6] px-4 pb-3 text-lg font-black uppercase italic tracking-[0.12em] text-white transition-colors hover:text-[#ff00e6] sm:px-8 sm:text-2xl sm:tracking-[0.22em]">
            Смотреть весь каталог
          </Link>
        </div>
      </section>

      <ServiceBand />
      <StoryBlock />
    </main>
  );
}
