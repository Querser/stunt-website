"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { AlertTriangle, ArrowLeft, ShoppingBag, Wrench } from "lucide-react";
import { useConfiguratorStore } from "../../../store/useConfiguratorStore";
import { useCartStore } from "../../../store/useCartStore";
import { api } from "../../../lib/api";
import { formatPrice, getMainImage } from "../../../lib/format";
import type { Bike, PitConfig } from "../../../lib/types";

const defaultPitConfigs: PitConfig[] = [
  { name: "Lite", wheels: "12/12", price_add: 0 },
  { name: "Lite", wheels: "14/14", price_add: 5000 },
  { name: "Pro", wheels: "12/12", price_add: 15000 },
];

export default function BikeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const setBike = useConfiguratorStore((state) => state.setBike);
  const addItem = useCartStore((state) => state.addItem);
  const [bike, setBikeData] = useState<Bike | null>(null);
  const [activeImage, setActiveImage] = useState("");
  const [selectedConfig, setSelectedConfig] = useState(defaultPitConfigs[0]);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    api.bike(String(id))
      .then((data) => {
        setBikeData(data);
        setActiveImage(getMainImage(data.images));
        if (data.pit_configs?.length) setSelectedConfig(data.pit_configs[0]);
      })
      .catch(() => setBikeData(null));
  }, [id]);

  if (!bike) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#00D4FF] font-mono animate-pulse">Загрузка...</div>;

  const gallery = bike.images?.length ? bike.images : [{ image_url: "https://picsum.photos/1200/800", is_main: true }];
  const mainImage = activeImage || gallery.find((i) => i.is_main)?.image_url || gallery[0]?.image_url;
  const pitConfigs = bike.pit_configs?.length ? bike.pit_configs : defaultPitConfigs;
  const currentPrice = bike.bike_type === "PITBIKE" ? bike.price + (selectedConfig.price_add || 0) : bike.price;

  const handleConfiguratorRedirect = () => {
    setBike(bike);
    router.push('/configurator');
  };

  const addPitbikeToCart = () => {
    if (!bike.in_stock) return;

    addItem({
      id: `pitbike-${bike.id}-${selectedConfig.name}-${selectedConfig.wheels}`,
      kind: "pitbike",
      title: bike.name,
      subtitle: `${selectedConfig.name} / колеса ${selectedConfig.wheels}`,
      image_url: mainImage,
      unit_price: currentPrice,
      quantity: 1,
      configuration: {
        order_type: "pitbike",
        bike_id: bike.id,
        bike: bike.name,
        pit_config: selectedConfig.name,
        wheels: selectedConfig.wheels,
        base_price: bike.price,
        price_add: selectedConfig.price_add || 0,
      },
    });

    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 2200);
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-20 pt-24 font-sans text-white md:pb-32 md:pt-28">
      <main className="mx-auto max-w-7xl px-5 sm:px-6 md:px-10">
        <button onClick={() => router.push('/catalog')} className="mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-white/50 transition-colors hover:text-[#00D4FF] sm:text-sm sm:tracking-widest">
          <ArrowLeft className="w-4 h-4" /> В каталог
        </button>

        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="relative aspect-[4/3] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] lg:sticky lg:top-28">
            <img src={mainImage} alt={bike.name} className={`w-full h-full object-cover ${!bike.in_stock && 'grayscale opacity-50'}`} />
            {bike.has_pts && <div className="absolute right-3 top-3 bg-[#00D4FF] px-3 py-1 text-xs font-black uppercase tracking-widest text-black sm:right-4 sm:top-4 sm:px-4">ПТС</div>}
            {!bike.in_stock && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><span className="rotate-[-15deg] border-2 border-red-500 bg-black/50 px-4 py-2 text-lg font-black uppercase tracking-[0.16em] text-red-500 backdrop-blur-sm sm:px-6 sm:text-2xl sm:tracking-widest">Нет в наличии</span></div>}
          </motion.div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3 lg:col-start-1 lg:row-start-2">
              {gallery.map((image) => (
                <button
                  key={image.image_url}
                  onClick={() => setActiveImage(image.image_url)}
                  className={`aspect-[4/3] overflow-hidden border transition-all ${activeImage === image.image_url ? "border-[#00D4FF]" : "border-white/10 opacity-60 hover:opacity-100"}`}
                >
                  <img src={image.image_url} alt={`${bike.name} фото`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <div>
            <div className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-[#00D4FF] sm:text-sm sm:tracking-[0.3em]">
              {bike.bike_type === "PITBIKE" ? "Питбайк" : "Стант-Байк"}
            </div>
            <h1 className="st-display break-words pr-[0.22em] text-[clamp(2.6rem,10vw,4.6rem)] font-black uppercase italic leading-[0.95]">{bike.name}</h1>
            <p className="mt-5 leading-7 text-white/50 sm:mt-6 sm:leading-relaxed">{bike.description || "Байк полностью подготовлен к раздаче."}</p>
          </div>

          {bike.specs && (
             <div className="border border-white/5 bg-[#111] p-5 sm:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/50"><Wrench className="w-4 h-4"/> Характеристики</h3>
                <ul className="space-y-2">
                  {bike.specs.split('\n').map((line: string, i: number) => {
                    const [key, ...rest] = line.split(':');
                    const val = rest.join(':').trim();
                    return (
                      <li key={i} className="grid gap-1 border-b border-white/5 pb-2 text-sm last:border-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
                        <span className="text-white/40">{key}</span>
                        <span className="font-bold sm:text-right">{val}</span>
                      </li>
                    );
                  })}
                  {bike.bike_type === "BIG_BIKE" && (
                     <li className="grid gap-1 border-b border-white/5 pb-2 text-sm text-[#00D4FF] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
                       <span className="opacity-80">Колеса (Стант)</span><span className="font-bold sm:text-right">17 / 17</span>
                     </li>
                  )}
                </ul>
             </div>
          )}

          {bike.bike_type === "PITBIKE" ? (
            <div className="space-y-6 border border-white/10 bg-[#0A0A0A] p-5 sm:p-8">
              <h3 className="text-base font-black uppercase tracking-[0.16em] sm:text-lg sm:tracking-widest">Выбор комплектации</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {pitConfigs.map(cfg => (
                  <button key={cfg.name + cfg.wheels} onClick={() => setSelectedConfig(cfg)} disabled={!bike.in_stock}
                    className={`flex flex-col items-center gap-2 border p-4 transition-all
                      ${!bike.in_stock ? 'opacity-50 cursor-not-allowed' : ''}
                      ${selectedConfig === cfg ? 'border-[#FF00FF] bg-[#FF00FF]/10 text-white shadow-[0_0_20px_rgba(255,0,255,0.2)]' : 'border-white/10 text-white/50 hover:border-white/30 hover:bg-white/5'}`}
                  >
                    <span className="font-black uppercase tracking-widest text-lg">{cfg.name}</span>
                    <span className="border border-white/10 bg-black/50 px-3 py-1 font-mono text-xs">Колеса {cfg.wheels}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="mb-4 whitespace-nowrap font-mono text-3xl font-black text-[#00D4FF] drop-shadow-[0_0_10px_rgba(0,212,255,0.3)] sm:text-4xl">{formatPrice(currentPrice)}</div>
                <button
                  disabled={!bike.in_stock}
                  onClick={addPitbikeToCart}
                  className="flex w-full items-center justify-center gap-3 bg-white px-5 py-4 font-black uppercase tracking-[0.14em] text-black transition-all hover:bg-[#FF00FF] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:py-5 sm:tracking-widest"
                >
                  {bike.in_stock && <ShoppingBag className="h-5 w-5" />}
                  {bike.in_stock ? "Добавить в корзину" : "Нет в наличии"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 border border-white/10 bg-[#0A0A0A] p-5 text-center sm:p-8">
              <AlertTriangle className="w-10 h-10 text-[#00D4FF] mx-auto mb-4" />
              <h3 className="text-xl font-black uppercase italic">Этот байк доступен в конфигураторе</h3>
              <p className="text-sm text-white/50">Выбери графику, добавь бугель и дублер прямо сейчас.</p>
              <div className="mb-6 whitespace-nowrap font-mono text-2xl font-black text-white sm:text-3xl">База: {formatPrice(bike.price)}</div>

              <button onClick={handleConfiguratorRedirect} disabled={!bike.in_stock} className="w-full bg-[#00D4FF] px-5 py-4 font-black uppercase tracking-[0.14em] text-black shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:py-5 sm:tracking-widest">
                {bike.in_stock ? "Перейти к сборке" : "Нет в наличии"}
              </button>
            </div>
          )}
        </motion.div>
        </div>
      </main>
      {addedToCart && (
        <div className="fixed bottom-5 left-5 right-5 z-[70] border border-[#16d8ff]/40 bg-[#071014] p-4 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#16d8ff] shadow-[0_0_40px_rgba(22,216,255,0.16)] sm:left-auto sm:right-6 sm:w-[380px]">
          Питбайк добавлен в корзину
        </div>
      )}
    </div>
  );
}
