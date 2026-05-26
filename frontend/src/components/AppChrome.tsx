"use client";

import { usePathname } from "next/navigation";

import Header from "./Header";
import Footer from "./Footer";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isWorkspace = pathname.startsWith("/configurator");
  const hideFooter = isAdmin;

  return (
    <>
      <Header />
      <div className={`flex flex-1 flex-col ${isWorkspace ? "min-h-0" : ""}`}>{children}</div>
      {!hideFooter && <Footer />}
    </>
  );
}
