"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EstadoPedido } from "@prisma/client";
import { cambiarEstadoPedido } from "@/features/pedidos/actions";
import { SelectConFlecha } from "@/components/ui/SelectConFlecha";
import styles from "../admin.module.css";

type Fila = {
  id: string;
  cliente: string;
  total: string;
  estado: EstadoPedido;
  items: number;
  creadoEn: string;
};

const ESTADOS: EstadoPedido[] = [
  "PENDIENTE",
  "PAGADO",
  "EN_PREPARACION",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
];

export function PedidosTabla({ pedidos }: { pedidos: Fila[] }) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onCambiarEstado(id: string, estado: EstadoPedido) {
    setError(null);
    iniciarTransicion(async () => {
      const resultado = await cambiarEstadoPedido(id, estado);
      if (!resultado.ok) setError(resultado.error);
      router.refresh();
    });
  }

  if (pedidos.length === 0) {
    return <p className={styles.vacio}>Todavía no hay pedidos.</p>;
  }

  return (
    <>
      {error && <p className={styles.mensajeError}>{error}</p>}

      <div className={styles.tablaWrap}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.id.slice(0, 8)}</td>
                <td>{pedido.cliente}</td>
                <td>{pedido.items}</td>
                <td>{pedido.total}</td>
                <td>{pedido.creadoEn}</td>
                <td>
                  <SelectConFlecha
                    className={styles.control}
                    value={pedido.estado}
                    disabled={pendiente}
                    onChange={(evento) =>
                      onCambiarEstado(pedido.id, evento.target.value as EstadoPedido)
                    }
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado.replace("_", " ")}
                      </option>
                    ))}
                  </SelectConFlecha>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
