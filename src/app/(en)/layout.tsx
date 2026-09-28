import type { Metadata } from "next";
import "../globals.css";
import { fontVariables } from "@/components/layout/fonts";
import { pageMetadata } from "@/components/layout/metadata";

export const metadata: Metadata = pageMetadata("en");

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
