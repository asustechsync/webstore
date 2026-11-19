import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { env } from "@/env";
import "./globals.css";

const comfort = localFont({
  src: [
    { path: "./fonts/confortotrial-thin.woff2", weight: "100", style: "normal" },
    { path: "./fonts/confortotrial-light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/confortotrial-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/confortotrial-medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/confortotrial-bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-comfort",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: env.NEXT_PUBLIC_STORE_NAME,
    template: `%s · ${env.NEXT_PUBLIC_STORE_NAME}`,
  },
  description: `Tienda en línea de ${env.NEXT_PUBLIC_STORE_NAME}`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={comfort.variable}>
      <body className="flex min-h-dvh flex-col bg-surface-muted antialiased">
        {children}
      </body>
    </html>
  );
}
