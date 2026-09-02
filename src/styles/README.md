# Sistema visual

La apariencia compartida del proyecto se mantiene en tres capas:

1. `tokens.css`: decisiones de marca, tipografía, espaciado, controles, superficies y
   catálogo. Los cambios visuales generales comienzan aquí.
2. `base.css`: reset, elementos HTML, accesibilidad y comportamiento global.
3. `ui.module.css`: patrones reutilizables que consumen tokens (botones, campos, tarjetas,
   badges, mensajes, tablas, secciones, grillas del catálogo, precios y estado vacío).

`index.css` es el único punto de entrada global y se importa en el layout raíz.

## Convenciones

- No agregar colores, sombras, radios, tamaños tipográficos o pesos directamente en módulos de página. Crear o reutilizar un token.
- Usar los componentes de `src/components/ui` antes de crear controles nuevos.
- Un CSS Module de página debe contener principalmente layout: grids, columnas, alineación y ajustes realmente particulares.
- Si un patrón aparece en dos lugares, moverlo a `ui.module.css` o convertirlo en componente UI.
- Las variables antiguas `--color-*` siguen disponibles como alias para permitir una migración gradual.

## Catálogo

Cuántas tarjetas entran por fila es una decisión de tokens, no de cada página:

- `--catalogo-columnas`: columnas de la grilla de productos (2 en móvil → 6 desde 1280 px).
- `--catalogo-visibles`: tarjetas visibles en el carrusel. El decimal en móvil deja asomar
  la siguiente para que se note que hay más.
- `--catalogo-gap`, `--catalogo-imagen-ratio`: separación y proporción de la tarjeta.
- `--categoria-columnas`, `--categoria-imagen-alto`: lo mismo para las categorías.
- `--seccion-espacio`: aire vertical entre secciones de la tienda.

Los consumen `gridProductos`, `gridCategorias` y `CarruselProductos`. Para cambiar la
densidad del catálogo en un punto de corte se toca solo `tokens.css`.

## Portada

La portada compone bloques de `src/components/portada` sobre los mismos tokens:

- `--texto-display`: tamaño de los títulos grandes (2.25 rem en móvil → 4.5 rem en
  escritorio). Se consume desde el patrón `tituloDisplay`.
- `--portada-gap`: separación de las rejillas del bloque de entrada y de la selección.
- `--catalogo-imagen-ratio-ancho`: proporción apaisada de las piezas editoriales grandes.

Patrones asociados en `ui.module.css`: `etiquetaSuperior` (rótulo en versalitas),
`tituloDisplay` y `contorno` (superficie de solo línea, sin relleno ni sombra).

## Variantes de tarjeta

`ProductoCard` y `CategoriaCard` aceptan `variante`:

- `"tarjeta"` (por defecto): caja con borde, para los listados.
- `"limpia"`: solo imagen y texto, que es la lectura minimalista de la portada.

Ambas comparten estructura y tokens; la variante solo apaga la caja, así que un cambio
de tipografía o de proporción sigue aplicando a las dos.

## Componentes de composición

- `Section`: título, bajada y enlace "ver todo" con el ritmo vertical ya resuelto.
- `EstadoVacio`: mensaje único de "no hay resultados", con acción opcional.
- `LinkButton`: enlace con la apariencia de `Button`.
- `MigasDePan`: ruta de navegación; el último elemento es la página actual y no enlaza.
