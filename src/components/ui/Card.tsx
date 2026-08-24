import type { HTMLAttributes } from "react";
import styles from "@/styles/ui.module.css";

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`${styles.tarjeta} ${className ?? ""}`} {...props} />;
}
