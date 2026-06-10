"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Star,
  Shield,
  Truck,
  RotateCcw,
  ChevronRight,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { ProductCard } from "@/components/store/product-card";
import { useCart } from "@/context/cart-context";
import { formatNaira } from "@/lib/utils";
import { getRelatedProducts } from "@/data/products";
import type { Product } from "@/types";

type Tab = "description" | "ingredients" | "how-to-use" | "warnings";

const tabs: { id: Tab; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "ingredients", label: "Ingredients" },
  { id: "how-to-use", label: "How to Use" },
  { id: "warnings", label: "Warnings" },
];

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("description");

  const related = getRelatedProducts(product, 4);

  function handleAddToCart() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="min-h-screen bg-(--cream)">
      {/* Breadcrumb */}
      <div className="border-b border-(--cream-dark) bg-white">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 py-3.5 flex items-center gap-2 text-[13px] text-(--text-muted)">
          <Link href="/" className="hover:text-(--green-mid) transition-colors">
            Home
          </Link>
          <ChevronRight size={13} />
          <Link
            href="/store"
            className="hover:text-(--green-mid) transition-colors"
          >
            Store
          </Link>
          <ChevronRight size={13} />
          <span className="text-(--text-dark) font-medium truncate">
            {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 py-12">
        {/* Main product section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          {/* Left: Visual */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-full aspect-square rounded-3xl flex items-center justify-center text-[120px] relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${product.gradientFrom}, ${product.gradientTo})`,
              }}
            >
              <span
                className="select-none"
                role="img"
                aria-label={product.name}
              >
                {product.emoji}
              </span>
              <div className="absolute top-5 left-5">
                <Badge variant={product.badgeVariant} size="lg">
                  {product.badge}
                </Badge>
              </div>
              {product.originalPrice && (
                <div className="absolute top-5 right-5 bg-red-500 text-white text-[13px] font-bold px-3 py-1 rounded-full">
                  -
                  {Math.round(
                    (1 - product.price / product.originalPrice) * 100,
                  )}
                  % OFF
                </div>
              )}
            </div>

            {/* Trust badges row */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { icon: <Shield size={16} />, text: "NAFDAC Verified" },
                { icon: <Truck size={16} />, text: "Free shipping ₦15k+" },
                { icon: <RotateCcw size={16} />, text: "14-day returns" },
              ].map((b) => (
                <div
                  key={b.text}
                  className="flex flex-col items-center gap-1.5 bg-white rounded-xl p-3 border border-(--cream-dark) text-center"
                >
                  <span className="text-(--green-mid)">{b.icon}</span>
                  <span className="text-[11px] text-(--text-muted) font-medium leading-tight">
                    {b.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <p className="text-[12px] uppercase tracking-[0.12em] text-(--text-muted) font-medium mb-2">
              {product.category}
            </p>
            <h1 className="font-serif text-[clamp(28px,3.5vw,40px)] font-medium text-(--green-deep) leading-[1.1] mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={15}
                    className={
                      s <= Math.round(product.rating)
                        ? "fill-(--gold) text-(--gold)"
                        : "text-(--cream-dark) fill-(--cream-dark)"
                    }
                  />
                ))}
              </div>
              <span className="text-[14px] font-medium text-(--text-dark)">
                {product.rating}
              </span>
              <span className="text-[14px] text-(--text-muted)">
                ({product.reviews} reviews)
              </span>
            </div>

            <p className="text-[15px] text-(--text-body) leading-relaxed font-light mb-6">
              {product.shortDesc}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="pill">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-[36px] font-semibold text-(--green-mid)">
                {formatNaira(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[20px] text-(--text-muted) line-through font-light">
                  {formatNaira(product.originalPrice)}
                </span>
              )}
              <span className="text-[14px] text-(--text-muted)">
                / {product.unit}
              </span>
            </div>

            {/* Stock */}
            {product.stockCount && product.stockCount < 20 && (
              <p className="text-[13px] text-orange-600 font-medium mb-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Only {product.stockCount} left in stock — order soon
              </p>
            )}

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-4 mb-5">
              <QuantitySelector
                value={qty}
                onChange={setQty}
                max={product.stockCount ?? 99}
                size="lg"
              />
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-full font-medium text-[15px] text-white transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: added ? "var(--green-mid)" : "var(--green-deep)",
                }}
              >
                {added ? (
                  <>
                    <Check size={18} />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Add to Cart — {formatNaira(product.price * qty)}
                  </>
                )}
              </button>
            </div>

            <Button
              variant="secondary"
              size="lg"
              href="/checkout"
              className="w-full justify-center"
            >
              Buy Now
            </Button>
          </motion.div>
        </div>

        {/* Tabs section */}
        <div className="bg-white rounded-2xl border border-(--cream-dark) overflow-hidden mb-16">
          {/* Tab nav */}
          <div className="flex border-b border-(--cream-dark) overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-[14px] font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "text-(--green-deep) border-(--green-deep)"
                    : "text-(--text-muted) border-transparent hover:text-(--text-body)"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-8">
            {activeTab === "description" && (
              <p className="text-[15px] text-(--text-body) leading-relaxed font-light max-w-2xl">
                {product.longDesc ?? product.shortDesc}
              </p>
            )}
            {activeTab === "ingredients" && (
              <ul className="space-y-2.5 max-w-lg">
                {(
                  product.ingredients ?? ["See label for full ingredients list"]
                ).map((ing) => (
                  <li
                    key={ing}
                    className="flex items-start gap-2.5 text-[14px] text-(--text-body)"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-(--green-mid) mt-2 shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            )}
            {activeTab === "how-to-use" && (
              <p className="text-[15px] text-(--text-body) leading-relaxed font-light max-w-2xl">
                {product.howToUse ??
                  "Follow directions on packaging or consult your healthcare provider."}
              </p>
            )}
            {activeTab === "warnings" && (
              <ul className="space-y-3 max-w-lg">
                {(
                  product.warnings ?? [
                    "Keep out of reach of children",
                    "Consult your doctor if pregnant or breastfeeding",
                  ]
                ).map((w) => (
                  <li
                    key={w}
                    className="flex items-start gap-2.5 text-[14px] text-(--text-body)"
                  >
                    <span className="text-orange-500 mt-0.5 shrink-0">⚠️</span>
                    {w}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="font-serif text-[28px] font-semibold text-(--green-deep) mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
