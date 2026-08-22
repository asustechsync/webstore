import { NextResponse } from "next/server";

// Webhook de confirmación de pago Izipay — se implementa en fase 3.
export async function POST() {
  return NextResponse.json({ recibido: true, pendiente: "fase 3" });
}
