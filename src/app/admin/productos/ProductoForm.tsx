"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  actualizarProducto,
  crearProducto,
  subirImagenProducto,
} from "@/features/catalogo/actions";
import { slugificar } from "@/lib/utils";
import styles from "../admin.module.css";

type Opcion = { id: string; nombre: string };

export type ImagenForm = { url: string; publicId: string };

export type VarianteForm = {
  clave: string; // solo para React; no viaja al servidor
  id?: string;
  talla: string;
  color: string;
  sku: string;
  precio: string;
  cantidad: string;
  stockMinimo: string;
  activo: boolean;
};

export type ProductoFormValores = {
  nombre: string;
  slug: string;
  descripcion: string;
  precio: string;
  precioOferta: string;
  sku: string;
  categoriaId: string;
  marcaId: string;
  material: string;
  cuidados: string;
  guiaTallas: string;
  activo: boolean;
  destacado: boolean;
  variantes: VarianteForm[];
  imagenes: ImagenForm[];
};

const TALLAS_RAPIDAS = ["XS", "S", "M", "L", "XL", "XXL"];

// Contador (y no randomUUID) para que el render del servidor y el del cliente
// generen la misma clave y no haya desajuste al hidratar.
let contadorClave = 0;

function varianteVacia(): VarianteForm {
  contadorClave += 1;
  return {
    clave: `nueva-${contadorClave}`,
    talla: "",
    color: "",
    sku: "",
    precio: "",
    cantidad: "0",
    stockMinimo: "0",
    activo: true,
  };
}

const VACIO: ProductoFormValores = {
  nombre: "",
  slug: "",
  descripcion: "",
  precio: "",
  precioOferta: "",
  sku: "",
  categoriaId: "",
  marcaId: "",
  material: "",
  cuidados: "",
  guiaTallas: "",
  activo: true,
  destacado: false,
  variantes: [],
  imagenes: [],
};

export function ProductoForm({
  categorias,
  marcas,
  productoId,
  valoresIniciales,
}: {
  categorias: Opcion[];
  marcas: Opcion[];
  productoId?: string;
  valoresIniciales?: ProductoFormValores;
}) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [form, setForm] = useState<ProductoFormValores>(
    valoresIniciales ?? { ...VACIO, variantes: [varianteVacia()] },
  );
  const [slugManual, setSlugManual] = useState(Boolean(valoresIniciales));
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputArchivo = useRef<HTMLInputElement>(null);

  function actualizar<C extends keyof ProductoFormValores>(
    campo: C,
    valor: ProductoFormValores[C],
  ) {
    setForm((previo) => ({ ...previo, [campo]: valor }));
  }

  // ── Variantes ───────────────────────────────────────────

  function generarSku(talla: string, color: string) {
    const partes = [form.sku || slugificar(form.nombre).toUpperCase(), talla, color];
    return partes
      .filter(Boolean)
      .map((parte) => slugificar(parte).toUpperCase())
      .join("-");
  }

  function actualizarVariante(clave: string, campo: keyof VarianteForm, valor: string | boolean) {
    setForm((previo) => ({
      ...previo,
      variantes: previo.variantes.map((variante) =>
        variante.clave === clave ? { ...variante, [campo]: valor } : variante,
      ),
    }));
  }

  function agregarVariante(talla = "") {
    setForm((previo) => {
      // Evita duplicar una talla que ya está en la lista sin color.
      if (talla && previo.variantes.some((v) => v.talla === talla && !v.color)) return previo;

      return {
        ...previo,
        variantes: [
          ...previo.variantes,
          { ...varianteVacia(), talla, sku: talla ? generarSku(talla, "") : "" },
        ],
      };
    });
  }

  function quitarVariante(clave: string) {
    setForm((previo) => ({
      ...previo,
      variantes: previo.variantes.filter((variante) => variante.clave !== clave),
    }));
  }

  // ── Imágenes ────────────────────────────────────────────

  async function onSeleccionarArchivos(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(evento.target.files ?? []);
    if (archivos.length === 0) return;

    setError(null);
    setSubiendo(true);

    for (const archivo of archivos) {
      const formData = new FormData();
      formData.append("archivo", archivo);

      const resultado = await subirImagenProducto(formData);
      if (!resultado.ok) {
        setError(resultado.error);
        break;
      }
      setForm((previo) => ({ ...previo, imagenes: [...previo.imagenes, resultado.datos] }));
    }

    setSubiendo(false);
    if (inputArchivo.current) inputArchivo.current.value = "";
  }

  function moverImagen(indice: number, direccion: -1 | 1) {
    setForm((previo) => {
      const destino = indice + direccion;
      if (destino < 0 || destino >= previo.imagenes.length) return previo;

      const imagenes = [...previo.imagenes];
      [imagenes[indice], imagenes[destino]] = [imagenes[destino], imagenes[indice]];
      return { ...previo, imagenes };
    });
  }

  function quitarImagen(publicId: string) {
    setForm((previo) => ({
      ...previo,
      imagenes: previo.imagenes.filter((imagen) => imagen.publicId !== publicId),
    }));
  }

  // ── Guardar ─────────────────────────────────────────────

  function onSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);

    // `clave` es solo para React; el servidor recibe los campos del schema.
    const datos = {
      ...form,
      variantes: form.variantes.map((variante) => ({
        id: variante.id,
        talla: variante.talla,
        color: variante.color,
        sku: variante.sku,
        precio: variante.precio,
        cantidad: variante.cantidad,
        stockMinimo: variante.stockMinimo,
        activo: variante.activo,
      })),
    };

    iniciarTransicion(async () => {
      const resultado = productoId
        ? await actualizarProducto(productoId, datos)
        : await crearProducto(datos);

      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }

      router.push("/admin/productos");
      router.refresh();
    });
  }

  if (categorias.length === 0) {
    return (
      <p className={styles.vacio}>
        Primero necesitas crear al menos una categoría para poder registrar productos.
      </p>
    );
  }

  return (
    <form className={`${styles.form} ${styles.formAncho}`} onSubmit={onSubmit}>
      {error && <p className={styles.mensajeError}>{error}</p>}

      <div className={styles.bloque}>
        <h2 className={styles.bloqueTitulo}>Datos básicos</h2>

        <div className={styles.fila}>
          <label className={styles.campo}>
            <span className={styles.etiqueta}>Nombre</span>
            <input
              className={styles.control}
              value={form.nombre}
              required
              onChange={(evento) => {
                const nombre = evento.target.value;
                setForm((previo) => ({
                  ...previo,
                  nombre,
                  slug: slugManual ? previo.slug : slugificar(nombre),
                }));
              }}
            />
          </label>

          <label className={styles.campo}>
            <span className={styles.etiqueta}>Slug (URL)</span>
            <input
              className={styles.control}
              value={form.slug}
              required
              onChange={(evento) => {
                setSlugManual(true);
                actualizar("slug", evento.target.value);
              }}
            />
          </label>
        </div>

        <label className={styles.campo}>
          <span className={styles.etiqueta}>SKU base</span>
          <input
            className={styles.control}
            value={form.sku}
            required
            onChange={(evento) => actualizar("sku", evento.target.value)}
          />
        </label>

        <label className={styles.campo}>
          <span className={styles.etiqueta}>Descripción</span>
          <textarea
            className={`${styles.control} ${styles.textarea}`}
            value={form.descripcion}
            required
            onChange={(evento) => actualizar("descripcion", evento.target.value)}
          />
        </label>
      </div>

      <div className={styles.bloque}>
        <h2 className={styles.bloqueTitulo}>Precio y clasificación</h2>
        <p className={styles.bloqueAyuda}>
          Este es el precio general; si una talla cuesta distinto, ponle su propio precio abajo.
        </p>

        <div className={styles.fila}>
          <label className={styles.campo}>
            <span className={styles.etiqueta}>Precio (S/)</span>
            <input
              className={styles.control}
              type="number"
              step="0.01"
              min="0"
              value={form.precio}
              required
              onChange={(evento) => actualizar("precio", evento.target.value)}
            />
          </label>

          <label className={styles.campo}>
            <span className={styles.etiqueta}>Precio de oferta (opcional)</span>
            <input
              className={styles.control}
              type="number"
              step="0.01"
              min="0"
              value={form.precioOferta}
              onChange={(evento) => actualizar("precioOferta", evento.target.value)}
            />
          </label>
        </div>

        <div className={styles.fila}>
          <label className={styles.campo}>
            <span className={styles.etiqueta}>Categoría</span>
            <select
              className={styles.control}
              value={form.categoriaId}
              required
              onChange={(evento) => actualizar("categoriaId", evento.target.value)}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.campo}>
            <span className={styles.etiqueta}>Marca (opcional)</span>
            <select
              className={styles.control}
              value={form.marcaId}
              onChange={(evento) => actualizar("marcaId", evento.target.value)}
            >
              <option value="">Sin marca</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className={styles.bloque}>
        <h2 className={styles.bloqueTitulo}>Fotos</h2>
        <p className={styles.bloqueAyuda}>
          La primera foto es la portada. Máximo 5 MB por imagen.
        </p>

        <input
          ref={inputArchivo}
          type="file"
          accept="image/*"
          multiple
          disabled={subiendo}
          onChange={onSeleccionarArchivos}
        />
        {subiendo && <p className={styles.bloqueAyuda}>Subiendo imágenes...</p>}

        {form.imagenes.length > 0 && (
          <div className={styles.galeria}>
            {form.imagenes.map((imagen, indice) => (
              <div key={imagen.publicId} className={styles.miniatura}>
                <Image
                  className={styles.miniaturaImagen}
                  src={imagen.url}
                  alt=""
                  width={160}
                  height={112}
                  unoptimized
                />
                <div className={styles.miniaturaBarra}>
                  <span className={styles.portada}>{indice === 0 ? "Portada" : indice + 1}</span>
                  <span>
                    <button
                      type="button"
                      className={styles.miniaturaBoton}
                      disabled={indice === 0}
                      onClick={() => moverImagen(indice, -1)}
                      aria-label="Mover a la izquierda"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className={styles.miniaturaBoton}
                      disabled={indice === form.imagenes.length - 1}
                      onClick={() => moverImagen(indice, 1)}
                      aria-label="Mover a la derecha"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      className={styles.miniaturaBoton}
                      onClick={() => quitarImagen(imagen.publicId)}
                      aria-label="Quitar imagen"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.bloque}>
        <h2 className={styles.bloqueTitulo}>Tallas y stock</h2>
        <p className={styles.bloqueAyuda}>
          Cada fila es lo que el cliente puede comprar. El stock se controla acá, por talla.
        </p>

        <div className={styles.tallasRapidas}>
          {TALLAS_RAPIDAS.map((talla) => (
            <button
              key={talla}
              type="button"
              className={styles.botonChico}
              onClick={() => agregarVariante(talla)}
            >
              + {talla}
            </button>
          ))}
          <button type="button" className={styles.botonChico} onClick={() => agregarVariante()}>
            + Personalizada
          </button>
        </div>

        <div className={styles.tablaWrap}>
          <table className={styles.variantes}>
            <thead>
              <tr>
                <th>Talla</th>
                <th>Color</th>
                <th>SKU</th>
                <th>Precio propio</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Activa</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {form.variantes.map((variante) => (
                <tr key={variante.clave}>
                  <td>
                    <input
                      className={styles.control}
                      value={variante.talla}
                      required
                      placeholder="M"
                      onChange={(evento) =>
                        actualizarVariante(variante.clave, "talla", evento.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className={styles.control}
                      value={variante.color}
                      placeholder="Negro"
                      onChange={(evento) =>
                        actualizarVariante(variante.clave, "color", evento.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className={styles.control}
                      value={variante.sku}
                      required
                      onChange={(evento) =>
                        actualizarVariante(variante.clave, "sku", evento.target.value)
                      }
                      onFocus={() => {
                        if (!variante.sku && variante.talla) {
                          actualizarVariante(
                            variante.clave,
                            "sku",
                            generarSku(variante.talla, variante.color),
                          );
                        }
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className={styles.control}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="—"
                      value={variante.precio}
                      onChange={(evento) =>
                        actualizarVariante(variante.clave, "precio", evento.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className={styles.control}
                      type="number"
                      min="0"
                      value={variante.cantidad}
                      required
                      onChange={(evento) =>
                        actualizarVariante(variante.clave, "cantidad", evento.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className={styles.control}
                      type="number"
                      min="0"
                      value={variante.stockMinimo}
                      required
                      onChange={(evento) =>
                        actualizarVariante(variante.clave, "stockMinimo", evento.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={variante.activo}
                      onChange={(evento) =>
                        actualizarVariante(variante.clave, "activo", evento.target.checked)
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.miniaturaBoton}
                      disabled={form.variantes.length === 1}
                      onClick={() => quitarVariante(variante.clave)}
                      aria-label="Quitar talla"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.bloque}>
        <h2 className={styles.bloqueTitulo}>Detalles de la prenda</h2>
        <p className={styles.bloqueAyuda}>
          Opcionales, pero reducen devoluciones y preguntas por WhatsApp.
        </p>

        <label className={styles.campo}>
          <span className={styles.etiqueta}>Material</span>
          <input
            className={styles.control}
            value={form.material}
            placeholder="95% algodón, 5% elastano"
            onChange={(evento) => actualizar("material", evento.target.value)}
          />
        </label>

        <label className={styles.campo}>
          <span className={styles.etiqueta}>Cuidados</span>
          <input
            className={styles.control}
            value={form.cuidados}
            placeholder="Lavar a máquina en frío, no usar secadora"
            onChange={(evento) => actualizar("cuidados", evento.target.value)}
          />
        </label>

        <label className={styles.campo}>
          <span className={styles.etiqueta}>Guía de tallas</span>
          <textarea
            className={`${styles.control} ${styles.textarea}`}
            value={form.guiaTallas}
            placeholder="S: pecho 92-96 cm · M: 97-101 cm · L: 102-106 cm"
            onChange={(evento) => actualizar("guiaTallas", evento.target.value)}
          />
        </label>
      </div>

      <div className={styles.bloque}>
        <h2 className={styles.bloqueTitulo}>Visibilidad</h2>

        <label className={`${styles.campo} ${styles.checkbox}`}>
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(evento) => actualizar("activo", evento.target.checked)}
          />
          <span className={styles.etiqueta}>Visible en la tienda</span>
        </label>

        <label className={`${styles.campo} ${styles.checkbox}`}>
          <input
            type="checkbox"
            checked={form.destacado}
            onChange={(evento) => actualizar("destacado", evento.target.checked)}
          />
          <span className={styles.etiqueta}>Destacado en la portada</span>
        </label>
      </div>

      <div className={styles.botones}>
        <button type="submit" className={styles.boton} disabled={pendiente || subiendo}>
          {pendiente ? "Guardando..." : productoId ? "Guardar cambios" : "Crear producto"}
        </button>
        <button
          type="button"
          className={styles.botonSecundario}
          onClick={() => router.push("/admin/productos")}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
