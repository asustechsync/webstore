import { Cargando, EsqueletoCabecera, EsqueletoTabla } from "@/components/ui/Esqueleto";
import styles from "./admin.module.css";

/**
 * Carga del panel. Casi todas sus pantallas son "cabecera + tabla"
 * (productos, stock, pedidos, usuarios, clientes, cupones, marcas), así que
 * esa es la silueta que se muestra mientras llegan los datos.
 *
 * El esqueleto va dentro de `.contenido` para respetar el espaciado del
 * layout: la barra superior y el menú lateral no se vuelven a pintar, siguen
 * visibles y utilizables mientras la sección carga.
 */
export default function CargandoAdmin() {
  return (
    <Cargando etiqueta="Cargando el panel">
      <EsqueletoCabecera />
      <div className={styles.bloque}>
        <EsqueletoTabla columnas={5} filas={8} />
      </div>
    </Cargando>
  );
}
