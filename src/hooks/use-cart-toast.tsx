"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/context/cart-context";

/**
 * Fires a callback whenever an item is added to the cart.
 * Used by the toast system to show "Added to cart" notifications.
 */
export function useCartToast(onAdd: (name: string) => void) {
  const { items } = useCart();
  const prevCountRef = useRef(items.reduce((s, i) => s + i.quantity, 0));

  useEffect(() => {
    const newCount = items.reduce((s, i) => s + i.quantity, 0);
    if (newCount > prevCountRef.current && items.length > 0) {
      // Find the most recently updated item (last in array or highest qty)
      const last = items[items.length - 1];
      onAdd(last.product.name);
    }
    prevCountRef.current = newCount;
  }, [items, onAdd]);
}
