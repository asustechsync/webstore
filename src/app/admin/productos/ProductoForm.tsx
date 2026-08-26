"use client";

import Image from "next/image";
import { IconoEliminar, IconoFlecha } from "@/components/ui/ActionIcons";
import { SelectConFlecha } from "@/components/ui/SelectConFlecha";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { actualizarProducto, crearProducto, subirImagenProducto } from "@/features/catalogo/actions/productos";
import {
  claveAtributos,
  COLORES_POR_NOMBRE,
  combinacionesOpciones,
  etiquetaAtributos,
  normalizarClaveOpcion,
  type AtributoVariante,
  type OpcionConfig,
} from "@/features/catalogo/opciones";
import { formatearPrecio, slugificar } from "@/lib/utils";
import styles from "../admin.module.css";

type Opcion = { id: string; nombre: string };
type AtributoCatalogo = { id: string; nombre: string; clave: string; tipo: "LISTA" | "COLOR"; valores: string[]; valoresHex: Record<string, string> };
export type ImagenForm = { url: string; publicId: string };
export type VarianteForm = {
  clave: string;
  id?: string;
  atributos: AtributoVariante[];
  sku: string;
  precio: string;
  costo: string;
  cantidad: string;
  stockMinimo: string;
  activo: boolean;
};
export type ProductoFormValores = {
  nombre: string;
  slug: string;
  descripcion: string;
  descripcionCorta: string;
  skuInterno: string;
  codigoBarras: string;
  proveedor: string;
  precio: string;
  precioOferta: string;
  costo: string;
  sku: string;
  borrador?: boolean;
  modoVariantes: boolean;
  categoriaId: string;
  marcaId: string;
  tipoProducto: string;
  perfilOpciones: string;
  material: string;
  cuidados: string;
  guiaTallas: string;
  pesoKg: string;
  anchoCm: string;
  altoCm: string;
  largoCm: string;
  tituloSeo: string;
  descripcionSeo: string;
  activo: boolean;
  destacado: boolean;
  opciones: OpcionConfig[];
  variantes: VarianteForm[];
  imagenes: ImagenForm[];
};

const PESTAÑAS = [
  { clave: "informacion", etiqueta: "Información" },
  { clave: "precios", etiqueta: "Precios" },
  { clave: "variantes", etiqueta: "Variantes" },
  { clave: "imagenes", etiqueta: "Imágenes" },
  { clave: "envio", etiqueta: "Envío" },
  { clave: "seo", etiqueta: "SEO" },
] as const;
type Pestaña = (typeof PESTAÑAS)[number]["clave"];

let contadorClave = 0;
function nuevaClave() {
  contadorClave += 1;
  return `nueva-${contadorClave}`;
}
function varianteVacia(atributos: AtributoVariante[] = []): VarianteForm {
  return { clave: nuevaClave(), atributos, sku: "", precio: "", costo: "", cantidad: "0", stockMinimo: "0", activo: true };
}
const VACIO: ProductoFormValores = {
  nombre: "", slug: "", descripcion: "", descripcionCorta: "", skuInterno: "", codigoBarras: "", proveedor: "", precio: "", precioOferta: "", costo: "", sku: "",
  categoriaId: "", marcaId: "", tipoProducto: "", modoVariantes: true,
  perfilOpciones: "personalizado", material: "", cuidados: "", guiaTallas: "", pesoKg: "", anchoCm: "", altoCm: "", largoCm: "", tituloSeo: "", descripcionSeo: "",
  activo: true, destacado: false, opciones: [],
  variantes: [], imagenes: [],
};

const CODIGOS_COLOR: Record<string, string> = {
  negro: "NG", blanco: "BL", gris: "GR", plomo: "PL", azul: "AZ",
  rojo: "RJ", rosado: "RS", verde: "VE", amarillo: "AM", beige: "BG",
  marron: "MR", morado: "MO",
};
const CODIGOS_DISENO: Record<string, string> = {
  lisa: "LI", liso: "LI", rayas: "RY", puntos: "PT", flores: "FL",
  caricatura: "CA", estampado: "ES", deportivo: "DP", animalitos: "AN",
  personajes: "PJ", encaje: "EN", floral: "FL",
};

function claveNormalizada(valor: string) {
  return slugificar(valor).replaceAll("-", "");
}

function codigoSkuAtributo(clave: string, valor: string) {
  const normalizado = claveNormalizada(valor);
  if (clave === "color" && CODIGOS_COLOR[normalizado]) return CODIGOS_COLOR[normalizado];
  if (clave === "diseno" && CODIGOS_DISENO[normalizado]) return CODIGOS_DISENO[normalizado];

  // Para tallas, edades y contornos numéricos se conservan los dos primeros
  // dígitos: 40–45 → 40, 35–40 → 35.
  if (["talla", "edad", "contorno"].includes(clave)) {
    const numero = valor.match(/\d{1,2}/)?.[0];
    if (numero) return numero.padStart(2, "0");
  }

  return normalizado.toUpperCase().slice(0, 2) || "XX";
}

function skuParaVariante(skuBase: string, atributos: AtributoVariante[]) {
  const prioridad = ["talla", "edad", "contorno", "copa", "color", "diseno"];
  const ordenados = [...atributos].sort((a, b) => {
    const posicionA = prioridad.indexOf(a.clave);
    const posicionB = prioridad.indexOf(b.clave);
    return (posicionA === -1 ? 99 : posicionA) - (posicionB === -1 ? 99 : posicionB);
  });
  const codigos = ordenados.map(({ clave, valor }) => codigoSkuAtributo(clave, valor));
  return [skuBase, ...codigos].join("-");
}
function calcularMargen(precio: string | number, costo: string | number) {
  const precioNumero = Number(precio);
  const costoNumero = Number(costo);
  if (!precioNumero || costo === "" || Number.isNaN(costoNumero)) return null;
  return ((precioNumero - costoNumero) / precioNumero) * 100;
}

function etiquetaValorOpcion(opcion: OpcionConfig, valor: string) {
  const esColor = opcion.tipo === "COLOR" || opcion.clave === "color";
  return esColor ? opcion.valoresHex?.[valor] ?? valor : valor;
}

function esOpcionColor(opcion: OpcionConfig) {
  return opcion.tipo === "COLOR" || opcion.clave === "color";
}

function colorDeValor(opcion: OpcionConfig, valor: string) {
  const hexadecimal = opcion.valoresHex?.[valor] ?? (/^#[0-9A-Fa-f]{6}$/.test(valor) ? valor : COLORES_POR_NOMBRE[valor.toLocaleLowerCase("es")]);
  return /^#[0-9A-Fa-f]{6}$/.test(hexadecimal) ? hexadecimal : "#6B7280";
}

export function ProductoForm({ categorias, marcas, atributosCatalogo, productoId, valoresIniciales }: {
  categorias: Opcion[]; marcas: Opcion[]; atributosCatalogo: AtributoCatalogo[]; productoId?: string; valoresIniciales?: ProductoFormValores;
}) {
  const router = useRouter();
  const esBorradorInicial = Boolean(valoresIniciales?.borrador);
  const [pendiente, iniciarTransicion] = useTransition();
  const [form, setForm] = useState<ProductoFormValores>(() => {
    if (!valoresIniciales) return VACIO;
    const base = {
      ...valoresIniciales,
      sku: valoresIniciales.sku,
      slug: valoresIniciales.borrador ? slugificar(valoresIniciales.nombre) : valoresIniciales.slug,
      opciones: valoresIniciales.opciones.map((opcion) => {
        const atributoCatalogo = atributosCatalogo.find((atributo) => atributo.clave === opcion.clave);
        return {
          ...opcion,
          tipo: atributoCatalogo?.tipo ?? opcion.tipo,
          catalogo: Boolean(atributoCatalogo),
          sugeridos: atributoCatalogo?.valores ?? opcion.sugeridos ?? opcion.valores,
          valoresHex: atributoCatalogo?.valoresHex ?? opcion.valoresHex,
        };
      }),
      variantes: valoresIniciales.variantes.map((variante) => ({
        ...variante,
        sku: skuParaVariante(valoresIniciales.sku, variante.atributos),
      })),
    };
    return base;
  });
  const [pestaña, setPestaña] = useState<Pestaña>("informacion");
  const [slugManual, setSlugManual] = useState(Boolean(valoresIniciales) && !esBorradorInicial);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [atributoSeleccionado, setAtributoSeleccionado] = useState("");
  const [opcionAbierta, setOpcionAbierta] = useState<number | null>(null);
  const inputArchivo = useRef<HTMLInputElement>(null);
  const combinacionesPosibles = useMemo(() => combinacionesOpciones(form.opciones).length, [form.opciones]);
  const margenBase = calcularMargen(form.precioOferta || form.precio, form.costo);
  const stockTotal = form.variantes.reduce((total, variante) => total + Number(variante.cantidad || 0), 0);

  function actualizar<C extends keyof ProductoFormValores>(campo: C, valor: ProductoFormValores[C]) {
    setForm((previo) => ({ ...previo, [campo]: valor }));
  }
  function alternarValor(indice: number, valor: string) {
    setForm((previo) => ({
      ...previo,
      opciones: previo.opciones.map((opcion, posicion) => {
        if (posicion !== indice) return opcion;
        return opcion.valores.includes(valor)
          ? { ...opcion, valores: opcion.valores.filter((actual) => actual !== valor) }
          : { ...opcion, valores: [...opcion.valores, valor] };
      }),
    }));
  }
  function actualizarNombreOpcion(indice: number, nombre: string) {
    const claveAnterior = form.opciones[indice].clave;
    const clave = normalizarClaveOpcion(nombre);
    setForm((previo) => ({
      ...previo,
      opciones: previo.opciones.map((opcion, posicion) => posicion === indice ? { ...opcion, nombre, clave } : opcion),
      variantes: previo.variantes.map((variante) => ({ ...variante, atributos: variante.atributos.map((atributo) => atributo.clave === claveAnterior ? { ...atributo, clave } : atributo) })),
    }));
  }
  function agregarAtributoCatalogo() {
    const atributo = atributosCatalogo.find((actual) => actual.id === atributoSeleccionado);
    if (!atributo) return;
    if (form.opciones.some((opcion) => opcion.clave === atributo.clave)) {
      setError(`${atributo.nombre} ya está configurado en este producto`);
      return;
    }
    setError(null);
    setForm((previo) => ({
      ...previo,
      perfilOpciones: "personalizado",
      opciones: [...previo.opciones, { clave: atributo.clave, nombre: atributo.nombre, tipo: atributo.tipo, catalogo: true, sugeridos: atributo.valores, valoresHex: atributo.valoresHex, valores: [] }],
      variantes: [],
    }));
    setOpcionAbierta(form.opciones.length);
    setAtributoSeleccionado("");
  }
  function quitarOpcion(indice: number) {
    const clave = form.opciones[indice].clave;
    setForm((previo) => ({ ...previo, perfilOpciones: "personalizado", opciones: previo.opciones.filter((_, posicion) => posicion !== indice), variantes: previo.variantes.map((variante) => ({ ...variante, atributos: variante.atributos.filter((atributo) => atributo.clave !== clave) })) }));
  }
  function generarCombinaciones() {
    const combinaciones = combinacionesOpciones(form.opciones);
    if (combinaciones.length === 0) return setError("Cada opción necesita al menos un valor antes de generar variantes");
    if (combinaciones.length > 250) return setError("La combinación genera más de 250 variantes; reduce sus valores");
    setError(null);
    setForm((previo) => {
      const existentes = new Map(previo.variantes.map((variante) => [claveAtributos(variante.atributos), variante]));
      const variantes = combinaciones.map((atributos) => {
        const existente = existentes.get(claveAtributos(atributos));
        return existente
          ? { ...existente, sku: skuParaVariante(previo.sku, atributos) }
          : { ...varianteVacia(atributos), sku: skuParaVariante(previo.sku, atributos) };
      });
      return { ...previo, variantes };
    });
  }
  function actualizarVariante(clave: string, campo: Exclude<keyof VarianteForm, "atributos">, valor: string | boolean) {
    setForm((previo) => ({ ...previo, variantes: previo.variantes.map((variante) => variante.clave === clave ? { ...variante, [campo]: valor } : variante) }));
  }
  function actualizarAtributoVariante(claveVariante: string, claveOpcion: string, valor: string) {
    setForm((previo) => ({
      ...previo,
      variantes: previo.variantes.map((variante) => {
        if (variante.clave !== claveVariante) return variante;
        const atributos = variante.atributos.map((atributo) => atributo.clave === claveOpcion ? { ...atributo, valor } : atributo);
        return { ...variante, atributos, sku: skuParaVariante(previo.sku, atributos) };
      }),
    }));
  }
  function quitarVariante(clave: string) {
    setForm((previo) => ({ ...previo, variantes: previo.variantes.filter((variante) => variante.clave !== clave) }));
  }
  function agregarVarianteManual() {
    const opcionSinValores = form.opciones.find((opcion) => opcion.valores.length === 0);
    if (opcionSinValores) {
      setError(`Agrega al menos un valor para ${opcionSinValores.nombre} en Producto base`);
      return;
    }

    const atributos = form.opciones.map((opcion) => ({ clave: opcion.clave, valor: opcion.valores[0] }));
    setError(null);
    setForm((previo) => ({
      ...previo,
      variantes: [
        ...previo.variantes,
        { ...varianteVacia(atributos), sku: skuParaVariante(previo.sku, atributos) },
      ],
    }));
  }
  function regenerarSkusVariantes() {
    setForm((previo) => ({
      ...previo,
      variantes: previo.variantes.map((variante) => ({
        ...variante,
        sku: skuParaVariante(previo.sku, variante.atributos),
      })),
    }));
  }

  async function onSeleccionarArchivos(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(evento.target.files ?? []);
    if (archivos.length === 0) return;
    setError(null); setSubiendo(true);
    for (const archivo of archivos) {
      const formData = new FormData(); formData.append("archivo", archivo);
      const resultado = await subirImagenProducto(formData);
      if (!resultado.ok) { setError(resultado.error); break; }
      setForm((previo) => ({ ...previo, imagenes: [...previo.imagenes, resultado.datos] }));
    }
    setSubiendo(false); if (inputArchivo.current) inputArchivo.current.value = "";
  }
  function moverImagen(indice: number, direccion: -1 | 1) {
    setForm((previo) => { const destino = indice + direccion; if (destino < 0 || destino >= previo.imagenes.length) return previo; const imagenes = [...previo.imagenes]; [imagenes[indice], imagenes[destino]] = [imagenes[destino], imagenes[indice]]; return { ...previo, imagenes }; });
  }
  function quitarImagen(publicId: string) {
    setForm((previo) => ({ ...previo, imagenes: previo.imagenes.filter((imagen) => imagen.publicId !== publicId) }));
  }
  function onSubmit(evento: React.FormEvent) {
    evento.preventDefault(); setError(null);
    const datos = {
      ...form,
      opciones: form.opciones.map(({ clave, nombre, valores }) => ({ clave, nombre, valores })),
      variantes: form.variantes.map(({ id, atributos, precio, costo, cantidad, stockMinimo, activo }) => ({
        id,
        atributos,
        sku: skuParaVariante(form.sku, atributos),
        precio,
        costo,
        cantidad,
        stockMinimo,
        activo,
      })),
    };
    iniciarTransicion(async () => {
      const resultado = productoId ? await actualizarProducto(productoId, datos) : await crearProducto(datos);
      if (!resultado.ok) return setError(resultado.error);
      router.push("/admin/productos"); router.refresh();
    });
  }

  if (categorias.length === 0) return <p className={styles.vacio}>Primero crea una categoría para registrar productos.</p>;

  return (
    <form className={`${styles.form} ${styles.formAncho}`} onSubmit={onSubmit}>
      {error && <p className={styles.mensajeError}>{error}</p>}
      <div className={styles.diseñoColumnas}>
        <div className={styles.columna}>
          <div className={styles.bloque}>
            <div className={styles.productoContexto}>
              {form.imagenes[0] ? <Image src={form.imagenes[0].url} alt="" width={56} height={56} unoptimized className={styles.productoContextoImagen} /> : <div className={styles.productoContextoImagenVacia} aria-hidden="true" />}
              <div className={styles.productoContextoDatos}>
                <strong>{form.nombre || "Producto nuevo"}</strong>
                <span>{form.sku || "Sin SKU"} · {form.tipoProducto || "Sin tipo"}</span>
              </div>
              <span className={styles.productoContextoPrecio}>{form.precio ? formatearPrecio(form.precio) : "S/ —"}</span>
            </div>
            <div className={styles.pestañas}>
              {PESTAÑAS.map((opcion) => <button key={opcion.clave} type="button" className={opcion.clave === pestaña ? `${styles.pestaña} ${styles.pestañaActiva}` : styles.pestaña} onClick={() => setPestaña(opcion.clave)}>{opcion.etiqueta}</button>)}
            </div>

            {pestaña === "informacion" && <>
              <div className={styles.fila}>
                <label className={styles.campo}><span className={styles.etiqueta}>Nombre</span><input className={styles.control} value={form.nombre} required onChange={(evento) => { const nombre = evento.target.value; setForm((previo) => ({ ...previo, nombre, slug: slugManual ? previo.slug : slugificar(nombre) })); }} /></label>
                <label className={styles.campo}><span className={styles.etiqueta}>Slug (URL)</span><input className={styles.control} value={form.slug} required onChange={(evento) => { setSlugManual(true); actualizar("slug", evento.target.value); }} /></label>
              </div>
              <div className={styles.fila}>
                <label className={styles.campo}><span className={styles.etiqueta}>SKU base (automático)</span><input className={styles.control} value={form.sku} readOnly /></label>
                <label className={styles.campo}><span className={styles.etiqueta}>SKU interno</span><input className={styles.control} value={form.skuInterno} placeholder="Código interno de almacén" onChange={(evento) => actualizar("skuInterno", evento.target.value)} /></label>
              </div>
              <div className={styles.fila}>
                <label className={styles.campo}><span className={styles.etiqueta}>Categoría</span><SelectConFlecha className={styles.control} value={form.categoriaId} required onChange={(evento) => actualizar("categoriaId", evento.target.value)}><option value="">Selecciona una categoría</option>{categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}</SelectConFlecha></label>
                <label className={styles.campo}><span className={styles.etiqueta}>Marca (opcional)</span><SelectConFlecha className={styles.control} value={form.marcaId} onChange={(evento) => actualizar("marcaId", evento.target.value)}><option value="">Sin marca</option>{marcas.map((marca) => <option key={marca.id} value={marca.id}>{marca.nombre}</option>)}</SelectConFlecha></label>
              </div>
              <div className={styles.fila}>
                <label className={styles.campo}><span className={styles.etiqueta}>Código de barras</span><input className={styles.control} value={form.codigoBarras} placeholder="EAN, UPC o código propio" onChange={(evento) => actualizar("codigoBarras", evento.target.value)} /></label>
                <label className={styles.campo}><span className={styles.etiqueta}>Proveedor</span><input className={styles.control} value={form.proveedor} placeholder="Nombre del proveedor" onChange={(evento) => actualizar("proveedor", evento.target.value)} /></label>
              </div>
              <div className={styles.fila}>
                <label className={styles.campo}><span className={styles.etiqueta}>Descripción</span><textarea className={`${styles.control} ${styles.textarea}`} value={form.descripcion} required onChange={(evento) => actualizar("descripcion", evento.target.value)} /></label>
                <label className={styles.campo}><span className={styles.etiqueta}>Descripción corta</span><textarea className={`${styles.control} ${styles.textarea}`} value={form.descripcionCorta} maxLength={180} placeholder="Resumen breve para la tarjeta" onChange={(evento) => actualizar("descripcionCorta", evento.target.value)} /></label>
              </div>
            </>}

            {pestaña === "variantes" && <>
              <p className={styles.bloqueAyuda}>Selecciona atributos registrados en el catálogo y agrega sus valores antes de crear las combinaciones.</p>
              {atributosCatalogo.length === 0 && <p className={styles.mensajeError}>Primero crea al menos un atributo desde la sección Atributos.</p>}
              {atributosCatalogo.length > 0 && <div className={styles.fila}>
                <label className={styles.campo}><span className={styles.etiqueta}>Atributo registrado</span><SelectConFlecha className={styles.control} value={atributoSeleccionado} onChange={(evento) => setAtributoSeleccionado(evento.target.value)}><option value="">Seleccionar atributo</option>{atributosCatalogo.map((atributo) => <option key={atributo.id} value={atributo.id}>{atributo.nombre}</option>)}</SelectConFlecha></label>
                <div className={styles.campo}><span className={styles.etiqueta}> </span><button type="button" className={styles.botonSecundario} disabled={!atributoSeleccionado} onClick={agregarAtributoCatalogo}>Usar atributo</button></div>
              </div>}
              <div className={styles.opcionesConfig}>
                {form.opciones.map((opcion, indice) => <details key={indice} className={styles.opcionEditor} open={opcionAbierta === indice}>
                  <summary className={styles.opcionResumen} onClick={(evento) => { evento.preventDefault(); setOpcionAbierta((actual) => actual === indice ? null : indice); }}>
                    <span className={styles.opcionResumenNombre}>{opcion.nombre}</span>
                    <span className={styles.opcionResumenValores}>{opcion.valores.length > 0 ? esOpcionColor(opcion) ? <span className={styles.resumenColores}>{opcion.valores.map((valor) => <span key={valor} className={styles.puntoColor} style={{ backgroundColor: colorDeValor(opcion, valor) }} title={`${valor} · ${colorDeValor(opcion, valor)}`} aria-label={`${valor} · ${colorDeValor(opcion, valor)}`} />)}</span> : opcion.valores.join(", ") : "Sin valores"}</span>
                    <span className={styles.opcionResumenFlecha} aria-hidden="true"><IconoFlecha /></span>
                  </summary>
                  <div className={styles.opcionContenido}>
                    <div className={styles.opcionCabecera}>
                      <label className={styles.campo}><span className={styles.etiqueta}>Nombre de la opción</span><input className={styles.control} value={opcion.nombre} readOnly={opcion.catalogo} onChange={(evento) => actualizarNombreOpcion(indice, evento.target.value)} placeholder="Talla" /></label>
                      {(opcion.tipo === "COLOR" || opcion.clave === "color") ? <div className={styles.campo}><span className={styles.etiqueta}>Valores registrados</span><span className={styles.colorSeleccionResumen}>{opcion.valores.length ? `${opcion.valores.length} seleccionado(s)` : "Selecciona colores"}</span></div> : <label className={styles.campo}><span className={styles.etiqueta}>Agregar {opcion.nombre.toLocaleLowerCase("es")}</span><SelectConFlecha className={styles.control} value="" onChange={(evento) => { if (evento.target.value) alternarValor(indice, evento.target.value); }} aria-label={`Agregar valor registrado de ${opcion.nombre}`}><option value="">Seleccionar valor</option>{[...new Set([...(opcion.sugeridos ?? []), ...opcion.valores])].map((valor) => <option key={valor} value={valor}>{opcion.valores.includes(valor) ? `Quitar ${valor}` : valor}</option>)}</SelectConFlecha></label>}
                      {form.opciones.length > 1 && <button type="button" className={styles.botonIcono} onClick={() => quitarOpcion(indice)} aria-label={`Quitar opción ${opcion.nombre}`} title="Quitar opción"><IconoEliminar /></button>}
                    </div>
                    <div className={styles.opcionValores}>
                      <div className={styles.campo}><span className={styles.etiqueta}>Valores seleccionados</span><div className={styles.valoresSeleccionados}>
                        {opcion.valores.length === 0 ? <span className={styles.valoresVacios}>Ninguno seleccionado</span> : opcion.valores.map((valor) => <button key={valor} type="button" className={esOpcionColor(opcion) ? styles.valorColorSeleccionado : styles.valorSeleccionado} onClick={() => alternarValor(indice, valor)} aria-label={`Quitar ${valor}`} title={`Quitar ${valor} · ${colorDeValor(opcion, valor)}`}>{esOpcionColor(opcion) ? <span className={styles.muestraSeleccionada} style={{ backgroundColor: colorDeValor(opcion, valor) }} aria-hidden="true" /> : etiquetaValorOpcion(opcion, valor)}<span aria-hidden="true">×</span></button>)}
                      </div></div>
                      {(opcion.tipo === "COLOR" || opcion.clave === "color") ? <div className={styles.paletaColores} aria-label="Colores registrados">
                        {(opcion.sugeridos ?? []).map((valor) => { const hex = colorDeValor(opcion, valor); return <button key={valor} type="button" className={opcion.valores.includes(valor) ? `${styles.muestraColorHex} ${styles.muestraColorHexActiva}` : styles.muestraColorHex} style={{ "--color-muestra": hex } as React.CSSProperties} onClick={() => alternarValor(indice, valor)} aria-pressed={opcion.valores.includes(valor)} title={`${valor} · ${hex}`} aria-label={`${hex} (${valor})`} />; })}
                      </div> : <p className={styles.ayudaValores}>Selecciona únicamente valores registrados en Atributos.</p>}
                    </div>
                  </div>
                </details>)}
              </div>
            </>}

            {pestaña === "variantes" && <>
              <p className={styles.bloqueAyuda}>Crea las combinaciones que se venderán. Cada variante tendrá su propio SKU, stock, precio y estado.</p>
              <div className={styles.resumenBase}>
                <div><span>Producto base</span><strong>{form.nombre || "Producto sin nombre"}</strong></div>
                <div><span>SKU base</span><strong>{form.sku || "—"}</strong></div>
                <div><span>Combinaciones posibles</span><strong>{combinacionesPosibles}</strong></div>
              </div>
              <div className={styles.botones}><button type="button" className={styles.boton} onClick={generarCombinaciones}>Generar {combinacionesPosibles || ""} combinaciones</button><button type="button" className={styles.botonSecundario} onClick={agregarVarianteManual}>Agregar variante</button><button type="button" className={styles.botonSecundario} onClick={regenerarSkusVariantes} disabled={form.variantes.length === 0}>Regenerar SKU</button></div>
            </>}

            {pestaña === "precios" && <>
              <p className={styles.bloqueAyuda}>El costo permite calcular ganancia y margen. Una variante puede sobrescribir ambos valores.</p>
              <div className={styles.fila}>
                <label className={styles.campo}><span className={styles.etiqueta}>Precio de venta (S/)</span><input className={styles.control} type="number" step="0.01" min="0" value={form.precio} required onChange={(evento) => actualizar("precio", evento.target.value)} /></label>
                <label className={styles.campo}><span className={styles.etiqueta}>Costo base (S/)</span><input className={styles.control} type="number" step="0.01" min="0" value={form.costo} onChange={(evento) => actualizar("costo", evento.target.value)} /></label>
              </div>
              <label className={styles.campo}><span className={styles.etiqueta}>Precio de oferta (opcional)</span><input className={styles.control} type="number" step="0.01" min="0" value={form.precioOferta} onChange={(evento) => actualizar("precioOferta", evento.target.value)} /></label>
              {margenBase !== null && <div className={styles.resumenMargen}><span>Ganancia base: {formatearPrecio(Number(form.precioOferta || form.precio) - Number(form.costo))}</span><strong className={margenBase >= 0 ? styles.margenPositivo : styles.margenNegativo}>Margen {margenBase.toFixed(1)}%</strong></div>}
              <h3 className={styles.bloqueTitulo}>Ajustes por variante</h3>
              <div className={styles.tablaWrap}><table className={styles.variantes}><thead><tr><th>Variante</th><th>Precio propio</th><th>Costo propio</th><th>Margen</th></tr></thead><tbody>
                {form.variantes.map((variante) => { const precio = variante.precio || form.precioOferta || form.precio; const costo = variante.costo || form.costo; const margen = calcularMargen(precio, costo); return <tr key={variante.clave}><td>{etiquetaAtributos(variante.atributos)}</td><td><input className={styles.control} type="number" step="0.01" min="0" placeholder={form.precio || "—"} value={variante.precio} onChange={(evento) => actualizarVariante(variante.clave, "precio", evento.target.value)} /></td><td><input className={styles.control} type="number" step="0.01" min="0" placeholder={form.costo || "—"} value={variante.costo} onChange={(evento) => actualizarVariante(variante.clave, "costo", evento.target.value)} /></td><td className={margen !== null && margen < 0 ? styles.margenNegativo : styles.margenPositivo}>{margen === null ? "—" : `${margen.toFixed(1)}%`}</td></tr>; })}
              </tbody></table></div>
            </>}

            {pestaña === "imagenes" && <>
              <p className={styles.bloqueAyuda}>La primera imagen es la portada. Máximo 5 MB por imagen.</p>
              <input ref={inputArchivo} type="file" accept="image/*" multiple disabled={subiendo} onChange={onSeleccionarArchivos} />
              {subiendo && <p className={styles.bloqueAyuda}>Subiendo imágenes...</p>}
              {form.imagenes.length > 0 && <div className={styles.galeria}>{form.imagenes.map((imagen, indice) => <div key={imagen.publicId} className={styles.miniatura}><Image className={styles.miniaturaImagen} src={imagen.url} alt="" width={160} height={112} unoptimized /><div className={styles.miniaturaBarra}><span className={styles.portada}>{indice === 0 ? "Portada" : indice + 1}</span><span><button type="button" className={styles.miniaturaBoton} disabled={indice === 0} onClick={() => moverImagen(indice, -1)} aria-label="Mover a la izquierda">←</button><button type="button" className={styles.miniaturaBoton} disabled={indice === form.imagenes.length - 1} onClick={() => moverImagen(indice, 1)} aria-label="Mover a la derecha">→</button><button type="button" className={styles.miniaturaBoton} onClick={() => quitarImagen(imagen.publicId)} aria-label="Quitar imagen">✕</button></span></div></div>)}</div>}
            </>}

            {pestaña === "envio" && <>
              <p className={styles.bloqueAyuda}>Completa estos datos cuando el costo o la tarifa de entrega dependan del producto.</p>
              <label className={styles.campo}><span className={styles.etiqueta}>Peso (kg)</span><input className={styles.control} type="number" min="0" step="0.001" value={form.pesoKg} placeholder="0.500" onChange={(evento) => actualizar("pesoKg", evento.target.value)} /></label>
              <div className={styles.fila}>
                <label className={styles.campo}><span className={styles.etiqueta}>Largo (cm)</span><input className={styles.control} type="number" min="0" step="0.01" value={form.largoCm} onChange={(evento) => actualizar("largoCm", evento.target.value)} /></label>
                <label className={styles.campo}><span className={styles.etiqueta}>Ancho (cm)</span><input className={styles.control} type="number" min="0" step="0.01" value={form.anchoCm} onChange={(evento) => actualizar("anchoCm", evento.target.value)} /></label>
              </div>
              <label className={styles.campo}><span className={styles.etiqueta}>Alto (cm)</span><input className={styles.control} type="number" min="0" step="0.01" value={form.altoCm} onChange={(evento) => actualizar("altoCm", evento.target.value)} /></label>
            </>}

            {pestaña === "informacion" && <>
              <p className={styles.bloqueAyuda}>Estos datos reducen devoluciones y consultas del cliente.</p>
              <label className={styles.campo}><span className={styles.etiqueta}>Material</span><input className={styles.control} value={form.material} placeholder="95% algodón, 5% elastano" onChange={(evento) => actualizar("material", evento.target.value)} /></label>
              <label className={styles.campo}><span className={styles.etiqueta}>Cuidados</span><input className={styles.control} value={form.cuidados} placeholder="Lavar a máquina en frío" onChange={(evento) => actualizar("cuidados", evento.target.value)} /></label>
              <label className={styles.campo}><span className={styles.etiqueta}>Guía de tallas</span><textarea className={`${styles.control} ${styles.textarea}`} value={form.guiaTallas} placeholder="M: pecho 97–101 cm" onChange={(evento) => actualizar("guiaTallas", evento.target.value)} /></label>
            </>}

            {pestaña === "seo" && <><p className={styles.bloqueAyuda}>Define cómo se muestra el producto en la tienda y en los resultados de búsqueda.</p><label className={styles.campo}><span className={styles.etiqueta}>Título SEO</span><input className={styles.control} maxLength={60} value={form.tituloSeo} placeholder={form.nombre} onChange={(evento) => actualizar("tituloSeo", evento.target.value)} /></label><label className={styles.campo}><span className={styles.etiqueta}>Descripción SEO</span><textarea className={`${styles.control} ${styles.textarea}`} maxLength={160} value={form.descripcionSeo} placeholder={form.descripcionCorta || "Resumen para resultados de búsqueda"} onChange={(evento) => actualizar("descripcionSeo", evento.target.value)} /></label><div className={`${styles.campo} ${styles.checkbox}`}><button type="button" className={`${styles.switch} ${form.activo ? styles.switchActivo : ""}`} role="switch" aria-checked={form.activo} onClick={() => actualizar("activo", !form.activo)}><span className={styles.switchPunto} aria-hidden="true" /></button><span className={styles.etiqueta}>Visible en la tienda</span></div><div className={`${styles.campo} ${styles.checkbox}`}><button type="button" className={`${styles.switch} ${form.destacado ? styles.switchActivo : ""}`} role="switch" aria-checked={form.destacado} onClick={() => actualizar("destacado", !form.destacado)}><span className={styles.switchPunto} aria-hidden="true" /></button><span className={styles.etiqueta}>Destacado en la portada</span></div></>}
          </div>
        </div>

        <div className={styles.columna}>
          <h2 className={styles.previewTitulo}>Vista previa</h2>
          <div className={styles.bloque}>
            <div className={styles.previewCard}>{form.imagenes[0] ? <Image src={form.imagenes[0].url} alt="" width={320} height={320} unoptimized className={styles.previewCardImagen} /> : <div className={styles.previewCardImagenVacia} aria-hidden />}<div className={styles.previewCardCuerpo}>{form.destacado && <span className={styles.badge}>Destacado</span>}<p className={styles.previewCardNombre}>{form.nombre || "Nombre del producto"}</p><div className={styles.previewCardEtiquetas}><span>{form.categoriaId ? categorias.find((categoria) => categoria.id === form.categoriaId)?.nombre : "Sin categoría"}</span>{form.marcaId && <span>{marcas.find((marca) => marca.id === form.marcaId)?.nombre}</span>}</div><p className={styles.previewCardDescripcion}>{form.descripcionCorta || form.descripcion || "Agrega una descripción para mostrarla aquí."}</p><div className={styles.previewCardDatos}><span>SKU <strong>{form.sku || "—"}</strong></span><span>Stock <strong>{stockTotal}</strong></span><span>Variantes <strong>{form.variantes.length}</strong></span></div><p className={styles.previewCardPrecio}>{form.precioOferta ? <><span className={styles.previewCardPrecioTachado}>{formatearPrecio(form.precio || 0)}</span><span>{formatearPrecio(form.precioOferta)}</span></> : <span>{form.precio ? formatearPrecio(form.precio) : "S/ —"}</span>}</p></div></div>
          </div>
        </div>
        {pestaña === "variantes" && <div className={`${styles.bloque} ${styles.variantesBloque}`}>
          <div className={styles.variantesCabecera}>
            <h2 className={styles.bloqueTitulo}>Variantes del producto</h2>
            <p className={styles.bloqueAyuda}>{form.variantes.length} variante(s) configurada(s). Ajusta aquí SKU, stock y estado.</p>
          </div>
          <div className={styles.tablaWrap}><table className={styles.variantes}><thead><tr>{form.opciones.map((opcion) => <th key={opcion.clave} className={opcion.clave === "color" ? styles.columnaColor : opcion.clave === "diseno" ? styles.columnaDiseno : undefined}>{opcion.nombre}</th>)}<th className={styles.columnaSku}>SKU</th><th className={styles.columnaStock}>Stock</th><th>Mínimo</th><th>Activa</th><th /></tr></thead><tbody>
            {form.variantes.map((variante) => <tr key={variante.clave}>
              {form.opciones.map((opcion) => <td key={opcion.clave} className={opcion.clave === "color" ? styles.columnaColor : opcion.clave === "diseno" ? styles.columnaDiseno : undefined}><SelectConFlecha className={styles.control} value={variante.atributos.find((atributo) => atributo.clave === opcion.clave)?.valor ?? ""} onChange={(evento) => actualizarAtributoVariante(variante.clave, opcion.clave, evento.target.value)}>{opcion.valores.map((valor) => <option key={valor} value={valor}>{valor}</option>)}</SelectConFlecha></td>)}
              <td className={styles.columnaSku}><input className={styles.control} value={variante.sku} required onChange={(evento) => actualizarVariante(variante.clave, "sku", evento.target.value)} /></td>
              <td className={styles.columnaStock}><input className={styles.control} type="number" min="0" value={variante.cantidad} required onChange={(evento) => actualizarVariante(variante.clave, "cantidad", evento.target.value)} /></td>
              <td><input className={styles.control} type="number" min="0" value={variante.stockMinimo} required onChange={(evento) => actualizarVariante(variante.clave, "stockMinimo", evento.target.value)} /></td>
              <td><button type="button" className={`${styles.switch} ${variante.activo ? styles.switchActivo : ""}`} role="switch" aria-checked={variante.activo} onClick={() => actualizarVariante(variante.clave, "activo", !variante.activo)}><span className={styles.switchPunto} aria-hidden="true" /></button></td>
              <td><button type="button" className={styles.miniaturaBoton} disabled={form.variantes.length === 1} onClick={() => quitarVariante(variante.clave)} aria-label="Quitar variante">✕</button></td>
            </tr>)}
          </tbody></table></div>
        </div>}
      </div>

      <div className={styles.botones}><button type="submit" className={styles.boton} disabled={pendiente || subiendo}>{pendiente ? "Guardando..." : productoId ? "Guardar cambios" : "Crear producto"}</button><button type="button" className={styles.botonSecundario} onClick={() => router.push("/admin/productos")}>Cancelar</button></div>
    </form>
  );
}
