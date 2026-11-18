"use client";

import { useEffect, useState } from "react";

const pad = (value: number) => String(value).padStart(2, "0");

/** Milisegundos que faltan para la medianoche local. */
function untilMidnight() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  return Math.max(0, end.getTime() - now.getTime());
}

/** Cuenta atrás hasta el fin del día. Se calcula en el navegador para evitar desajustes de hidratación. */
export function Countdown({ className }: { className?: string }) {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setMs(untilMidnight());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const total = Math.floor((ms ?? 0) / 1000);
  const text = ms === null ? "--:--:--" : `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;

  return (
    <span className={className} aria-label="Tiempo restante de la oferta">
      {text}
    </span>
  );
}
