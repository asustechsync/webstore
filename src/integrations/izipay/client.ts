// Integración de pagos Izipay — placeholder, se implementa en fase 3.
// Aquí irá: creación de formToken, verificación de firma del webhook, etc.

export type ResultadoPagoIzipay = {
  exitoso: boolean;
  referencia: string;
};

export async function crearFormToken(montoEnCentimos: number, pedidoId: string): Promise<string> {
  void montoEnCentimos;
  void pedidoId;
  throw new Error("Izipay no implementado todavía (fase 3)");
}
