import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center">
      <img
        src="/home/logo-new.png"
        alt="Stunt Tech"
        className={`${compact ? "h-9" : "h-10 sm:h-12"} w-auto`}
      />
    </Link>
  );
}
