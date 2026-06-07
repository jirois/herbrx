"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
    >
      <div className="group border border-(--cream-dark) rounded-2xl overflow-hidden bg-(--cream) hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(26,58,42,0.10)] transition-all duration-300 flex flex-col h-full">
        {/* Thumbnail */}
        <div
          className="h-45 flex items-center justify-center text-[52px] relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${product.gradientFrom}, ${product.gradientTo})`,
          }}
        >
          <span className="select-none" role="img" aria-label={product.name}>
            {product.emoji}
          </span>

          {/* Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={product.badgeVariant} size="sm">
              {product.badge}
            </Badge>
          </div>

          {/* Quick view on hover */}
          <div className="absolute inset-0 bg-(--green-deep)/0 group-hover:bg-(--green-deep)/10 transition-colors duration-300 flex items-center justify-center">
            <span className="text-[13px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-(--green-deep)/80 px-4 py-1.5 rounded-full">
              Quick view
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 pb-5 flex flex-col flex-1">
          <div className="font-serif text-[17px] font-semibold text-(--green-deep) mb-1 leading-snug">
            {product.name}
          </div>
          <div className="text-[11px] text-(--text-muted) uppercase tracking-[0.06em] mb-2">
            {product.type}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <Star size={12} className="fill-(--gold) text-(--gold)" />
            <span className="text-[12px] font-medium text-(--text-dark)">
              {product.rating}
            </span>
            <span className="text-[12px] text-(--text-muted)">
              ({product.reviews})
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-(--green-pale)/50 text-(--green-mid) px-2.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Price + CTA */}
          <div className="mt-auto flex items-center justify-between">
            <div>
              <span className="font-serif text-[20px] font-semibold text-(--green-mid)">
                {formatNaira(product.price)}
              </span>
              <span className="text-[12px] text-(--text-muted) ml-1">
                /{product.unit}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 active:scale-90"
              style={{
                background: added ? "var(--green-mid)" : "var(--green-deep)",
              }}
            >
              {added ? <Check size={16} /> : <ShoppingCart size={15} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
