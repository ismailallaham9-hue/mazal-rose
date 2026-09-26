import fs from "node:fs";
import path from "node:path";

function storeFile() {
  const dir = process.env.MAZAL_DATA_DIR || process.env.RENDER_DATA_DIR || path.join(process.cwd(), "data");
  return path.join(dir, "store.json");
}

function itemKey(item) {
  return `${item.productId}::${item.size || ""}::${item.color || ""}`;
}

function main() {
  const file = storeFile();
  if (!fs.existsSync(file)) {
    console.error(`Store file not found: ${file}`);
    process.exitCode = 1;
    return;
  }

  const store = JSON.parse(fs.readFileSync(file, "utf8"));
  const sold = new Map();
  const paidOrders = [];
  const unpaidPaymentOrders = [];
  const paidWithoutInventoryMarker = [];
  const inventoryConflicts = [];

  for (const order of store.orders || []) {
    if (order.paymentStatus === "paid") {
      paidOrders.push(order);
      if (!order.inventoryAdjustedAt) paidWithoutInventoryMarker.push(order);
      for (const item of order.items || []) {
        sold.set(itemKey(item), (sold.get(itemKey(item)) || 0) + Number(item.quantity || 0));
      }
    } else if (order.paymentMethod !== "cod") {
      unpaidPaymentOrders.push(order);
    }
    if (order.inventoryConflictAt) inventoryConflicts.push(order);
  }

  const currentStock = [];
  for (const product of store.products || []) {
    const variants = product.variantStock && Object.keys(product.variantStock).length
      ? product.variantStock
      : { "": product.stock ?? 0 };
    for (const [variant, quantity] of Object.entries(variants)) {
      const [size = "", color = ""] = variant ? variant.split("::") : ["", ""];
      currentStock.push({
        productId: product.id,
        name: product.name,
        size,
        color,
        currentQuantity: quantity,
        paidSoldQuantity: sold.get(`${product.id}::${size}::${color}`) || 0,
      });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    storeFile: file,
    summary: {
      products: (store.products || []).length,
      orders: (store.orders || []).length,
      paidOrders: paidOrders.length,
      unpaidPaymentOrders: unpaidPaymentOrders.length,
      paidWithoutInventoryMarker: paidWithoutInventoryMarker.length,
      inventoryConflicts: inventoryConflicts.length,
    },
    warnings: [
      "This report does not change inventory.",
      "Orders created before inventoryAdjustedAt existed may need manual review against Noon/exported payment records.",
    ],
    paidWithoutInventoryMarker: paidWithoutInventoryMarker.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      paymentProvider: order.paymentProvider,
      paymentSessionId: order.paymentSessionId,
      total: order.total,
      createdAt: order.createdAt,
    })),
    unpaidPaymentOrders: unpaidPaymentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      paymentProvider: order.paymentProvider,
      paymentSessionId: order.paymentSessionId,
      total: order.total,
      createdAt: order.createdAt,
    })),
    inventoryConflicts: inventoryConflicts.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      inventoryConflictAt: order.inventoryConflictAt,
      internalNotes: order.internalNotes,
    })),
    currentStock,
  };

  console.log(JSON.stringify(report, null, 2));
}

main();
