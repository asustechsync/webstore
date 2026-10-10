import type { SVGProps } from "react";

/** Los iconos toman su color del texto (currentColor) y miden 24px por defecto. */
export type IconoProps = Omit<SVGProps<SVGSVGElement>, "width" | "height"> & {
  tamano?: number;
};
