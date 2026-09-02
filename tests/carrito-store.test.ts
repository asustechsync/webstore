import assert from "node:assert/strict";
import test from "node:test";
import { filtrarSeleccionados, useCartStore, type ItemCarrito } from "../src/store/cartStore";

const base = {
  productoId: "p1",
  slug: "media-fresh",
  talla: "40-45",
  color: "Blanco",
  precio: 15,
  imagenUrl: null,
};

function nuevo(varianteId: string): Omit<ItemCarrito, "cantidad"> {
  return { ...base, varianteId, nombre: `Media ${varianteId}` };
}

/** Cada prueba parte de un carrito limpio: el store es único por proceso. */
function reiniciar() {
  useCartStore.setState({ items: [], guardados: [], seleccionados: [], cupon: null });
  return useCartStore.getState();
}

test("lo que se agrega al carrito entra marcado para pagar", () => {
  reiniciar().agregarItem(nuevo("v1"), 2);

  const { items, seleccionados } = useCartStore.getState();
  assert.equal(items.length, 1);
  assert.deepEqual(seleccionados, ["v1"]);
  assert.equal(filtrarSeleccionados(items, seleccionados).length, 1);
});

test("desmarcar una línea la deja en el carrito pero fuera del total", () => {
  const carrito = reiniciar();
  carrito.agregarItem(nuevo("v1"));
  carrito.agregarItem(nuevo("v2"));
  useCartStore.getState().alternarSeleccion("v1");

  const { items, seleccionados } = useCartStore.getState();
  assert.equal(items.length, 2);
  assert.deepEqual(filtrarSeleccionados(items, seleccionados).map((i) => i.varianteId), ["v2"]);
});

test("guardar para después saca la línea del carrito y de la selección", () => {
  const carrito = reiniciar();
  carrito.agregarItem(nuevo("v1"));
  carrito.agregarItem(nuevo("v2"));
  useCartStore.getState().guardarVarios(["v1", "v2"]);

  const estado = useCartStore.getState();
  assert.deepEqual(estado.items, []);
  assert.deepEqual(estado.seleccionados, []);
  assert.deepEqual(estado.guardados.map((i) => i.varianteId), ["v1", "v2"]);
});

test("volver a marcar todo alcanza a las líneas que estaban sueltas", () => {
  const carrito = reiniciar();
  carrito.agregarItem(nuevo("v1"));
  carrito.agregarItem(nuevo("v2"));
  useCartStore.getState().seleccionarTodo(false);
  assert.deepEqual(useCartStore.getState().seleccionados, []);

  useCartStore.getState().seleccionarTodo(true);
  assert.deepEqual(useCartStore.getState().seleccionados, ["v1", "v2"]);
});

test("mover al carrito lo devuelve marcado", () => {
  const carrito = reiniciar();
  carrito.agregarItem(nuevo("v1"));
  useCartStore.getState().guardarParaDespues("v1");
  useCartStore.getState().moverAlCarrito("v1");

  const estado = useCartStore.getState();
  assert.deepEqual(estado.guardados, []);
  assert.deepEqual(estado.seleccionados, ["v1"]);
});

test("la revisión no deja marcada una variante que ya no está en el carrito", () => {
  const carrito = reiniciar();
  carrito.agregarItem(nuevo("v1"));
  carrito.agregarItem(nuevo("v2"));

  const soloV2 = useCartStore.getState().items.filter((i) => i.varianteId === "v2");
  useCartStore.getState().reemplazarItems(soloV2);

  assert.deepEqual(useCartStore.getState().seleccionados, ["v2"]);
});

test("comprar retira solo las líneas pagadas", () => {
  const carrito = reiniciar();
  carrito.agregarItem(nuevo("v1"));
  carrito.agregarItem(nuevo("v2"));
  useCartStore.getState().quitarItems(["v1"]);

  const estado = useCartStore.getState();
  assert.deepEqual(estado.items.map((i) => i.varianteId), ["v2"]);
  assert.deepEqual(estado.seleccionados, ["v2"]);
});
