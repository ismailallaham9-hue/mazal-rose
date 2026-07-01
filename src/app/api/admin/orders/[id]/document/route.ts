import { NextResponse } from "next/server";
import { getStoreData } from "@/lib/store";

export const runtime = "nodejs";

function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") === "packing" ? "Packing Slip" : "Invoice";
  const store = await getStoreData();
  const order = store.orders.find((item) => item.id === id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const rows = order.items
    .map(
      (item) =>
        `<tr><td>${esc(item.name)}<br><small>${esc(item.size)} / ${esc(item.color)}</small></td><td>${item.quantity}</td><td>AED ${item.price}</td><td>AED ${item.lineTotal}</td></tr>`,
    )
    .join("");

  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>${type} ${esc(order.orderNumber)}</title><style>
      body{font-family:Arial,sans-serif;color:#46352e;margin:40px;line-height:1.45}
      h1{font-family:Georgia,serif;font-weight:400}
      table{width:100%;border-collapse:collapse;margin-top:24px}
      th,td{border-bottom:1px solid #e2bcae;padding:10px;text-align:left}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:24px}
      .totals{margin-left:auto;max-width:320px}
      @media print{button{display:none}}
    </style></head><body>
      <button onclick="window.print()">Print</button>
      <h1>MAZAL ${type}</h1>
      <p><strong>${esc(order.orderNumber)}</strong><br>${new Date(order.createdAt).toLocaleString()}</p>
      <div class="grid">
        <div><h3>Customer</h3><p>${esc(order.customer.firstName)} ${esc(order.customer.lastName)}<br>${esc(order.customer.email)}<br>${esc(order.customer.phone)}</p></div>
        <div><h3>Shipping</h3><p>${esc(order.shipping.address)}<br>${esc(order.shipping.city)}, ${esc(order.shipping.country)}</p></div>
      </div>
      <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="totals">
        <p>Subtotal: AED ${order.subtotal}</p>
        <p>Discount: AED ${order.discount}</p>
        <p>Delivery: AED ${order.deliveryFee}</p>
        <h2>Total: AED ${order.total}</h2>
      </div>
      ${order.note ? `<p><strong>Customer note:</strong> ${esc(order.note)}</p>` : ""}
    </body></html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}
