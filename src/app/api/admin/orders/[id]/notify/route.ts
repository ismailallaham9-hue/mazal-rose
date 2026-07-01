import { NextResponse } from "next/server";
import { orderStatusEmails, sendEmails } from "@/lib/email";
import { getStoreData, saveStoreData } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const store = await getStoreData();
  const order = store.orders.find((item) => item.id === id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const emailEvents = await sendEmails(
    store.settings,
    orderStatusEmails(store.settings, order),
  );
  const now = new Date().toISOString();
  const orders = store.orders.map((item) =>
    item.id === id
      ? { ...item, customerNotifiedAt: now, updatedAt: now }
      : item,
  );

  await saveStoreData({
    ...store,
    orders,
    emailEvents: [...emailEvents, ...store.emailEvents],
  });

  return NextResponse.json({
    ok: true,
    order: orders.find((item) => item.id === id),
    emailEvents,
  });
}
