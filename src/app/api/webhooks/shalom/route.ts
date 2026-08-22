import { NextResponse } from "next/server";

// Webhook de actualización de estado de envío Shalom — se implementa en fase 3.
export async function POST() {
  return NextResponse.json({ recibido: true, pendiente: "fase 3" });
}
