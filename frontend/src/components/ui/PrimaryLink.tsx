import Link from "next/link";
import type { ReactNode } from "react";

export function PrimaryLink({
  href,
  children,
  tone = "cyan",
}: {
  href: string;
  children: ReactNode;
  tone?: "cyan" | "magenta" | "white";
}) {
  const shadow = tone === "magenta" ? "shadow-[6px_6px_0_#ff00e6]" : tone === "cyan" ? "shadow-[6px_6px_0_#16d8ff]" : "shadow-[6px_6px_0_rgba(255,255,255,0.22)]";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-14 items-center justify-center bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition-transform hover:-translate-y-1 sm:px-9 sm:py-5 sm:text-base sm:tracking-[0.18em] ${shadow}`}
    >
      {children}
    </Link>
  );
}
