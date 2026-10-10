import type { ReactNode } from "react";
import estilos from "./Contenedor.module.css";

export function Contenedor({ children }: { children: ReactNode }) {
  return <div className={estilos.contenedor}>{children}</div>;
}
