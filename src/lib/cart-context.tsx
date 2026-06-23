"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { SITE } from "@/lib/site";

/**
 * Client-side cart. Persists to localStorage so the bag survives reloads.
 * When a real backend exists, swap the reducer dispatches for API calls —
 * the public hook surface (useCart) can stay the same.
 */

export type CartItem = {
  /** Stable line key: product + chosen size + colour */
  key: string;
  productId: string;
  name: string;
  price: number; // AED, integer
  image: string;
  size: string;
  color: string;
  quantity: number;
};

type AddPayload = Omit<CartItem, "key" | "quantity"> & { quantity?: number };

type CartState = { items: CartItem[] };

type CartAction =
  | { type: "add"; payload: AddPayload }
  | { type: "remove"; key: string }
  | { type: "setQty"; key: string; quantity: number }
  | { type: "clear" }
  | { type: "hydrate"; items: CartItem[] };

const STORAGE_KEY = "mazal.cart.v1";
const PROMO_KEY = "mazal.promo.v1";

function lineKey(productId: string, size: string, color: string) {
  return `${productId}::${size}::${color}`;
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items };
    case "add": {
      const { productId, size, color, quantity = 1 } = action.payload;
      const key = lineKey(productId, size, color);
      const existing = state.items.find((i) => i.key === key);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
          ),
        };
      }
      return { items: [...state.items, { ...action.payload, key, quantity }] };
    }
    case "remove":
      return { items: state.items.filter((i) => i.key !== action.key) };
    case "setQty":
      return {
        items: state.items
          .map((i) =>
            i.key === action.key
              ? { ...i, quantity: Math.max(1, action.quantity) }
              : i,
          )
          .filter((i) => i.quantity > 0),
      };
    case "clear":
      return { items: [] };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string | null;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: AddPayload) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);

  // Load persisted cart + promo once on mount.
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) dispatch({ type: "hydrate", items: JSON.parse(raw) });
        const promo = localStorage.getItem(PROMO_KEY);
        if (promo) setPromoCode(promo);
      } catch {
        /* ignore malformed storage */
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // Persist on change (after initial hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      /* storage may be unavailable */
    }
  }, [state.items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (promoCode) localStorage.setItem(PROMO_KEY, promoCode);
      else localStorage.removeItem(PROMO_KEY);
    } catch {
      /* ignore */
    }
  }, [promoCode, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((item: AddPayload) => {
    dispatch({ type: "add", payload: item });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback(
    (key: string) => dispatch({ type: "remove", key }),
    [],
  );
  const setQuantity = useCallback(
    (key: string, quantity: number) => dispatch({ type: "setQty", key, quantity }),
    [],
  );
  const clear = useCallback(() => {
    dispatch({ type: "clear" });
    setPromoCode(null);
  }, []);

  const applyPromo = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase();
    if (normalized === SITE.firstOrderCode.toUpperCase()) {
      setPromoCode(normalized);
      return true;
    }
    return false;
  }, []);
  const removePromo = useCallback(() => setPromoCode(null), []);

  const { count, subtotal } = useMemo(() => {
    return state.items.reduce(
      (acc, i) => {
        acc.count += i.quantity;
        acc.subtotal += i.quantity * i.price;
        return acc;
      },
      { count: 0, subtotal: 0 },
    );
  }, [state.items]);

  const discount = useMemo(() => {
    if (!promoCode) return 0;
    return Math.round((subtotal * SITE.firstOrderDiscount) / 100);
  }, [promoCode, subtotal]);

  const total = Math.max(0, subtotal - discount);

  const value: CartContextValue = {
    items: state.items,
    count,
    subtotal,
    discount,
    total,
    promoCode,
    applyPromo,
    removePromo,
    isOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
    setQuantity,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
