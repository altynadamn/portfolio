import { Instrument_Sans, JetBrains_Mono, Onest } from "next/font/google";

// Self-hosted at build time by next/font — no runtime third-party requests.
export const displayFont = Instrument_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
});

// One static weight (~half the variable file); not preloaded so it never
// competes with the display font that paints the LCP (hero name).
// Cyrillic subset is only downloaded when Cyrillic glyphs render (unicode-range).
export const monoFont = JetBrains_Mono({
  subsets: ["latin", "greek", "cyrillic"],
  weight: "400",
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

// Instrument Sans has no Cyrillic: Onest fills in Cyrillic glyphs only
// (cyrillic subset → unicode-range), so the English page never downloads it.
export const cyrillicFont = Onest({
  subsets: ["cyrillic"],
  variable: "--font-cyrillic",
  display: "swap",
  preload: false,
});

/** Class names that define the font variables on <html>. */
export const fontVariables = `${displayFont.variable} ${monoFont.variable} ${cyrillicFont.variable}`;
