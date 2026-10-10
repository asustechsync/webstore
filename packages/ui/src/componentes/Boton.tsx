import type { ButtonHTMLAttributes } from "react";
import estilos from "./Boton.module.css";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  variante?: "primario" | "secundario";
};

export function Boton({ variante = "primario", type = "button", ...props }: Props) {
  return <button type={type} className={`${estilos.boton} ${estilos[variante]}`} {...props} />;
}
