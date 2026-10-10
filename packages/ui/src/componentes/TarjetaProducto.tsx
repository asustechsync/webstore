import estilos from "./TarjetaProducto.module.css";

type Props = {
  nombre: string;
  href: string;
  marca: string;
  /** Precio ya formateado (ver formatearPrecio en @webstore/core). */
  precio: string;
  /** Precio en céntimos, para el atributo machine-readable. */
  precioCentimos: number;
  imagen: { src: string; alt: string };
};

export function TarjetaProducto({ nombre, href, marca, precio, precioCentimos, imagen }: Props) {
  return (
    <article className={estilos.tarjeta}>
      <a href={href} className={estilos.enlace}>
        <img
          src={imagen.src}
          alt={imagen.alt}
          width={400}
          height={400}
          loading="lazy"
          className={estilos.imagen}
        />
        <p className={estilos.marca}>{marca}</p>
        <h3 className={estilos.nombre}>{nombre}</h3>
      </a>
      <p className={estilos.precio}>
        <data value={precioCentimos}>{precio}</data>
      </p>
    </article>
  );
}
