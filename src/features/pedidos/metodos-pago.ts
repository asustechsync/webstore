/**
 * Catálogo de métodos de pago de la tienda.
 *
 * Ninguno cobra todavía: el pedido nace PENDIENTE y el cobro se confirma
 * aparte (Izipay para tarjeta, verificación manual para el resto). Las
 * instrucciones son lo que ve el cliente al terminar la compra; `corto` es la
 * etiqueta con la que el carrito los enumera antes de llegar al checkout.
 */
export const METODOS_PAGO = [
  {
    clave: "TARJETA",
    nombre: "Tarjeta de crédito o débito",
    corto: "Tarjeta",
    resumen: "Visa, Mastercard, Amex",
    instrucciones:
      "Te enviaremos el enlace de pago seguro de Izipay al correo de tu cuenta para completar el cobro.",
  },
  {
    clave: "YAPE",
    nombre: "Yape",
    corto: "Yape",
    resumen: "Pago inmediato desde tu celular",
    instrucciones:
      "Yapea el total al número de la tienda usando el código de tu pedido como mensaje. Validamos el pago y preparamos tu envío.",
  },
  {
    clave: "PLIN",
    nombre: "Plin",
    corto: "Plin",
    resumen: "Pago inmediato desde tu banco",
    instrucciones:
      "Envía el total por Plin al número de la tienda indicando el código de tu pedido. Validamos el pago y preparamos tu envío.",
  },
  {
    clave: "TRANSFERENCIA",
    nombre: "Transferencia bancaria",
    corto: "transferencia",
    resumen: "BCP, Interbank y otros bancos",
    instrucciones:
      "Te compartiremos los datos de la cuenta bancaria. Envía el comprobante indicando el código de tu pedido.",
  },
] as const;

export type MetodoPagoClave = (typeof METODOS_PAGO)[number]["clave"];

export const CLAVES_METODO_PAGO = METODOS_PAGO.map((metodo) => metodo.clave);

export function obtenerMetodoPago(clave: string | null | undefined) {
  return METODOS_PAGO.find((metodo) => metodo.clave === clave) ?? null;
}
