"use client";

import * as React from "react";

export type CartItem = {
  courseId: string;
  slug: string;
  title: string;
  thumbnail?: string | null;
  price: number;
  discountPrice?: number | null;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (courseId: string) => void;
  clear: () => void;
  has: (courseId: string) => boolean;
  count: number;
  subtotal: number;
};

const CartContext = React.createContext<CartState | null>(null);
const STORAGE_KEY = "nekhely:cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value: CartState = React.useMemo(
    () => ({
      items,
      add: (item) =>
        setItems((prev) =>
          prev.some((p) => p.courseId === item.courseId)
            ? prev
            : [...prev, item],
        ),
      remove: (id) =>
        setItems((prev) => prev.filter((p) => p.courseId !== id)),
      clear: () => setItems([]),
      has: (id) => items.some((p) => p.courseId === id),
      count: items.length,
      subtotal: items.reduce(
        (acc, i) => acc + (i.discountPrice ?? i.price),
        0,
      ),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
