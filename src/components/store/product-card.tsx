"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import type { StoreProduct, Product } from "@/types";

const DEFAULT_GRADIENT: [string, string] = ['#C8DABB', '#A8C999']

interface ProductCardProps {
  product: StoreProduct;
  index?: number;
  /** Real review data for this product, if the parent grid fetched it via
   *  useReviewSummaries. Falls back to the static catalog's placeholder
   *  rating when not provided (e.g. while the batched fetch is loading). */
  liveSummary?: { average: number; count: number } | null;
}

export function ProductCard({
  product,
  index = 0,
  liveSummary,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    // product is a StoreProduct (subset). Force-cast to Product for cart API
    addItem(product as unknown as Product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }
const [gradientFrom, gradientTo] = DEFAULT_GRADIENT

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
    >
      <Link href={`/store/${product.slug}`} className="group block">
        <div className="border border-(--cream-dark) rounded-2xl overflow-hidden bg-(--cream) hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(26,58,42,0.10)] transition-all duration-300 flex flex-col h-full">
          {/* Thumbnail */}
          <div
            className="h-45 flex items-center justify-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            }}
          >
            {product.imageUrl ? (
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span
                className="text-[52px] select-none transition-transform duration-300 group-hover:scale-110"
                role="img"
                aria-label={product.name}
              >
                {product.emoji}
              </span>
            )}
            <div className="absolute top-3 left-3">
              <Badge variant={product.badgeVariant} size="sm">
                {product.badge}
              </Badge>
            </div>
            {product.originalPrice && (
              <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}
                %
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 pb-5 flex flex-col flex-1">
            <p className="font-serif text-[17px] font-semibold text-(--green-deep) mb-0.5 leading-snug">
              {product.name}
            </p>
            {product.type && (
              <p className="text-[11px] text-(--text-muted) uppercase tracking-[0.06em] mb-2">
                {product.type}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              {liveSummary && liveSummary.count > 0 ? (
                <>
                  <Star size={12} className="fill-(--gold) text-(--gold)" />
                  <span className="text-[12px] font-medium text-(--text-dark)">
                    {liveSummary.average.toFixed(1)}
                  </span>
                  <span className="text-[12px] text-(--text-muted)">
                    ({liveSummary.count})
                  </span>
                </>
              ) : liveSummary ? (
                <span className="text-[11px] text-(--text-muted)">
                  No reviews yet
                </span>
              ) : (
                <>
                  <Star size={12} className="fill-(--gold) text-(--gold)" />
                  <span className="text-[12px] font-medium text-(--text-dark)">
                    {product.rating}
                  </span>
                  <span className="text-[12px] text-(--text-muted)">
                    ({product.reviews})
                  </span>
                </>
              )}
            </div>

            {/* Price + CTA */}
            <div className="mt-auto flex items-center justify-between">
              <div>
                <span className="font-serif text-[20px] font-semibold text-(--green-mid)">
                  {formatNaira(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-[13px] text-(--text-muted) line-through ml-1.5">
                    {formatNaira(product.originalPrice)}
                  </span>
                )}
                <span className="text-[11px] text-(--text-muted) block">
                  /{product.unit}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                aria-label={`Add ${product.name} to cart`}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 active:scale-90 shrink-0"
                style={{
                  background: added ? "var(--green-mid)" : "var(--green-deep)",
                }}
              >
                {added ? <Check size={16} /> : <ShoppingCart size={15} />}
              </button>
            </div>

            {/* Low stock */}
            {product.stockCount && product.stockCount < 20 && (
              <p className="text-[11px] text-orange-600 font-medium mt-2">
                Only {product.stockCount} left in stock
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
