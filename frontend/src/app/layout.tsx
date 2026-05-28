import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppChrome } from "../components/AppChrome";

const inter = Inter({ subsets: ["latin", "cyrillic"] });
const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

export const metadata: Metadata = {
  metadataBase: new URL("https://stunttech.ru"),
  title: {
    default: "Stunt Tech | Питбайки, стант-мотоциклы и запчасти",
    template: "%s | Stunt Tech",
  },
  description: "Stunt Tech: витрина питбайков и мотоциклов, конфигуратор стант-сборок, собственные запчасти и сервис.",
  keywords: [
    "Stunt Tech",
    "питбайки",
    "стант",
    "мотоциклы",
    "дублер",
    "бугель",
    "запчасти для станта",
    "конфигуратор мотоцикла",
  ],
  applicationName: "Stunt Tech",
  icons: {
    icon: "/stunt-tab-icon.jpg",
    shortcut: "/stunt-tab-icon.jpg",
    apple: "/stunt-tab-icon.jpg",
  },
  authors: [{ name: "Stunt Tech" }],
  creator: "Stunt Tech",
  publisher: "Stunt Tech",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Stunt Tech",
    title: "Stunt Tech | Твой байк - твои правила",
    description: "Питбайки, большие мотоциклы, конфигуратор и собственные детали для стант-культуры.",
    url: "https://stunttech.ru",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stunt Tech",
    description: "Техника, конфигуратор и запчасти для стант-культуры.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-[#050505] text-white min-h-screen flex flex-col`}>
        {metrikaId && (
          <>
            <Script id="yandex-metrika" strategy="afterInteractive">
              {`
                (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
                ym(${metrikaId}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
              `}
            </Script>
            <noscript>
              <div>
                <img src={`https://mc.yandex.ru/watch/${metrikaId}`} style={{ position: "absolute", left: "-9999px" }} alt="" />
              </div>
            </noscript>
          </>
        )}
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
