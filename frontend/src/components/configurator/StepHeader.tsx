export function StepHeader({ step, title, accent }: { step: string; title: string; accent?: string }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#16d8ff] sm:gap-4 sm:text-xs sm:tracking-[0.45em] xl:mb-3">
        <span className="h-px w-10 bg-[#16d8ff] sm:w-12" />
        {step}
      </div>
      <h1 className="st-display max-w-full overflow-visible pr-[0.22em] text-[clamp(2.45rem,9vw,4.4rem)] font-black uppercase italic leading-[0.92] text-white xl:text-[clamp(2.45rem,2.55vw,3.25rem)] 2xl:text-[3.55rem]">
        <span className="block">{title}</span>
        {accent && <span className="block text-[#ff00e6]">{accent}</span>}
      </h1>
    </div>
  );
}
