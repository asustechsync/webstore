# Estructura de categorías

Propuesta de organización del catálogo, basada en el análisis de cuatro tiendas peruanas
(octubre 2026). Pendiente de convertir en seed.

## Reglas

1. **Máximo 3 niveles:** departamento → categoría → subcategoría. Todo lo demás es filtro.
2. **Una subcategoría solo existe si cambia el tipo de producto o la compatibilidad.**
   DDR5 y DDR4 no son intercambiables: subcategorías. 16 GB y 32 GB se comparan: filtro.
3. **Las marcas nunca son categorías.** Van en la tabla `Marca` y se usan como filtro.
4. **Nombres completos, en lenguaje del cliente.** "Enfriamiento líquido", no "AIO".
5. **Cada producto vive en un solo lugar.** Nada de "Case | Fuentes" ni ramas duplicadas.
6. **Ofertas, Novedades y Remates no son categorías.** Son colecciones o etiquetas.

## Árbol

Nivel 1 = departamento (barra del menú) · Nivel 2 = categoría · Nivel 3 = subcategoría.

### Componentes

| Categoría | Subcategorías | Filtros (no categorías) |
|---|---|---|
| Procesadores | Intel, AMD | Socket, generación, núcleos, gráficos integrados |
| Placas madre | Para Intel, Para AMD | Socket, chipset, tamaño (ATX, Micro ATX, Mini ITX), tipo de RAM |
| Memorias RAM | DDR5, DDR4, Para laptop | Capacidad, velocidad, kit de 1 o 2, RGB |
| Tarjetas de video | NVIDIA GeForce, AMD Radeon, Intel Arc, Profesionales | Serie, memoria de video, marca |
| Almacenamiento interno | SSD M.2 NVMe, SSD SATA 2.5", Discos duros | Capacidad, generación PCIe, uso (NAS, vigilancia) |
| Fuentes de poder | — | Potencia, certificación 80 Plus, modular, tamaño SFX |
| Cases | Torre mediana, Torre completa, Compactos | Con o sin fuente, color, vidrio templado |
| Refrigeración | Enfriamiento por aire, Enfriamiento líquido, Ventiladores, Pasta y pads térmicos | Tamaño del radiador, socket compatible |
| Tarjetas de expansión | Sonido, Red y WiFi, Capturadoras | — |

### Computadoras

PCs gamer · PCs para oficina y hogar · Workstations · Mini PC · All in One

Filtros: resolución objetivo (1080p, 1440p, 4K), tarjeta de video.

### Laptops

Laptops gamer · Laptops para oficina y estudio · Laptops para diseño y creación ·
Accesorios para laptop (Bases enfriadoras, Mochilas y fundas, Cargadores)

Filtros: procesador, pantalla, RAM, almacenamiento, sistema operativo.

### Monitores

Monitores gamer · Monitores para oficina · Monitores para diseño · Monitores portátiles ·
Soportes para monitor

Filtros: tamaño, resolución, frecuencia (Hz), panel, curvo.

### Periféricos

Teclados · Mouse · Kits de teclado y mouse · Mouse pads · Audífonos · Parlantes ·
Micrófonos · Cámaras web · Mandos y volantes

Filtros: inalámbrico o con cable, gaming, switch mecánico, RGB.

### Accesorios

| Categoría | Subcategorías |
|---|---|
| Energía | Estabilizadores, UPS, Supresores de pico |
| Redes | Routers, Adaptadores WiFi y Bluetooth, Switches |
| Almacenamiento externo | Discos externos, SSD externos, Memorias USB, Memorias SD |
| Cables y adaptadores | — |
| Software | Windows, Office, Antivirus |
| Sillas y escritorios | Sillas gamer, Escritorios |

## Por qué así

- **6 departamentos** caben en la barra de escritorio y siguen el orden de compra.
- **Componentes** responde "¿qué necesito para armar mi PC?": sus 9 categorías son las
  piezas, en el orden en que se eligen.
- **Placas y procesadores** se dividen solo en Intel y AMD: es la primera decisión de
  compatibilidad. Socket y generación son filtros, no un cuarto nivel.
- **Computadoras y Laptops** se dividen por uso, no por procesador: el cliente piensa
  "quiero jugar", no "quiero un Core Ultra 7".
- **Almacenamiento interno** excluye discos externos y USB, que no se instalan en la PC.

## Implementación en la base de datos

- Todo es `Categoria`; el departamento es una categoría con `padreId = null`.
- Validar en `packages/core` que el árbol no pase de 3 niveles.
- Añadir `orden Int @default(0)` a `Categoria` para ordenar el menú.
- Slugs únicos y planos: `/categoria/enfriamiento-liquido`.
- Los filtros requieren atributos de producto (paso aparte del seed).

## Análisis de la competencia

| Tienda | Acierto | Error |
|---|---|---|
| sercoplus.com | Separa Intel y AMD en procesadores y placas | Marcas como subcategorías (16 de fuentes, 25 de cases); "Dvd - Blu Ray" dentro de Cases; subcategorías duplicadas |
| memorykings.pe | Listados de placas por socket y chipset muy precisos | ~50 categorías planas con nombres concatenados; "Case \| Fuentes" juntos; "zonas" por público mezcladas con tipos |
| compuvisionperu.pe | Lista corta y recorrible | "Memoria y almacenamiento" juntos; placas mezclan marca con tamaño; todo en mayúsculas |
| computershopperu.com | Mejor jerarquía ("PC Configuraciones"), refrigeración bien separada | 4 niveles; "Saldos" como subcategoría; wired/wireless/gaming como subcategorías; sillas por marca |

Error común a las cuatro: usar categorías para lo que deberían ser filtros.
