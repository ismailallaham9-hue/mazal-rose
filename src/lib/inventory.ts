import "server-only";
import {
  totalStock,
  variantKey,
  variantStock,
  type Product,
} from "@/lib/products";
import {
  updateStoreData,
  type StoreData,
  type StoreOrder,
} from "@/lib/store";

export class InventoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InventoryError";
  }
}

export function stockError(products: Product[], items: StoreOrder["items"]) {
  for (const item of items) {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) return `${item.name} is no longer available.`;
    const available = variantStock(product, item.size, item.color);
    if (available < item.quantity) {
      return `${item.name} (${item.size} / ${item.color}) has only ${available} left.`;
    }
  }
  return null;
}

function reduceProductStock(product: Product, items: StoreOrder["items"]): Product {
  const productItems = items.filter((item) => item.productId === product.id);
  const ordered = productItems.reduce((sum, item) => sum + item.quantity, 0);
  if (!ordered) return product;

  if (product.variantStock && Object.keys(product.variantStock).length) {
    const variantStockMap = { ...product.variantStock };
    for (const item of productItems) {
      const key = variantKey(item.size, item.color);
      const current = variantStockMap[key] ?? 0;
      if (current < item.quantity) {
        throw new InventoryError(
          `${item.name} (${item.size} / ${item.color}) has only ${current} left.`,
        );
      }
      variantStockMap[key] = current - item.quantity;
    }
    const nextProduct = { ...product, variantStock: variantStockMap };
    return { ...nextProduct, stock: totalStock(nextProduct) };
  }

  if (typeof product.stock !== "number") return product;
  if (product.stock < ordered) {
    throw new InventoryError(`${product.name} has only ${product.stock} left.`);
  }
  return { ...product, stock: product.stock - ordered };
}

export function deductOrderInventoryFromProducts(
  products: Product[],
  order: StoreOrder,
) {
  const unavailable = stockError(products, order.items);
  if (unavailable) throw new InventoryError(unavailable);
  return products.map((product) => reduceProductStock(product, order.items));
}

export async function applyOrderInventoryDeduction({
  orderId,
  paymentEventId,
  reason,
  markPaid = false,
}: {
  orderId: string;
  paymentEventId: string;
  reason: string;
  markPaid?: boolean;
}) {
  return updateStoreData<{
    order: StoreOrder | null;
    changed: boolean;
    conflict: boolean;
  }>((store) => {
    const order = store.orders.find((entry) => entry.id === orderId);
    if (!order) return { store, result: { order: null, changed: false, conflict: false } };

    const now = new Date().toISOString();
    if (order.inventoryAdjustedAt) {
      const orders = store.orders.map((entry) =>
        entry.id === order.id && markPaid && entry.paymentStatus !== "paid"
          ? { ...entry, paymentStatus: "paid" as const, updatedAt: now }
          : entry,
      );
      return {
        store: { ...store, orders },
        result: {
          order: orders.find((entry) => entry.id === order.id) ?? order,
          changed: false,
          conflict: false,
        },
      };
    }

    try {
      const products = deductOrderInventoryFromProducts(store.products, order);
      const orders = store.orders.map((entry) =>
        entry.id === order.id
          ? {
              ...entry,
              status: entry.status === "new" ? ("confirmed" as const) : entry.status,
              paymentStatus: markPaid ? ("paid" as const) : entry.paymentStatus,
              inventoryAdjustedAt: now,
              inventoryAdjustmentReason: reason,
              inventoryPaymentEventId: paymentEventId,
              updatedAt: now,
            }
          : entry,
      );
      const adjusted = orders.find((entry) => entry.id === order.id) ?? order;
      console.info("Inventory deducted", {
        orderId,
        orderNumber: order.orderNumber,
        paymentEventId,
        reason,
        items: order.items.map((item) => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        adjustedAt: now,
      });
      return {
        store: { ...store, products, orders },
        result: { order: adjusted, changed: true, conflict: false },
      };
    } catch (error) {
      const message =
        error instanceof InventoryError
          ? error.message
          : "Inventory could not be adjusted.";
      const orders = store.orders.map((entry) =>
        entry.id === order.id
          ? {
              ...entry,
              paymentStatus: markPaid ? ("paid" as const) : entry.paymentStatus,
              inventoryConflictAt: now,
              internalNotes: [
                entry.internalNotes,
                `[${now}] Inventory conflict after ${reason}: ${message}`,
              ]
                .filter(Boolean)
                .join("\n"),
              updatedAt: now,
            }
          : entry,
      );
      console.error("Inventory conflict", {
        orderId,
        paymentEventId,
        reason,
        message,
      });
      return {
        store: { ...store, orders },
        result: {
          order: orders.find((entry) => entry.id === order.id) ?? order,
          changed: false,
          conflict: true,
        },
      };
    }
  });
}

export function paidOrdersWithoutInventory(store: Pick<StoreData, "orders">) {
  return store.orders.filter(
    (order) =>
      order.paymentStatus === "paid" &&
      !order.inventoryAdjustedAt &&
      !order.inventoryConflictAt,
  );
}
