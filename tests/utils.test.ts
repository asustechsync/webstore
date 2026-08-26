import assert from "node:assert/strict";
import test from "node:test";
import { formatearPrecio, slugificar } from "../src/lib/utils";

test("slugificar normaliza acentos, espacios y símbolos", () => {
  assert.equal(slugificar("  Ropa Íntima & Niños  "), "ropa-intima-ninos");
});

test("slugificar evita separadores al inicio y al final", () => {
  assert.equal(slugificar("--Nueva marca--"), "nueva-marca");
});

test("formatearPrecio usa soles peruanos", () => {
  const precio = formatearPrecio("19.90");
  assert.match(precio, /19[.,]90/);
  assert.match(precio, /S\//);
});
