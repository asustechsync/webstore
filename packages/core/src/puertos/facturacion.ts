/** SUNAT: aplazado hasta que el volumen lo pida. */
export interface Facturacion {
  emitirComprobante(pedidoId: string): Promise<{ serie: string; numero: string }>;
}
