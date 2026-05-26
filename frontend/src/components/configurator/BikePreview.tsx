"use client";

import { motion, AnimatePresence } from "motion/react";
import { PaintBucket } from "lucide-react";

import { getMainImage } from "../../lib/format";
import type { Bike, GraphicOption } from "../../lib/types";

export function BikePreview({
  bike,
  graphic,
  customGraphic,
  className = "",
}: {
  bike: Bike | null;
  graphic: GraphicOption | null;
  customGraphic: boolean;
  className?: string;
}) {
  if (!bike) {
    return (
      <div className={`grid min-h-[220px] place-items-center border border-white/10 bg-[#0b0b0b] text-center ${className || "aspect-[4/3]"}`}>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.36em] text-white/35 sm:text-xs">No base selected</div>
          <div className="mt-4 text-3xl font-black uppercase italic text-white/15 sm:text-4xl">STUNT TECH</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-[220px] overflow-hidden border border-white/10 bg-black ${className || "aspect-[4/3]"}`}>
      <img src={getMainImage(bike.images)} alt={bike.name} className="absolute inset-0 h-full w-full object-cover opacity-85" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/15" />
      <AnimatePresence>
        {graphic && (
          <motion.img
            key={graphic.id}
            src={graphic.image_overlay_url}
            alt={graphic.name}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </AnimatePresence>
      {customGraphic && (
        <div className="absolute inset-0 grid place-items-center bg-black/72 backdrop-blur-sm">
          <div className="text-center">
            <PaintBucket className="mx-auto mb-5 h-14 w-14 text-[#ff00e6]" />
            <div className="text-4xl font-black uppercase italic text-white">Свой дизайн</div>
            <div className="mt-3 font-mono text-xs uppercase tracking-[0.35em] text-white/45">Созвон с менеджером</div>
          </div>
        </div>
      )}
      <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-3 sm:bottom-6 sm:left-6 sm:right-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#16d8ff]">Base</div>
          <div className="mt-2 text-lg font-black uppercase italic leading-tight text-white sm:text-2xl">{bike.name}</div>
        </div>
        <div className="w-fit border border-white/15 px-3 py-2 font-mono text-xs uppercase tracking-widest text-white/65">17/17</div>
      </div>
    </div>
  );
}
