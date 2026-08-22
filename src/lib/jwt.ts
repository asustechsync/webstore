// Decodifica el payload de un JWT sin validar la firma — solo para leer
// datos ya confiables (el token viene de nuestra propia sesión de Supabase).
export function decodificarClaims(jwt: string): Record<string, unknown> {
  const payload = jwt.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json);
}
