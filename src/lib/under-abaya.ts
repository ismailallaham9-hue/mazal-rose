export type UnderAbaya = "velvet" | "crepe";

export function underAbayaLabel(value: UnderAbaya) {
  return value === "velvet" ? "Velvet under-abaya" : "Crepe under-abaya";
}

export function underAbayaPrice(value?: UnderAbaya) {
  return value ? 50 : 0;
}

export function isUnderAbaya(value: unknown): value is UnderAbaya {
  return value === "velvet" || value === "crepe";
}
