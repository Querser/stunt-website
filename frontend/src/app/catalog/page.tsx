"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "../../lib/api";
import { getMainImage } from "../../lib/format";
import type { Bike, BikeType } from "../../lib/types";
import { ProductCard } from "../../components/ui/ProductCard";
import { SectionTitle } from "../../components/ui/SectionTitle";

type Filter = "ALL" | BikeType;

const filters: { id: Filter; label: string }[] = [
  { id: "ALL", label: "Все модели" },
  { id: "PITBIKE", label: "Питбайки" },
  { id: "BIG_BIKE", label: "Большие байки" },
];

export default function CatalogPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");

  useEffect(() => {
    api.bikes().then(setBikes).catch(() => setBikes([]));
  }, []);

  const filtered = useMemo(
    () =>
      bikes
        .filter((bike) => filter === "ALL" || bike.bike_type === filter)
        .sort((a, b) => Number(b.in_stock) - Number(a.in_stock) || a.name.localeCompare(b.name, "ru")),
    [bikes, filter],
  );

  return (
    <main className="min-h-screen bg-[#050505] px-5 pb-20 pt-28 text-white sm:px-6 md:px-12 md:pb-28 md:pt-36">
      <div className="mx-auto max-w-[1700px]">
        <SectionTitle eyebrow="Garage selection" title="Каталог" accent="техники">
          <div className="font-mono text-xs uppercase tracking-[0.35em] text-white/35">{filtered.length} позиций</div>
        </SectionTitle>

        <div className="mt-8 flex gap-3 overflow-x-auto pb-2 sm:mt-10">
          {filters.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`whitespace-nowrap border px-5 py-4 font-mono text-[10px] font-black uppercase tracking-[0.22em] transition-colors sm:px-6 sm:text-xs sm:tracking-[0.28em] ${
                filter === item.id ? "border-[#16d8ff] bg-[#16d8ff] text-black" : "border-white/10 bg-[#0d0d0d] text-white/45 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((bike) => (
            <ProductCard
              key={bike.id}
              href={`/catalog/${bike.id}`}
              image={getMainImage(bike.images)}
              label={bike.bike_type === "PITBIKE" ? "Питбайк" : bike.has_pts ? "Stunt / ПТС" : "Stunt / Без ПТС"}
              title={bike.name}
              price={bike.price}
              badge={bike.has_pts ? "ПТС" : undefined}
              muted={!bike.in_stock}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
