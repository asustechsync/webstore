import assert from "node:assert/strict";
import test from "node:test";
import {
  calcularDescuentoCupon,
  faltaParaMinimo,
  type CuponAplicado,
} from "../src/features/cupones/calculo";

const porcentaje: CuponAplicado = {
  codigo: "VERANO10",
  tipo: "PORCENTAJE",
  valor: 10,
  montoMinimo: null,
};

const montoFijo: CuponAplicado = {
  codigo: "MENOS20",
  tipo: "MONTO_FIJO",
  valor: 20,
  montoMinimo: 50,
};

test("un cupón por porcentaje descuenta la parte proporcional", () => {
  assert.equal(calcularDescuentoCupon(porcentaje, 59.9), 5.99);
});

test("un cupón de monto fijo descuenta su valor", () => {
  assert.equal(calcularDescuentoCupon(montoFijo, 80), 20);
});

test("el descuento nunca supera el subtotal", () => {
  assert.equal(calcularDescuentoCupon({ ...montoFijo, montoMinimo: null }, 12), 12);
});

test("un cupón no descuenta si el carrito no llega al monto mínimo", () => {
  assert.equal(calcularDescuentoCupon(montoFijo, 49.99), 0);
  assert.equal(faltaParaMinimo(montoFijo, 49.99), 0.01);
});

test("faltaParaMinimo es 0 cuando el carrito ya alcanza el mínimo", () => {
  assert.equal(faltaParaMinimo(montoFijo, 50), 0);
  assert.equal(faltaParaMinimo(porcentaje, 0), 0);
});

test("un carrito vacío no genera descuento", () => {
  assert.equal(calcularDescuentoCupon(porcentaje, 0), 0);
});
