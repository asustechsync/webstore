import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "@/styles/index.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Webstore",
  description: "Ecommerce con catálogo, carrito, pagos y panel administrativo",
};

// Corre antes de pintar la página para fijar el tema guardado y evitar el
// parpadeo de cargar en claro y saltar a oscuro un instante después.
const SCRIPT_TEMA = `(function () {
  try {
    var tema = localStorage.getItem("tema");
    if (tema === "light" || tema === "dark") {
      document.documentElement.setAttribute("data-theme", tema);
    }
  } catch (e) {}
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
