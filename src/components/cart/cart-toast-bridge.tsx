"use client";

import { useCallback } from "react";
import { useToast } from "@/context/toast-context";
import { useCartToast } from "@/hooks/use-cart-toast";

/**
 * Invisible component that sits in the layout tree.
 * Watches cart state and fires a toast notification whenever an item is added.
 */
export function CartToastBridge() {
  const { cartAdd } = useToast();
  const handleAdd = useCallback((name: string) => cartAdd(name), [cartAdd]);
  useCartToast(handleAdd);
  return null;
}
