export interface Notificaciones {
  enviarCorreo(para: string, asunto: string, html: string): Promise<void>;
  enviarWhatsapp?(telefono: string, mensaje: string): Promise<void>;
}
