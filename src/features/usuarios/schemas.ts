import { z } from "zod";

export const registroSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre"),
  email: z.email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const editarUsuarioSchema = z.object({
  nombre: z.string().min(2, "Ingresa un nombre"),
  email: z.email("Correo inválido"),
});

export const crearUsuarioSchema = z.object({
  nombre: z.string().min(2, "Ingresa un nombre"),
  email: z.email("Correo inválido"),
  rolId: z.string().uuid("Selecciona un rol"),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EditarUsuarioInput = z.infer<typeof editarUsuarioSchema>;
export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
