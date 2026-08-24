import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getUsuarioActual } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { CrearUsuarioForm } from "./CrearUsuarioForm";
import { FiltrosUsuarios } from "./FiltrosUsuarios";
import { UsuariosTabla } from "./UsuariosTabla";

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rol?: string }>;
}) {
  const { q, rol } = await searchParams;

  const where: Prisma.UsuarioWhereInput = {
    ...(q
      ? {
          OR: [
            { nombre: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(rol ? { rolId: rol } : {}),
  };

  const [usuarios, roles, usuarioActual] = await Promise.all([
    db.usuario.findMany({ where, orderBy: { creadoEn: "desc" } }),
    db.rol.findMany({ orderBy: { nombre: "asc" } }),
    getUsuarioActual(),
  ]);

  return (
    <>
      <PageHeader titulo="Usuarios" descripcion={`${usuarios.length} usuario(s) en la lista.`}>
        <CrearUsuarioForm roles={roles} />
      </PageHeader>

      <FiltrosUsuarios roles={roles} />

      <UsuariosTabla
        usuarios={usuarios.map((usuario) => ({
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rolId: usuario.rolId,
          creadoEn: usuario.creadoEn.toLocaleDateString("es-PE"),
        }))}
        roles={roles}
        usuarioActualId={usuarioActual?.id ?? ""}
      />
    </>
  );
}
