import { describe, expect, it } from "vitest";
import { formatearPrecio, precioConIgv, totalCarrito } from "./precios";

describe("precios", () => {
  it("aplica el IGV", () => expect(precioConIgv(10000)).toBe(11800));
  it("suma el carrito", () =>
    expect(totalCarrito([{ precio: 500, cantidad: 2 }, { precio: 250, cantidad: 1 }])).toBe(1250));
});

describe("formatearPrecio", () => {
  it("muestra soles con dos decimales", () =>
    expect(formatearPrecio(129900).replace(/\s/g, " ")).toBe("S/ 1,299.00"));
});
