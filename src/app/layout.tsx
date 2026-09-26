import type { Metadata } from "next";
import { Archivo, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${hanken.variable} ${jbMono.variable}`}
    >
      <body
        className="min-h-screen font-sans antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
