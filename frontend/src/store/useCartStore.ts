"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartItem } from "../lib/types";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemsCount: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((cartItem) => cartItem.id === item.id);

          if (!existing) {
            return { items: [...state.items, { ...item, quantity: Math.max(1, item.quantity) }] };
          }

          const shouldMergeQuantity = item.kind === "part";
          return {
            items: state.items.map((cartItem) =>
              cartItem.id === item.id
                ? {
                    ...cartItem,
                    ...item,
                    quantity: shouldMergeQuantity
                      ? Math.min(99, cartItem.quantity + Math.max(1, item.quantity))
                      : Math.max(1, item.quantity),
                  }
                : cartItem,
            ),
          };
        }),

      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: Math.min(99, Math.max(1, quantity)),
                }
              : item,
          ),
        })),

      clearCart: () => set({ items: [] }),

      getItemsCount: () => get().items.reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () => get().items.reduce((total, item) => total + item.unit_price * item.quantity, 0),
    }),
    {
      name: "stunt-tech-cart",
      version: 1,
    },
  ),
);
