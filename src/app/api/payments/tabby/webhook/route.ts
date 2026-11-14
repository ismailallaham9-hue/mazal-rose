import { timingSafeEqual } from "node:crypto";
import { getFreshStoreData } from "@/lib/store";
import { verifyTabbyPayment } from "@/lib/tabby";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const secret = process.env.TABBY_WEBHOOK_SECRET;
  const supplied = request.headers.get("x-tabby-auth");
  if (!secret || !supplied || Buffer.byteLength(secret) !== Buffer.byteLength(supplied) || !timingSafeEqual(Buffer.from(secret), Buffer.from(supplied))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (typeof body?.id !== "string") return Response.json({ error: "Invalid payment" }, { status: 400 });
  const store = await getFreshStoreData();
  const order = store.orders.find(entry => entry.paymentProvider === "tabby" && entry.paymentSessionId === body.id);
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  try {
    await verifyTabbyPayment(order.id);
    return Response.json({ received: true });
  } catch {
    console.error("Tabby verification failed", { orderId: order.id });
    return Response.json({ error: "Verification unavailable" }, { status: 503 });
  }
}
