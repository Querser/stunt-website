"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ChevronDown, PackageSearch, Search } from "lucide-react";

import { api } from "../../lib/api";
import type { Part } from "../../lib/types";
import { buildPartGroups, getPartGroup, partSearchText, type PartGroupFilter } from "../../lib/partGroups";
import { ProductCard } from "../../components/ui/ProductCard";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { useCartStore } from "../../store/useCartStore";

function PartsContent() {
  const searchParams = useSearchParams();
  const [parts, setParts] = useState<Part[]>([]);
  const [activeGroup, setActiveGroup] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedPartName, setAddedPartName] = useState("");
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const groupMenuRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    api.parts().then(setParts).catch(() => setParts([]));
  }, []);

  const groups = useMemo<PartGroupFilter[]>(() => buildPartGroups(parts), [parts]);
  const activeGroupData = groups.find((group) => group.id === activeGroup) || groups[0];

  useEffect(() => {
    if (!isGroupMenuOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!groupMenuRef.current?.contains(event.target as Node)) {
        setIsGroupMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [isGroupMenuOpen]);

  useEffect(() => {
    const groupId = searchParams.get("group");
    if (!groupId || !parts.length) return;
    if (groups.some((group) => group.id === groupId)) {
      setActiveGroup(groupId);
      setActiveCategory("all");
    }
  }, [groups, parts.length, searchParams]);

  const scopedParts = useMemo(
    () => parts.filter((part) => activeGroup === "all" || getPartGroup(part).id === activeGroup),
    [activeGroup, parts],
  );

  const countsByCategory = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    scopedParts.forEach((part) => {
      const id = String(part.category.id);
      const current = counts.get(id);
      counts.set(id, {
        name: part.category.name,
        count: (current?.count || 0) + 1,
      });
    });
    return counts;
  }, [scopedParts]);

  const categories = useMemo<PartGroupFilter[]>(
    () => [
      { id: "all", name: activeGroup === "all" ? "Все категории" : "Все в разделе", count: scopedParts.length },
      ...Array.from(countsByCategory.entries())
        .map(([id, category]) => ({ id, name: category.name, count: category.count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru")),
    ],
    [activeGroup, countsByCategory, scopedParts.length],
  );

  useEffect(() => {
    if (!parts.length) return;
    const hasActiveCategory = categories.some((category) => category.id === activeCategory);
    if (!hasActiveCategory) {
      setActiveCategory("all");
    }
  }, [activeCategory, categories, parts.length]);

  const filtered = scopedParts
    .filter((part) => activeCategory === "all" || String(part.category.id) === activeCategory)
    .filter((part) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return partSearchText(part).includes(query);
    })
    .sort((a, b) => Number(b.in_stock) - Number(a.in_stock) || a.name.localeCompare(b.name, "ru"));

  const addPartToCart = (part: Part) => {
    if (!part.in_stock) return;

    addItem({
      id: `part-${part.id}`,
      kind: "part",
      title: part.name,
      subtitle: `Запчасть Stunt Tech / ${part.category.name}`,
      image_url: part.image_url,
      unit_price: part.price,
      quantity: 1,
      configuration: {
        order_type: "part",
        item_id: part.id,
        sku: part.sku || null,
        item_name: part.name,
        category: part.category.name,
        source: part.source || "local",
        source_url: part.source_url || null,
      },
    });

    setAddedPartName(part.name);
    window.setTimeout(() => setAddedPartName(""), 2200);
  };

  return (
    <main className="min-h-screen bg-[#050505] px-5 pb-20 pt-28 text-white sm:px-6 md:px-12 md:pb-28 md:pt-36">
      <div className="mx-auto max-w-[1700px]">
        <SectionTitle eyebrow="Stunt Tech Store" title="Каталог" accent="товаров">
          <div className="font-mono text-xs uppercase tracking-[0.35em] text-white/35">{parts.length} товаров</div>
        </SectionTitle>

        <div className="mt-8 border-y border-white/10 py-5">
          <div className="mb-3 hidden grid-cols-[minmax(260px,360px)_minmax(0,1fr)_minmax(280px,420px)] gap-4 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/30 xl:grid">
            <div className="text-[#16d8ff]">Раздел</div>
            <div>Категории</div>
            <div>Поиск</div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(260px,360px)_minmax(0,1fr)_minmax(280px,420px)] xl:items-center">
            <div ref={groupMenuRef} className="relative">
              <div className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#16d8ff] xl:hidden">
                Раздел
              </div>
              <button
                type="button"
                onClick={() => setIsGroupMenuOpen((value) => !value)}
                className={`flex h-16 w-full items-center justify-between border bg-[#101010] px-5 text-left transition-colors ${
                  isGroupMenuOpen ? "border-[#ff00e6] text-white" : "border-white/10 text-white hover:border-[#16d8ff]/55"
                }`}
              >
                <span className="min-w-0 truncate text-xl font-black uppercase italic leading-none">
                  {activeGroupData?.name || "Все товары"} / {activeGroupData?.count || 0}
                </span>
                <ChevronDown className={`ml-4 h-5 w-5 shrink-0 text-[#16d8ff] transition-transform ${isGroupMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isGroupMenuOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[420px] overflow-y-auto border border-[#ff00e6]/70 bg-[#090909] p-2 shadow-[0_24px_80px_rgba(255,0,230,0.22)]">
                  {groups.map((group) => {
                    const isActive = group.id === activeGroup;
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => {
                          setActiveGroup(group.id);
                          setActiveCategory("all");
                          setIsGroupMenuOpen(false);
                        }}
                        className={`flex min-h-12 w-full items-center gap-3 px-3 text-left text-lg font-black uppercase italic transition-colors ${
                          isActive ? "bg-[#ff00e6]/14 text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        <Check className={`h-4 w-4 shrink-0 ${isActive ? "text-[#ff00e6]" : "text-transparent"}`} />
                        <span className="min-w-0 flex-1 truncate">{group.name}</span>
                        <span className="font-mono text-[10px] not-italic tracking-[0.22em] text-[#16d8ff]">{group.count} шт.</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/30 xl:hidden">
                Категории
              </div>
              <div className="flex h-16 items-center gap-3 overflow-x-auto border border-white/10 bg-[#080808] px-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`h-10 shrink-0 border px-4 font-mono text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${
                      activeCategory === category.id
                        ? "border-[#16d8ff] bg-[#16d8ff]/10 text-[#16d8ff]"
                        : "border-white/10 bg-[#0d0d0d] text-white/45 hover:border-[#16d8ff]/60 hover:text-white"
                    }`}
                  >
                    {category.name} / {category.count}
                  </button>
                ))}
              </div>
            </div>

            <label className="relative w-full">
              <div className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/30 xl:hidden">
                Поиск
              </div>
              <Search className="absolute bottom-5 left-4 h-5 w-5 text-white/30 xl:bottom-auto xl:top-1/2 xl:-translate-y-1/2" />
              <input
                value={searchQuery}
                onFocus={() => setIsGroupMenuOpen(false)}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Поиск по разделу"
                className="h-16 w-full border border-white/10 bg-[#101010] pl-12 pr-4 font-mono text-xs uppercase tracking-[0.18em] text-white outline-none placeholder:text-white/25 focus:border-[#16d8ff]"
              />
            </label>
          </div>

          <div className="mt-4 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
            {categories.find((category) => category.id === activeCategory)?.name || "Все категории"} / {filtered.length} товаров
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-12 grid min-h-80 place-items-center border border-white/10 bg-[#0d0d0d] text-center">
            <div>
              <PackageSearch className="mx-auto mb-5 h-12 w-12 text-white/25" />
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-white/35">В этом разделе пока пусто</p>
            </div>
          </div>
        ) : (
          <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {filtered.map((part) => (
              <ProductCard
                key={part.id}
                onClick={() => addPartToCart(part)}
                image={part.image_url}
                label={part.category.name}
                title={part.name}
                price={part.price}
                muted={!part.in_stock}
              />
            ))}
          </div>
        )}
      </div>

      {addedPartName && (
        <div className="fixed bottom-5 left-5 right-5 z-[70] border border-[#16d8ff]/40 bg-[#071014] p-4 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#16d8ff] shadow-[0_0_40px_rgba(22,216,255,0.16)] sm:left-auto sm:right-6 sm:w-[380px]">
          Добавлено в корзину: {addedPartName}
        </div>
      )}
    </main>
  );
}

export default function PartsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050505] px-5 pb-20 pt-28 text-white sm:px-6 md:px-12 md:pb-28 md:pt-36" />}>
      <PartsContent />
    </Suspense>
  );
}
