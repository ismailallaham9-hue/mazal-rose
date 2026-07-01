import { NextResponse } from "next/server";
import { getStoreData } from "@/lib/store";

export const runtime = "nodejs";

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function csv(rows: unknown[][]) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function download(body: string, filename: string, contentType: string) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind") || "backup";
  const store = await getStoreData();
  const date = new Date().toISOString().slice(0, 10);

  if (kind === "orders") {
    return download(
      csv([
        [
          "orderNumber",
          "createdAt",
          "status",
          "paymentStatus",
          "customer",
          "email",
          "phone",
          "total",
          "trackingNumber",
        ],
        ...store.orders.map((order) => [
          order.orderNumber,
          order.createdAt,
          order.status,
          order.paymentStatus,
          `${order.customer.firstName} ${order.customer.lastName}`,
          order.customer.email,
          order.customer.phone,
          order.total,
          order.trackingNumber ?? "",
        ]),
      ]),
      `mazal-orders-${date}.csv`,
      "text/csv; charset=utf-8",
    );
  }

  if (kind === "subscribers") {
    return download(
      csv([
        ["email", "source", "createdAt"],
        ...store.subscribers.map((subscriber) => [
          subscriber.email,
          subscriber.source,
          subscriber.createdAt,
        ]),
      ]),
      `mazal-subscribers-${date}.csv`,
      "text/csv; charset=utf-8",
    );
  }

  if (kind === "inquiries") {
    return download(
      csv([
        ["createdAt", "status", "name", "email", "subject", "message"],
        ...store.inquiries.map((inquiry) => [
          inquiry.createdAt,
          inquiry.status,
          inquiry.name,
          inquiry.email,
          inquiry.subject,
          inquiry.message,
        ]),
      ]),
      `mazal-messages-${date}.csv`,
      "text/csv; charset=utf-8",
    );
  }

  if (kind === "products") {
    return download(
      csv([
        ["id", "slug", "name", "category", "price", "stock", "variantStock", "published"],
        ...store.products.map((product) => [
          product.id,
          product.slug,
          product.name,
          product.category,
          product.price,
          product.stock ?? "",
          JSON.stringify(product.variantStock ?? {}),
          product.published !== false ? "yes" : "no",
        ]),
      ]),
      `mazal-products-${date}.csv`,
      "text/csv; charset=utf-8",
    );
  }

  return download(
    JSON.stringify(store, null, 2),
    `mazal-backup-${date}.json`,
    "application/json; charset=utf-8",
  );
}
