"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { CartItem } from "./cart-item";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";

const SHIPPING_THRESHOLD = 15000;

export function CartDrawer() {
  const { items, isOpen, closeCart, itemCount, subtotal, shipping, total } =
    useCart();

  const amountToFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(
    100,
    (subtotal / SHIPPING_THRESHOLD) * 100,
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            key="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-100 z-50 bg-white flex flex-col shadow-[-8px_0_48px_rgba(0,0,0,0.15)]"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-(--cream-dark)">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={20} className="text-(--green-deep)" />
                <h2 className="font-serif text-[19px] font-semibold text-(--green-deep)">
                  Your Cart
                </h2>
                {itemCount > 0 && (
                  <span className="w-5 h-5 bg-(--green-deep) text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-(--cream-dark) transition-colors"
                aria-label="Close cart"
              >
                <X size={17} />
              </button>
            </div>

            {/* Free shipping progress */}
            {subtotal > 0 && (
              <div className="px-6 py-3 bg-(--cream) border-b border-(--cream-dark)">
                {amountToFreeShipping > 0 ? (
                  <p className="text-[12px] text-(--text-muted) mb-2">
                    Add{" "}
                    <span className="text-(--green-mid) font-medium">
                      {formatNaira(amountToFreeShipping)}
                    </span>{" "}
                    more for free shipping
                  </p>
                ) : (
                  <p className="text-[12px] text-(--green-mid) font-medium mb-2 flex items-center gap-1">
                    <Truck size={13} /> You&apos; ve unlocked free shipping! 🎉
                  </p>
                )}
                <div className="h-1.5 bg-(--cream-dark) rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-(--green-mid) rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
              <AnimatePresence initial={false}>
                {items.length > 0 ? (
                  items.map((item) => (
                    <CartItem key={item.product.id} item={item} />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full py-20 text-center"
                  >
                    <div className="text-[56px] mb-4">🌿</div>
                    <h3 className="font-serif text-[19px] font-semibold text-(--green-deep) mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-[14px] text-(--text-muted) mb-6 font-light">
                      Explore our verified natural products
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      href="/store"
                      onClick={closeCart}
                    >
                      Shop Now
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer totals + CTA */}
            {items.length > 0 && (
              <div className="border-t border-(--cream-dark) px-6 py-6 space-y-3">
                <div className="space-y-2 text-[14px]">
                  <div className="flex justify-between text-(--text-body)">
                    <span>Subtotal</span>
                    <span>{formatNaira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-(--text-body)">
                    <span>Shipping</span>
                    <span
                      className={
                        shipping === 0 ? "text-(--green-mid) font-medium" : ""
                      }
                    >
                      {shipping === 0 ? "Free" : formatNaira(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between font-serif text-[18px] font-semibold text-(--green-deep) pt-2 border-t border-(--cream-dark)">
                    <span>Total</span>
                    <span>{formatNaira(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full bg-(--green-deep) hover:bg-(--green-mid) text-white py-3.5 rounded-full font-medium text-[15px] transition-colors duration-200"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/store"
                  onClick={closeCart}
                  className="block text-center text-[13px] text-(--text-muted) hover:text-(--green-mid) transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
