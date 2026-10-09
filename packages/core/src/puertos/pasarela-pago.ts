export interface CobroSolicitado {
  pedidoId: string;
  monto: number; // céntimos
  moneda: "PEN" | "USD";
  correo: string;
}

export interface ResultadoCobro {
  estado: "PENDIENTE" | "PAGADO" | "FALLIDO";
  referencia: string;
  urlPago?: string;
}

export interface PasarelaPago {
  iniciarCobro(solicitud: CobroSolicitado): Promise<ResultadoCobro>;
  confirmarWebhook(cuerpo: string, firma: string): Promise<{ pedidoId: string; estado: ResultadoCobro["estado"] }>;
  reembolsar(referencia: string, monto?: number): Promise<void>;
}
