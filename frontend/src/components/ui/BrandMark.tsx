import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`font-black italic uppercase ${compact ? "text-2xl" : "text-2xl sm:text-3xl"} text-white`}>
      <span className="text-[#16d8ff]">STUNT</span>
      <span className="text-[#ff00e6]">TECH</span>
    </Link>
  );
}
