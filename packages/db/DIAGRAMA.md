# Diagrama de la base de datos

Fuente de verdad: `prisma/schema.prisma`. Este archivo es solo una guia visual; si el esquema cambia, hay que actualizarlo a mano.

## Vista general (por bloques)

Las flechas van de la tabla "padre" a la tabla que depende de ella.

```mermaid
flowchart LR
  subgraph PERSONAS["1. Personas"]
    Usuario --> Direccion
  end

  subgraph CATALOGO["2. Catalogo"]
    Categoria --> Producto
    Marca --> Producto
    Producto --> Variante
  end

  subgraph STOCK["3. Stock"]
    MovimientoStock
  end

  subgraph COMPRA["4. Compra temporal"]
    Carrito --> ItemCarrito
  end

  subgraph VENTA["5. Venta"]
    Pedido --> ItemPedido
    Pedido --> Pago
  end

  Usuario --> Carrito
  Usuario --> Pedido
  Variante --> MovimientoStock
  Variante --> ItemCarrito
  Variante --> ItemPedido
```

`Variante` es la pieza central: es lo que se vende, se guarda en carritos, entra en pedidos y mueve el stock.

## Detalle de columnas

```mermaid
erDiagram
  Usuario ||--o{ Direccion : tiene
  Usuario |o--o{ Carrito : abre
  Usuario |o--o{ Pedido : realiza
  Categoria |o--o{ Categoria : subcategorias
  Categoria ||--o{ Producto : agrupa
  Marca ||--o{ Producto : fabrica
  Producto ||--o{ Variante : ofrece
  Variante ||--o{ MovimientoStock : registra
  Variante ||--o{ ItemCarrito : en
  Carrito ||--o{ ItemCarrito : contiene
  Variante ||--o{ ItemPedido : vendida
  Pedido ||--o{ ItemPedido : contiene
  Pedido ||--o{ Pago : cobra

  Usuario {
    string id PK
    string correo UK
    string nombre
    string telefono
    string claveHash
    Rol rol
  }
  Direccion {
    string id PK
    string usuarioId FK
    string destinatario
    string linea1
    string distrito
    string ciudad
  }
  Categoria {
    string id PK
    string nombre
    string slug UK
    string padreId FK
    string descripcion
    string imagenUrl
    boolean activo
    boolean destacada
    string metaTitulo
    string metaDescripcion
    date creadoEn
    date actualizadoEn
  }
  Marca {
    string id PK
    string nombre UK
    string slug UK
    string descripcion
    string logoUrl
    boolean activo
    boolean destacada
    string metaTitulo
    string metaDescripcion
    date creadoEn
    date actualizadoEn
  }
  Producto {
    string id PK
    string nombre
    string slug UK
    json specs
    string categoriaId FK
    string marcaId FK
    string imagenUrl
    boolean activo
    string metaTitulo
    string metaDescripcion
    date creadoEn
    date actualizadoEn
  }
  Variante {
    string id PK
    string productoId FK
    string sku UK
    int precio "centimos"
    string imagenes
  }
  MovimientoStock {
    string id PK
    string varianteId FK
    TipoMovimiento tipo
    int cantidad
    string pedidoId "sin FK"
  }
  Carrito {
    string id PK
    string usuarioId FK
  }
  ItemCarrito {
    string id PK
    string carritoId FK
    string varianteId FK
    int cantidad
  }
  Pedido {
    string id PK
    int numero UK
    string correo
    EstadoPedido estado
    json direccion "congelada"
    int subtotal
    int envio
    int total
  }
  ItemPedido {
    string id PK
    string pedidoId FK
    string varianteId FK
    string nombre "congelado"
    string sku "congelado"
    int precio "congelado"
    int cantidad
  }
  Pago {
    string id PK
    string pedidoId FK
    string metodo
    int monto
    EstadoPago estado
  }
```

## Valores de los enums

| Enum | Valores |
|---|---|
| `Rol` | `CLIENTE`, `ADMIN`, `ALMACEN` |
| `EstadoPedido` | `PENDIENTE`, `PAGADO`, `PREPARANDO`, `ENVIADO`, `ENTREGADO`, `CANCELADO` |
| `EstadoPago` | `PENDIENTE`, `PAGADO`, `FALLIDO`, `REEMBOLSADO` |
| `TipoMovimiento` | `ENTRADA`, `SALIDA`, `AJUSTE`, `RESERVA`, `DEVOLUCION` |

## Reglas que se ven en el esquema

- **Stock**: no hay columna de stock. Sale de sumar `MovimientoStock` por variante.
- **Precios**: siempre enteros en centimos.
- **Congelado en el pedido**: la direccion (`Pedido.direccion`) y el nombre, sku y precio (`ItemPedido`) se copian al comprar.
- **Compra como invitado**: `usuarioId` es opcional en `Carrito` y `Pedido`; el pedido guarda siempre el `correo`.
- **Pendiente de revisar**: `MovimientoStock.pedidoId` es un texto suelto, sin relacion real con `Pedido`.
- `_prisma_migrations` la crea Prisma para llevar el historial; no es parte del modelo.
