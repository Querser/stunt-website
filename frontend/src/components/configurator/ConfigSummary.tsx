import { formatPrice } from "../../lib/format";
import type { Accessory, Bike, GraphicOption } from "../../lib/types";

export function ConfigSummary({
  bike,
  graphic,
  customGraphic,
  accessories,
  total,
  className = "",
}: {
  bike: Bike | null;
  graphic: GraphicOption | null;
  customGraphic: boolean;
  accessories: Accessory[];
  total: number;
  className?: string;
}) {
  return (
    <aside className={`border border-white/10 bg-[#0b0b0b] p-5 sm:p-6 xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:items-center xl:gap-5 xl:p-4 2xl:grid-cols-[minmax(0,1fr)_360px] ${className}`}>
      <div className="min-w-0">
        <div className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#16d8ff] sm:text-xs sm:tracking-[0.35em] xl:mb-2">Live summary</div>
        <div className="custom-scrollbar max-h-36 space-y-3 overflow-y-auto pr-1 font-mono text-xs uppercase sm:text-sm xl:max-h-[74px] xl:space-y-2">
          <Row label="База" value={bike?.name || "Не выбрана"} />
          <Row label="Графика" value={customGraphic ? "Индивидуальная" : graphic?.name || "Сток"} accent={customGraphic || !!graphic} />
          {accessories.map((item) => (
            <Row key={item.id} label={item.name} value={`+${formatPrice(item.price)}`} />
          ))}
        </div>
      </div>
      <div className="mt-4 min-w-0 overflow-visible border-t border-white/10 pt-4 xl:mt-0 xl:flex xl:h-full xl:flex-col xl:items-center xl:justify-center xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0 xl:text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35 sm:text-xs sm:tracking-[0.35em]">Итого</div>
        <div className="mt-2 max-w-full whitespace-nowrap text-[2.1rem] font-black leading-none text-[#16d8ff] sm:text-5xl xl:text-[clamp(2.15rem,2.25vw,2.9rem)]">{formatPrice(total)}</div>
      </div>
    </aside>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  const isPrice = value.includes("₽");

  return (
    <div className="flex flex-col gap-2 border-b border-white/5 pb-3 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4 xl:gap-3 xl:pb-2">
      <span className="min-w-0 break-words text-white/35">{label}</span>
      <span className={`max-w-full text-left font-black leading-snug sm:max-w-[65%] sm:text-right ${isPrice ? "whitespace-nowrap" : "break-words"} ${accent ? "text-[#ff00e6]" : "text-white"}`}>{value}</span>
    </div>
  );
}
