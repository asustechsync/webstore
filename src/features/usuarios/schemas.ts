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

export const editarPerfilSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre").max(80, "El nombre es demasiado largo"),
  apellidos: z.string().trim().max(100, "Los apellidos son demasiado largos"),
  telefono: z.string().trim().max(20, "El teléfono es demasiado largo"),
});

export const direccionSchema = z.object({
  destinatario: z.string().trim().min(2, "Ingresa el nombre de quien recibe").max(120),
  telefono: z.string().trim().min(6, "Ingresa un teléfono válido").max(20),
  departamento: z.string().trim().min(2, "Ingresa el departamento").max(80),
  provincia: z.string().trim().min(2, "Ingresa la provincia").max(80),
  distrito: z.string().trim().min(2, "Ingresa el distrito").max(80),
  direccion: z.string().trim().min(5, "Ingresa una dirección completa").max(200),
  referencia: z.string().trim().max(200, "La referencia es demasiado larga"),
  predeterminada: z.boolean().default(false),
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
export type EditarPerfilInput = z.infer<typeof editarPerfilSchema>;
export type DireccionInput = z.infer<typeof direccionSchema>;
