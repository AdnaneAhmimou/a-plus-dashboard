import type { Metadata } from "next";
import { Archivo, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

import { localeDir, type Locale } from "@/lib/i18n/locales";
import "./globals.css";

// All three families are variable fonts, so no `weight` array is given:
// omitting it fetches the single variable file covering the whole weight
// range, instead of one static instance per listed weight. That is fewer
// build-time requests to Google (the Vercel build failed inside
// next/font's loader while fetching these), a smaller download for the
// visitor, and it keeps every weight available rather than the five we
// happened to list.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "A-Plus Laboratory | Patient Portal",
  description: "DNA test tracking and results for A-Plus Laboratory patients.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Locale comes from the cookie (see src/i18n/request.ts). `dir` is set
  // here rather than anywhere lower down because mirroring the interface
  // for Arabic has to apply to the whole document, including the
  // scrollbar and any portalled overlay.
  const locale = (await getLocale()) as Locale;

  return (
    <html
      lang={locale}
      dir={localeDir(locale)}
      className={`${archivo.variable} ${hanken.variable} ${jbMono.variable}`}
    >
      <body
        className="min-h-screen font-sans antialiased"
        suppressHydrationWarning
      >
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
