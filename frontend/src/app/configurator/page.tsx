"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, PaintBucket, ShoppingBag, X } from "lucide-react";

import { api } from "../../lib/api";
import { formatPrice, getMainImage } from "../../lib/format";
import type { Accessory, Bike, GraphicOption } from "../../lib/types";
import { BikePreview } from "../../components/configurator/BikePreview";
import { ConfigSummary } from "../../components/configurator/ConfigSummary";
import { StepHeader } from "../../components/configurator/StepHeader";
import { useCartStore } from "../../store/useCartStore";
import { useConfiguratorStore } from "../../store/useConfiguratorStore";

const steps = ["База", "Графика", "Допы", "Корзина"];

export default function ConfiguratorPage() {
  const {
    step,
    setStep,
    selectedBike,
    setBike,
    selectedGraphic,
    setGraphic,
    isCustomGraphic,
    setCustomGraphic,
    selectedAccessories,
    toggleAccessory,
    getTotalPrice,
    resetConfigurator,
  } = useConfiguratorStore();
  const addItem = useCartStore((state) => state.addItem);

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [graphics, setGraphics] = useState<GraphicOption[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [activeAccessory, setActiveAccessory] = useState<Accessory | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const configTopRef = useRef<HTMLDivElement | null>(null);
  const optionsPanelRef = useRef<HTMLDivElement | null>(null);

  const moveToStep = (nextStep: number) => {
    setStep(nextStep);
    requestAnimationFrame(() => {
      configTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      optionsPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const selectBike = (bike: Bike) => {
    setBike(bike);
    requestAnimationFrame(() => {
      configTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      optionsPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  useEffect(() => {
    api.bigBikes()
      .then((data) => setBikes([...data].sort((a, b) => Number(b.in_stock) - Number(a.in_stock) || a.name.localeCompare(b.name, "ru"))))
      .catch(() => setBikes([]));
  }, []);

  useEffect(() => {
    if (!selectedBike?.frame_type_id) return;
    Promise.all([api.graphics(selectedBike.frame_type_id), api.accessories()])
      .then(([graphicData, accessoryData]) => {
        setGraphics(graphicData);
        setAccessories(accessoryData);
      })
      .catch(() => {
        setGraphics([]);
        setAccessories([]);
      });
  }, [selectedBike]);

  const total = getTotalPrice();
  const currentStepLabel = steps[step - 1] || "База";

  const canContinue = useMemo(() => {
    if (step === 1) return !!selectedBike;
    return !!selectedBike;
  }, [selectedBike, step]);

  const addConfigurationToCart = () => {
    if (!selectedBike) return;

    const accessoryIds = selectedAccessories.map((item) => item.id).sort((a, b) => a - b).join("-");
    const graphicToken = isCustomGraphic ? "custom" : selectedGraphic?.id || "stock";
    const graphicTitle = isCustomGraphic ? "Индивидуальный дизайн" : selectedGraphic?.name || "Сток";

    addItem({
      id: `config-${selectedBike.id}-${graphicToken}-${accessoryIds || "no-accessories"}`,
      kind: "bike_configurator",
      title: selectedBike.name,
      subtitle: `${graphicTitle} / ${selectedAccessories.length ? `${selectedAccessories.length} доп.` : "без допов"}`,
      image_url: getMainImage(selectedBike.images),
      unit_price: total,
      quantity: 1,
      configuration: {
        order_type: "bike_configurator",
        bike_id: selectedBike.id,
        bike: selectedBike.name,
        base_price: selectedBike.price,
        graphic_id: selectedGraphic?.id || null,
        graphic: graphicTitle,
        is_custom_graphic: isCustomGraphic,
        accessories: selectedAccessories.map((item) => item.name),
        accessory_items: selectedAccessories.map((item) => ({ id: item.id, name: item.name, price: item.price })),
      },
    });

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050505] px-6 pt-32 text-center text-white">
        <div className="max-w-2xl">
          <div className="font-mono text-xs font-black uppercase tracking-[0.45em] text-[#16d8ff]">Added to cart</div>
          <h1 className="st-display mt-6 text-6xl font-black uppercase italic md:text-8xl">
            Сборка <span className="text-[#ff00e6]">в корзине</span>
          </h1>
          <p className="mx-auto mt-8 max-w-lg text-lg leading-8 text-white/55">
            Конфигурация сохранена. Можно добавить запчасти или сразу отправить заявку из корзины.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/cart" className="bg-white px-9 py-5 font-black uppercase tracking-[0.18em] text-black shadow-[6px_6px_0_#16d8ff]">
              В корзину
            </Link>
            <button
              onClick={() => {
                resetConfigurator();
                setIsSuccess(false);
              }}
              className="border border-white/15 px-9 py-5 font-black uppercase tracking-[0.18em] text-white/70 hover:border-[#ff00e6] hover:text-white"
            >
              Собрать ещё
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] pt-20 text-white md:pt-24 xl:h-[100svh] xl:overflow-hidden">
      <div ref={configTopRef} className="mx-auto flex max-w-[1700px] scroll-mt-28 flex-col px-5 py-5 sm:px-6 md:px-12 xl:h-[calc(100svh-6rem)] xl:py-4">
        <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 xl:mb-5">
          <div className="flex items-center gap-4">
            {step > 1 && (
              <button onClick={() => moveToStep(step - 1)} className="grid h-11 w-11 place-items-center border border-white/10 text-white/60 hover:border-[#ff00e6] hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35 sm:text-xs sm:tracking-[0.35em]">Configurator</div>
              <div className="mt-1 text-lg font-black uppercase italic sm:text-2xl xl:text-xl">Step 0{step} / {currentStepLabel}</div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {steps.map((label, index) => (
              <button
                key={label}
                onClick={() => selectedBike && moveToStep(index + 1)}
                className={`h-2 transition-all ${step >= index + 1 ? "w-12 bg-[#16d8ff]" : "w-6 bg-white/10"}`}
                aria-label={label}
              />
            ))}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(390px,510px)] xl:gap-6">
          <div className="order-1 grid min-h-0 gap-4 xl:grid-rows-[minmax(260px,1fr)_168px]">
            <BikePreview
              bike={selectedBike}
              graphic={selectedGraphic}
              customGraphic={isCustomGraphic}
              className="aspect-[4/3] xl:h-full xl:min-h-0 xl:aspect-auto"
            />
            <ConfigSummary
              bike={selectedBike}
              graphic={selectedGraphic}
              customGraphic={isCustomGraphic}
              accessories={selectedAccessories}
              total={total}
              className="xl:h-[168px] xl:min-h-0"
            />
          </div>

          <section className="order-2 flex min-h-[620px] min-w-0 flex-col border border-white/10 bg-[#080808] p-5 md:p-7 xl:min-h-0 xl:overflow-hidden xl:p-5 2xl:p-6">
            {step === 1 && (
              <>
                <StepHeader step="Step 01" title="Выбери" accent="базу" />
                <div ref={optionsPanelRef} className="custom-scrollbar mt-6 min-h-0 flex-1 overflow-y-auto pr-1 sm:mt-8 xl:mt-5">
                  <div className="grid gap-4">
                    {bikes.map((bike) => (
                      <button
                        key={bike.id}
                        onClick={() => selectBike(bike)}
                        className={`group grid gap-4 border p-4 text-left transition-all sm:grid-cols-[128px_minmax(0,1fr)] sm:items-center ${
                          selectedBike?.id === bike.id ? "border-[#16d8ff] bg-[#16d8ff]/10" : "border-white/10 bg-[#0d0d0d] hover:border-white/30"
                        } ${!bike.in_stock ? "opacity-45 grayscale" : ""}`}
                      >
                        <img src={getMainImage(bike.images)} alt={bike.name} className="aspect-[4/3] w-full object-cover" />
                        <div className="min-w-0">
                          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">{bike.has_pts ? "С ПТС" : "Без ПТС"} / 17-17</div>
                          <div className="mt-2 text-xl font-black uppercase italic leading-tight text-white">{bike.name}</div>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <div className="whitespace-nowrap font-mono text-xl font-black text-[#16d8ff]">{formatPrice(bike.price)}</div>
                            {!bike.in_stock && <div className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-white/35">Под заказ</div>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <StepHeader step="Step 02" title="Графика" accent="стиль" />
                <div ref={optionsPanelRef} className="custom-scrollbar mt-6 min-h-0 flex-1 overflow-y-auto pr-1 sm:mt-8 xl:mt-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Choice selected={!selectedGraphic && !isCustomGraphic} title="Сток" subtitle="Без наценки" onClick={() => setGraphic(null)} />
                    <Choice selected={isCustomGraphic} title="Свой дизайн" subtitle="+30 000 ₽ / созвон" onClick={setCustomGraphic} icon={<PaintBucket className="h-7 w-7" />} tone="magenta" />
                    {graphics.map((graphic) => (
                      <button
                        key={graphic.id}
                        onClick={() => setGraphic(graphic)}
                        className={`group border p-4 text-left transition-all ${selectedGraphic?.id === graphic.id ? "border-[#16d8ff] bg-[#16d8ff]/10" : "border-white/10 bg-[#0d0d0d] hover:border-white/30"}`}
                      >
                        <img src={graphic.image_overlay_url} alt={graphic.name} className="mb-4 aspect-[16/10] w-full object-cover opacity-75 transition-opacity group-hover:opacity-100" />
                        <div className="text-xl font-black uppercase italic leading-tight">{graphic.name}</div>
                        <div className="mt-2 whitespace-nowrap font-mono text-sm font-black text-[#16d8ff]">+{formatPrice(graphic.price_add)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <StepHeader step="Step 03" title="Выбери" accent="допы" />
                <div ref={optionsPanelRef} className="custom-scrollbar mt-6 min-h-0 flex-1 overflow-y-auto pr-1 sm:mt-8 xl:mt-5">
                  <div className="grid gap-4">
                    {accessories.map((accessory) => {
                      const selected = selectedAccessories.some((item) => item.id === accessory.id);
                      return (
                        <div
                          key={accessory.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleAccessory(accessory)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              toggleAccessory(accessory);
                            }
                          }}
                          className={`grid cursor-pointer gap-4 border p-4 transition-all hover:border-[#ff00e6]/70 sm:grid-cols-[118px_minmax(0,1fr)_auto] sm:items-center ${selected ? "border-[#ff00e6] bg-[#ff00e6]/10" : "border-white/10 bg-[#0d0d0d]"}`}
                        >
                          <img src={accessory.image_url} alt={accessory.name} className="aspect-[4/3] w-full object-cover" />
                          <div className="min-w-0">
                            <div className="text-xl font-black uppercase italic leading-tight">{accessory.name}</div>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/45">{accessory.description || "Описание можно заполнить в админке."}</p>
                            <button onClick={(event) => { event.stopPropagation(); setActiveAccessory(accessory); }} className="mt-3 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#16d8ff] sm:text-xs sm:tracking-[0.28em]">Подробнее</button>
                          </div>
                          <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                            <div className="whitespace-nowrap font-mono text-lg font-black text-[#16d8ff]">+{formatPrice(accessory.price)}</div>
                            <button onClick={(event) => { event.stopPropagation(); toggleAccessory(accessory); }} className={`grid h-12 w-12 place-items-center border ${selected ? "border-[#ff00e6] bg-[#ff00e6] text-white" : "border-white/15 text-white/40 hover:border-white"}`}>
                              {selected ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <StepHeader step="Step 04" title="Финал" accent="корзина" />
                <div ref={optionsPanelRef} className="custom-scrollbar mt-6 min-h-0 flex-1 overflow-y-auto pr-1 sm:mt-8 xl:mt-5">
                  <div className="grid gap-4">
                    <SummaryCard label="База" title={selectedBike?.name || "Не выбрана"} price={selectedBike?.price || 0} />
                    <SummaryCard
                      label="Графика"
                      title={isCustomGraphic ? "Индивидуальный дизайн" : selectedGraphic?.name || "Сток"}
                      price={isCustomGraphic ? 30000 : selectedGraphic?.price_add || 0}
                      prefix
                    />
                    {selectedAccessories.length === 0 ? (
                      <div className="border border-white/10 bg-[#0d0d0d] p-5 font-mono text-xs font-black uppercase tracking-[0.24em] text-white/35">
                        Допы не выбраны
                      </div>
                    ) : (
                      selectedAccessories.map((accessory) => (
                        <SummaryCard key={accessory.id} label="Доп" title={accessory.name} price={accessory.price} prefix />
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="mt-5 flex shrink-0 flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row xl:mt-4 xl:pt-4">
              {step < 4 ? (
                <button
                  disabled={!canContinue}
                  onClick={() => moveToStep(step + 1)}
                  className="flex min-h-14 flex-1 items-center justify-center gap-3 bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[6px_6px_0_#16d8ff] disabled:opacity-45 sm:text-base sm:tracking-[0.18em]"
                >
                  Продолжить
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  disabled={!canContinue}
                  onClick={addConfigurationToCart}
                  className="flex min-h-14 flex-1 items-center justify-center gap-3 bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[6px_6px_0_#16d8ff] disabled:opacity-45 sm:text-base sm:tracking-[0.18em]"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Добавить в корзину
                </button>
              )}

              {step > 1 && (
                <button
                  onClick={() => moveToStep(step - 1)}
                  className="min-h-14 border border-white/10 px-5 py-4 font-mono text-xs font-black uppercase tracking-[0.18em] text-white/50 hover:border-[#ff00e6] hover:text-white"
                >
                  Назад
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      {activeAccessory && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative grid max-h-[90vh] w-full max-w-3xl gap-6 overflow-y-auto border border-white/10 bg-[#0b0b0b] p-5 md:grid-cols-2 md:gap-7 md:p-6">
            <button onClick={() => setActiveAccessory(null)} className="absolute right-4 top-4 grid h-10 w-10 place-items-center border border-white/10 text-white/50">
              <X className="h-5 w-5" />
            </button>
            <img src={activeAccessory.image_url} alt={activeAccessory.name} className="aspect-[4/3] w-full object-cover" />
            <div className="pr-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#16d8ff] sm:text-xs sm:tracking-[0.35em]">Accessory</div>
              <h3 className="mt-4 text-2xl font-black uppercase italic leading-tight sm:text-4xl">{activeAccessory.name}</h3>
              <p className="mt-5 leading-7 text-white/55">{activeAccessory.description}</p>
              <div className="mt-8 whitespace-nowrap font-mono text-2xl font-black text-[#16d8ff] sm:text-3xl">+{formatPrice(activeAccessory.price)}</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Choice({
  selected,
  title,
  subtitle,
  onClick,
  icon,
  tone = "cyan",
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
  icon?: React.ReactNode;
  tone?: "cyan" | "magenta";
}) {
  const color = tone === "magenta" ? "text-[#ff00e6]" : "text-[#16d8ff]";
  return (
    <button onClick={onClick} className={`min-h-36 border p-5 text-left transition-all sm:min-h-40 sm:p-6 ${selected ? "border-white bg-white text-black" : "border-white/10 bg-[#0d0d0d] hover:border-white/30"}`}>
      <div className={selected ? "text-black" : color}>{icon}</div>
      <div className="mt-5 text-xl font-black uppercase italic leading-tight sm:text-3xl">{title}</div>
      <div className={`mt-3 font-mono text-[10px] font-black uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.28em] ${selected ? "text-black/55" : "text-white/40"}`}>{subtitle}</div>
    </button>
  );
}

function SummaryCard({ label, title, price, prefix = false }: { label: string; title: string; price: number; prefix?: boolean }) {
  return (
    <div className="grid gap-3 border border-white/10 bg-[#0d0d0d] p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/35">{label}</div>
        <div className="mt-2 text-xl font-black uppercase italic leading-tight text-white">{title}</div>
      </div>
      <div className="whitespace-nowrap font-mono text-xl font-black text-[#16d8ff]">
        {price > 0 ? `${prefix ? "+" : ""}${formatPrice(price)}` : "0 ₽"}
      </div>
    </div>
  );
}
