"use client";

import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowLeft, Truck } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { CartItem } from "./cart-item";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { getFeaturedProducts } from "@/data/products";
import { useReviewSummaries } from "@/hooks/review-hooks";
import { formatNaira } from "@/lib/utils";

const SHIPPING_THRESHOLD = 15000;

export function CartPage() {
  const { items, itemCount, subtotal, shipping, total, clearCart } = useCart();
  const suggestions = getFeaturedProducts(4)
    .filter((p) => !items.find((i) => i.product.id === p.id))
    .slice(0, 4);
  const { data: suggestionReviewData } = useReviewSummaries(
    suggestions.map((p) => p.id),
  );
  const amountToFree = Math.max(0, SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="min-h-screen bg-(--cream)">
      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} className="text-(--green-deep)" />
            <h1 className="font-serif text-[32px] font-medium text-(--green-deep)">
              Your Cart
            </h1>
            {itemCount > 0 && (
              <span className="bg-(--green-deep) text-white text-[12px] font-bold px-2.5 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <Link
            href="/store"
            className="flex items-center gap-1.5 text-[14px] text-(--text-muted) hover:text-(--green-mid)] transition-colors"
          >
            <ArrowLeft size={15} />
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24">
            <div className="text-[72px] mb-5">🌿</div>
            <h2 className="font-serif text-[28px] text-(--green-deep) mb-3">
              Your cart is empty
            </h2>
            <p className="text-(--text-muted) text-[15px] font-light mb-8">
              Discover verified natural products curated for Nigerians
            </p>
            <Button variant="primary" size="lg" href="/store">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-10">
            {/* Cart items */}
            <div>
              {/* Free shipping bar */}
              {amountToFree > 0 && (
                <div className="bg-(--green-pale)/40 border border-(--green-pale) rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
                  <Truck size={18} className="text-(--green-mid) shrink-0" />
                  <p className="text-[13px] text-(--text-body)">
                    Add{" "}
                    <strong className="text-(--green-mid)">
                      {formatNaira(amountToFree)}
                    </strong>{" "}
                    more to unlock free delivery!
                  </p>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-(--cream-dark) divide-y divide-(--cream-dark) px-6">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <CartItem key={item.product.id} item={item} />
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={clearCart}
                  className="text-[13px] text-(--text-muted) hover:text-red-500 transition-colors"
                >
                  Clear cart
                </button>
              </div>
            </div>

            {/* Order summary */}
            <div>
              <div className="bg-white rounded-2xl border border-(--cream-dark) p-6 sticky top-24">
                <h2 className="font-serif text-[20px] font-semibold text-(--green-deep) mb-5">
                  Order Summary
                </h2>

                <div className="space-y-3 text-[14px] mb-5">
                  <div className="flex justify-between text-(--text-body)">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>{formatNaira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-(--text-body)">
                    <span>Shipping</span>
                    <span
                      className={
                        shipping === 0 ? "text-(--green-mid) font-medium" : ""
                      }
                    >
                      {shipping === 0 ? "Free 🎉" : formatNaira(shipping)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-(--cream-dark) flex justify-between font-serif text-[20px] font-semibold text-(--green-deep)">
                    <span>Total</span>
                    <span>{formatNaira(total)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  href="/checkout"
                  className="w-full justify-center mb-3"
                >
                  Proceed to Checkout
                </Button>
                <p className="text-center text-[12px] text-(--text-muted)">
                  🔒 Secured with SSL encryption
                </p>

                {/* Payment icons */}
                <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-(--cream-dark)">
                  {["Paystack", "Flutterwave", "Bank Transfer"].map((p) => (
                    <span
                      key={p}
                      className="text-[10px] bg-(--cream-dark) text-(--text-muted) px-2.5 py-1 rounded font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* You may also like */}
        {suggestions.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-[26px] font-semibold text-(--green-deep) mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {suggestions.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  liveSummary={suggestionReviewData?.summaries[p.id] ?? null}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
