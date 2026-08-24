# Sistema visual

La apariencia compartida del proyecto se mantiene en tres capas:

1. `tokens.css`: decisiones de marca, tipografía, espaciado, controles y superficies. Los cambios visuales generales comienzan aquí.
2. `base.css`: reset, elementos HTML, accesibilidad y comportamiento global.
3. `ui.module.css`: patrones reutilizables que consumen tokens (botones, campos, tarjetas, badges, mensajes y tablas).

`index.css` es el único punto de entrada global y se importa en el layout raíz.

## Convenciones

- No agregar colores, sombras, radios, tamaños tipográficos o pesos directamente en módulos de página. Crear o reutilizar un token.
- Usar los componentes de `src/components/ui` antes de crear controles nuevos.
- Un CSS Module de página debe contener principalmente layout: grids, columnas, alineación y ajustes realmente particulares.
- Si un patrón aparece en dos lugares, moverlo a `ui.module.css` o convertirlo en componente UI.
- Las variables antiguas `--color-*` siguen disponibles como alias para permitir una migración gradual.
