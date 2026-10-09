export type TipoMovimiento = "ENTRADA" | "SALIDA" | "AJUSTE" | "RESERVA" | "DEVOLUCION";

export interface Movimiento {
  tipo: TipoMovimiento;
  cantidad: number; // con signo: positivo suma, negativo resta
}

/** El stock nunca se guarda: sale de la suma de movimientos. */
export function stockActual(movimientos: Movimiento[]): number {
  return movimientos.reduce((suma, m) => suma + m.cantidad, 0);
}
