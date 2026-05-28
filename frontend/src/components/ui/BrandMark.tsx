import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`home-logo ${compact ? "scale-[0.9]" : ""}`}>
      <span className="home-logo-stunt">STUNT</span>
      <span className="home-logo-tech">TECH</span>
    </Link>
  );
}
