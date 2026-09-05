import {
  Cargando,
  EsqueletoCabecera,
  EsqueletoFormulario,
} from "@/components/ui/Esqueleto";

/**
 * Carga de la cuenta. El layout ya pinta la tarjeta del usuario y el menú
 * lateral, así que acá solo se dibuja la columna de contenido: perfil,
 * direcciones y seguridad son formularios, que es la forma más frecuente.
 */
export default function CargandoCuenta() {
  return (
    <Cargando etiqueta="Cargando tu cuenta">
      <EsqueletoCabecera />
      <EsqueletoFormulario campos={4} />
    </Cargando>
  );
}
