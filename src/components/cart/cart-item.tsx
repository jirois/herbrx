"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { formatNaira } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types";

export function CartItem({ item }: { item: CartItemType }) {
  const { removeItem, updateQty } = useCart();
  const { product, quantity } = item;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.22 }}
      className="flex gap-4 py-4 border-b border-(--cream-dark) last:border-0"
    >
      {/* Thumbnail */}
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center text-[28px] shrink-0"
        style={{
          background: `linear-gradient(135deg, ${product.gradientFrom}, ${product.gradientTo})`,
        }}
        aria-hidden="true"
      >
        {product.emoji}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-serif text-[15px] font-semibold text-(--green-deep) leading-snug truncate">
          {product.name}
        </p>
        <p className="text-[12px] text-(--text-muted) mt-0.5">{product.type}</p>

        <div className="flex items-center justify-between mt-2.5">
          {/* Qty stepper */}
          <div className="flex items-center gap-1 bg-(--cream-dark) rounded-full px-1 py-0.5">
            <button
              onClick={() => updateQty(product.id, quantity - 1)}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-[13px] font-medium text-(--text-dark)">
              {quantity}
            </span>
            <button
              onClick={() => updateQty(product.id, quantity + 1)}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Price */}
          <span className="font-serif text-[16px] font-semibold text-(--green-mid)">
            {formatNaira(product.price * quantity)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(product.id)}
        className="self-start mt-0.5 p-1.5 rounded-lg text-(--text-muted) hover:text-red-500 hover:bg-red-50 transition-all"
        aria-label={`Remove ${product.name} from cart`}
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}
