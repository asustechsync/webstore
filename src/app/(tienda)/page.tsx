import { listarCategorias } from "@/features/catalogo/queries/categorias";
import {
  contarProductosActivos,
  listarDestacados,
  listarNuevosIngresos,
  listarOfertas,
} from "@/features/catalogo/queries/productos";
import { Container } from "@/components/ui/Container";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Section } from "@/components/ui/Section";
import { CategoriaCard } from "@/components/categorias/CategoriaCard";
import { CarruselProductos } from "@/components/productos/CarruselProductos";
import { aProductoCardData } from "@/components/productos/ProductoCard";
import { calcularDescuento } from "@/lib/utils";
import { BloqueSeleccion } from "@/components/portada/BloqueSeleccion";
import { CintaCierre } from "@/components/portada/CintaCierre";
import { FranjaValores } from "@/components/portada/FranjaValores";
import { HeroPortada, type PiezaProducto } from "@/components/portada/HeroPortada";
import styles from "./page.module.css";

export const revalidate = 300; // ISR: 5 minutos

const CATEGORIAS_PORTADA = 6;

export default async function HomePage() {
  const [nuevos, ofertas, destacados, categorias, totalProductos] = await Promise.all([
    listarNuevosIngresos(),
    listarOfertas(),
    listarDestacados(4),
    listarCategorias(),
    contarProductosActivos(),
  ]);

  const nuevosCard = nuevos.map(aProductoCardData);
  const ofertasCard = ofertas.map(aProductoCardData);
  const destacadosCard = destacados.map(aProductoCardData);

  // Si todavía nadie marcó categorías destacadas, la portada muestra las del
  // catálogo en vez de dejar la sección vacía.
  const marcadas = categorias.filter((categoria) => categoria.destacada);
  const categoriasPortada = (marcadas.length > 0 ? marcadas : categorias).slice(
    0,
    CATEGORIAS_PORTADA,
  );

  // Piezas del bloque de entrada: la categoría con más productos y, como
  // gancho, la mejor oferta; si no hay ninguna, el último ingreso.
  const categoriaPieza = [...categoriasPortada].sort(
    (a, b) => b._count.productos - a._count.productos,
  )[0];

  const mejorOferta = [...ofertasCard].sort(
    (a, b) =>
      (calcularDescuento(b.precio, b.precioOferta) ?? 0) -
      (calcularDescuento(a.precio, a.precioOferta) ?? 0),
  )[0];
  const gancho = mejorOferta ?? nuevosCard[0];
  const productoPieza: PiezaProducto | null = gancho
    ? {
        nombre: gancho.nombre,
        slug: gancho.slug,
        imagenUrl: gancho.imagenes[0]?.url ?? null,
        precio: gancho.precio,
        precioOferta: gancho.precioOferta,
        descuento: calcularDescuento(gancho.precio, gancho.precioOferta),
        marca: gancho.marca?.nombre ?? null,
      }
    : null;

  return (
    <main>
      <Container>
        <HeroPortada
          totalProductos={totalProductos}
          totalCategorias={categorias.length}
          categoria={
            categoriaPieza
              ? {
                  nombre: categoriaPieza.nombre,
                  slug: categoriaPieza.slug,
                  imagenUrl: categoriaPieza.imagenUrl,
                  totalProductos: categoriaPieza._count.productos,
                }
              : null
          }
          producto={productoPieza}
        />

        <FranjaValores />

        {categoriasPortada.length > 0 ? (
          <Section titulo="Comprar por categoría" enlace="/categorias">
            <div className={styles.categorias}>
              {categoriasPortada.map((categoria) => (
                <CategoriaCard
                  key={categoria.id}
                  variante="limpia"
                  categoria={{
                    id: categoria.id,
                    nombre: categoria.nombre,
                    slug: categoria.slug,
                    imagenUrl: categoria.imagenUrl,
                    totalProductos: categoria._count.productos,
                  }}
                />
              ))}
            </div>
          </Section>
        ) : null}

        {nuevosCard.length > 0 ? (
          <Section
            titulo="Nuevos ingresos"
            descripcion="Lo último que llegó a la tienda"
            enlace="/productos"
          >
            <CarruselProductos
              productos={nuevosCard}
              etiqueta="nuevo"
              titulo="Nuevos ingresos"
              variante="limpia"
            />
          </Section>
        ) : (
          <EstadoVacio
            titulo="Todavía no hay productos"
            descripcion="Estamos preparando el catálogo. Vuelve pronto."
          />
        )}

        {destacadosCard.length > 0 ? (
          <Section
            titulo="Selección de la casa"
            descripcion="Lo que recomendamos esta temporada"
            enlace="/productos"
          >
            <BloqueSeleccion
              principal={destacadosCard[0]}
              secundarios={destacadosCard.slice(1)}
            />
          </Section>
        ) : null}

        {ofertasCard.length > 0 ? (
          <Section
            titulo="Ofertas"
            descripcion="Productos con precio rebajado"
            enlace="/productos"
          >
            <CarruselProductos productos={ofertasCard} titulo="Ofertas" variante="limpia" />
          </Section>
        ) : null}

        <CintaCierre />
      </Container>
    </main>
  );
}
