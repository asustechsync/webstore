/**
 * Tipos de la base de datos. Este archivo se REEMPLAZA con los tipos generados:
 *   supabase gen types typescript --local > packages/core/db/src/types.ts
 * Mientras no existan tablas, se deja un esquema vacío.
 */
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
