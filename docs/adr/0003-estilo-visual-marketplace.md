# ADR 0003: Estilo visual "marketplace" para la tienda de básicos

- **Estado:** aceptado
- **Fecha:** 2026-11-16

## Contexto
La primera instalación es una tienda de básicos (boxers, medias, camisetas, packs). Se compararon
cuatro maquetas (`docs/diseno/basicos/`) y se eligió la D, inspirada en un marketplace de calzado:
fondo gris claro, tarjetas blancas redondeadas, banners, ofertas del día, filtros en chips y bloques por colección.

## Decisión
- Los colores, radios y tipografía viven solo en `@webstore/tokens` (`tokens.css`): marca naranja,
  banner `promo` durazno, superficies `inverse` para la barra superior y el footer.
- Tipografía Confortotrial (thin, light, regular, medium, bold) cargada con `next/font/local` desde `apps/web/src/app/fonts/` y expuesta como `--font-comfort` en `<html>`. (Reemplaza a Plus Jakarta Sans.)
- Los botones del design system pasan a forma de píldora (`--radius-control`) y las tarjetas a `--radius-card: 1rem`.
- Las piezas de la portada son componentes de `apps/web/src/components/` (solo los usa la web).
  Suben a `packages/` cuando una segunda app los necesite.
- Las prendas se dibujan en SVG (`Garment`) y los productos salen de `src/lib/sample-products.ts`
  hasta que exista el módulo `catalog` y fotos reales en Supabase Storage.

## Consecuencias
- Cambiar de marca o de cliente es cambiar tokens, no componentes (compatible con ADR 0002).
- Los filtros, el buscador, la bolsa y "Ver más" están visibles pero deshabilitados hasta los pasos 2 a 4 de la fase 1.
- Los datos de ejemplo (precios, ventas, reseñas) no deben llegar a producción.
