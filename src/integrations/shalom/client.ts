// Integración de rastreo de envíos Shalom — placeholder, se implementa en fase 3.
// Aquí irá: creación de guía de envío, consulta de estado de rastreo, etc.

export type EstadoEnvioShalom = {
  guia: string;
  estado: string;
  actualizadoEn: string;
};

export async function consultarEstadoEnvio(guia: string): Promise<EstadoEnvioShalom> {
  void guia;
  throw new Error("Shalom no implementado todavía (fase 3)");
}
