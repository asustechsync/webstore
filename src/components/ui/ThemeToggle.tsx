"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import styles from "./ThemeToggle.module.css";

type Tema = "light" | "dark";

const EVENTO_TEMA = "webstore:tema";

function obtenerTema(): Tema {
  const guardado = document.documentElement.getAttribute("data-theme");
  if (guardado === "light" || guardado === "dark") return guardado;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function obtenerTemaServidor(): Tema {
  return "light";
}

function suscribir(onCambio: () => void) {
  const preferencia = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(EVENTO_TEMA, onCambio);
  preferencia.addEventListener("change", onCambio);

  return () => {
    window.removeEventListener(EVENTO_TEMA, onCambio);
    preferencia.removeEventListener("change", onCambio);
  };
}

export function ThemeToggle() {
  const tema = useSyncExternalStore(suscribir, obtenerTema, obtenerTemaServidor);

  function alternar() {
    const siguiente: Tema = tema === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", siguiente);
    localStorage.setItem("tema", siguiente);
    window.dispatchEvent(new Event(EVENTO_TEMA));
  }

  return (
    <button
      type="button"
      className={styles.boton}
      onClick={alternar}
      aria-label={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={tema === "dark" ? "Modo claro" : "Modo oscuro"}
    >
      {tema === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
