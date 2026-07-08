import type { Metadata } from "next";
import {
  Inter,
  Merriweather,
  Barlow_Condensed,
  Cormorant_Garamond,
  JetBrains_Mono,
  Fraunces,
  Newsreader,
} from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

// Display font — Barlow Condensed Black/ExtraBold for headlines. Replaces
// Fraunces (Apr 2026): the variable-axis serif read soft + decorative,
// which clashed with the "stand guard" voice. Barlow is a low-contrast
// condensed sans — strong, urgent, poster-like, still humane.
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: ["600", "700", "800", "900"],
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

// Ridge & Bone (Jul 2026) — Fraunces returns as the DISPLAY face, but with
// the full optical-size + WONK axes this time (the Apr 2026 removal was of
// a flat, soft cut that read decorative). At opsz 144 with WONK on it is
// warm and authoritative — a broadsheet voice, not a wedding invitation.
// Barlow Condensed stays loaded for the ember-band folio moments only.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

// Long-form body serif — the Letter, devotionals, essays.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.acts2028sheepdogsociety.com"
  ),
  title: "Sheepdog Society",
  description: "Men of Faith Community",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${merriweather.variable} ${barlowCondensed.variable} ${cormorant.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${newsreader.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
