"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";

export function ClearCartOnPaid({ paid }: { paid: boolean }) {
  const { clear } = useCart();

  useEffect(() => {
    if (paid) clear();
  }, [clear, paid]);

  return null;
}
