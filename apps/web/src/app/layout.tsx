import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { env } from "@/env";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

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
    <html lang="es" className={jakarta.variable}>
      <body className="flex min-h-dvh flex-col bg-surface-muted antialiased">
        {children}
      </body>
    </html>
  );
}
