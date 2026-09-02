import assert from "node:assert/strict";
import test from "node:test";
import {
  ajustarLineas,
  avisosDeLinea,
  calcularAhorroOfertas,
  contarAvisos,
  precioEfectivo,
  revisarLineas,
  type InfoVariante,
} from "../src/features/carrito/revision";

const item = { varianteId: "v1", cantidad: 2, precio: 30 };

function info(cambios: Partial<InfoVariante> = {}): InfoVariante {
  return {
    varianteId: "v1",
    nombre: "Polo básico",
    activa: true,
    stock: 5,
    precio: 30,
    precioLista: 30,
    ...cambios,
  };
}

test("el precio de la variante manda sobre el del producto", () => {
  assert.equal(precioEfectivo(25, 40, null), 25);
  assert.equal(precioEfectivo(null, 40, null), 40);
});

test("la oferta solo gana cuando es menor", () => {
  assert.equal(precioEfectivo(25, 40, 19.9), 19.9);
  assert.equal(precioEfectivo(25, 40, 30), 25);
});

test("una línea sin novedades no genera avisos", () => {
  assert.deepEqual(avisosDeLinea(item, info()), []);
});

test("una variante despublicada o borrada se marca como retirada", () => {
  assert.deepEqual(avisosDeLinea(item, null), [{ tipo: "retirado" }]);
  assert.deepEqual(avisosDeLinea(item, info({ activa: false })), [{ tipo: "retirado" }]);
});

test("se avisa cuando el stock no alcanza y cuando se agotó", () => {
  assert.deepEqual(avisosDeLinea(item, info({ stock: 1 })), [{ tipo: "stock", disponible: 1 }]);
  assert.deepEqual(avisosDeLinea(item, info({ stock: 0 })), [{ tipo: "agotado" }]);
});

test("se avisa del cambio de precio en cualquier dirección", () => {
  assert.deepEqual(avisosDeLinea(item, info({ precio: 34.9 })), [
    { tipo: "precio", anterior: 30, actual: 34.9 },
  ]);
  assert.deepEqual(avisosDeLinea(item, info({ precio: 19.9 })), [
    { tipo: "precio", anterior: 30, actual: 19.9 },
  ]);
});

test("una diferencia por debajo del céntimo no es un cambio de precio", () => {
  assert.deepEqual(avisosDeLinea(item, info({ precio: 30.001 })), []);
});

test("actualizar el carrito recorta cantidades y toma el precio de hoy", () => {
  const lineas = revisarLineas([item], [info({ stock: 1, precio: 24.9 })]);

  assert.equal(contarAvisos(lineas), 2);
  assert.deepEqual(ajustarLineas(lineas), [{ varianteId: "v1", cantidad: 1, precio: 24.9 }]);
});

test("actualizar el carrito descarta lo que ya no se puede comprar", () => {
  const lineas = revisarLineas(
    [item, { varianteId: "v2", cantidad: 1, precio: 10 }],
    [info({ stock: 0 }), info({ varianteId: "v2", activa: false })],
  );

  assert.deepEqual(ajustarLineas(lineas), []);
});

test("el ahorro suma la rebaja de cada unidad en oferta", () => {
  const lineas = revisarLineas([item], [info({ precio: 30, precioLista: 39.9 })]);

  assert.equal(calcularAhorroOfertas(lineas), 19.8);
});

test("una línea con el precio desactualizado no suma al ahorro", () => {
  const lineas = revisarLineas([item], [info({ precio: 25, precioLista: 39.9 })]);

  assert.equal(calcularAhorroOfertas(lineas), 0);
});

test("sin ofertas ni revisión el ahorro es cero", () => {
  assert.equal(calcularAhorroOfertas(revisarLineas([item], [info()])), 0);
  assert.equal(calcularAhorroOfertas(revisarLineas([item], [])), 0);
});
