import { z } from "zod";
import { CLAVES_METODO_PAGO } from "./metodos-pago";

/** Lo que el carrito manda; los precios se leen de la base, nunca del cliente. */
export const itemPedidoSchema = z.object({
  varianteId: z.uuid("Producto inválido"),
  cantidad: z.number().int().min(1, "Cantidad inválida").max(99, "Cantidad inválida"),
});

export const envioPedidoSchema = z.object({
  destinatario: z.string().trim().min(3, "Ingresa el nombre de quien recibe").max(120),
  telefono: z.string().trim().min(6, "Ingresa un teléfono de contacto").max(30),
  departamento: z.string().trim().min(2, "Selecciona el departamento").max(80),
  provincia: z.string().trim().min(2, "Selecciona la provincia").max(80),
  distrito: z.string().trim().min(2, "Selecciona el distrito").max(80),
  direccion: z.string().trim().min(5, "Ingresa una dirección completa").max(200),
  referencia: z.string().trim().max(200).optional(),
  codigoPostal: z.string().trim().max(20).optional(),
});

export const crearPedidoSchema = z.object({
  items: z.array(itemPedidoSchema).min(1, "Tu carrito está vacío"),
  metodoPago: z.enum(CLAVES_METODO_PAGO as unknown as [string, ...string[]], {
    message: "Elige un método de pago",
  }),
  envio: envioPedidoSchema,
  codigoCupon: z.string().trim().max(40).optional(),
});

export type CrearPedidoInput = z.infer<typeof crearPedidoSchema>;
export type EnvioPedidoInput = z.infer<typeof envioPedidoSchema>;
