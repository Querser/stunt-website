import type { ReactNode } from "react";

export function SectionTitle({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-4 flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#16d8ff] sm:mb-5 sm:text-xs sm:tracking-[0.38em]">
            <span className="h-px w-9 bg-[#16d8ff] sm:w-12" />
            {eyebrow}
          </div>
        )}
        <h2 className="st-display max-w-5xl break-words pr-[0.22em] text-[clamp(2.4rem,9vw,4.6rem)] font-black uppercase italic leading-[0.95] text-white md:text-[clamp(3.4rem,6vw,5.5rem)]">
          {title} {accent && <span className="text-[#16d8ff]">{accent}</span>}
        </h2>
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
