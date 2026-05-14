import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import { Providers } from "./providers";
import FloatingDock from "@/components/FloatingDock";

export const metadata: Metadata = {
  title: "I'M — Lifkie",
  description: "PORTFOLIO",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased transition-colors duration-500">
        <Providers>
          <FloatingDock />
          {children}
        </Providers>
      </body>
    </html>
  );
}