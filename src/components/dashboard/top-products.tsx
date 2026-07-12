"use client";

import { motion } from "framer-motion";
import { formatNaira } from "@/lib/utils";
import { ProductImage } from "@/components/ui/product-image";
interface TopProductsProps {
  products: {
    name: string;
    emoji: string;
    revenue: number;
    qty: number;
    imageUrl?: string | null;
  }[];
}

export function TopProducts({ products }: TopProductsProps) {
  const max = Math.max(...products.map((p) => p.revenue), 1);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.35 }}
      className="bg-[#161B27] border border-white/[0.07] rounded-2xl p-6"
    >
      <h3 className="font-serif text-[17px] font-semibold text-white mb-5">
        Top Products
      </h3>
      <div className="space-y-4">
        {products.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.07 }}
          >
            <div className="flex items-center gap-3 mb-1.5">
              <ProductImage
                src={p.imageUrl ?? null}
                emoji={p.emoji}
                size="w-8 h-8"
                theme="dark"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white truncate">
                  {p.name}
                </p>
                <p className="text-[11px] text-white/35">{p.qty} units sold</p>
              </div>
              <span className="font-serif text-[14px] font-semibold text-white shrink-0">
                {formatNaira(p.revenue)}
              </span>
            </div>
            <div className="h-1.5 bg-white/6 rounded-full overflow-hidden ml-9">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(p.revenue / max) * 100}%` }}
                transition={{
                  duration: 0.7,
                  delay: 0.4 + i * 0.08,
                  ease: "easeOut",
                }}
                className="h-full rounded-full bg-linear-to-r from-(--green-mid) to-(--green-pale)"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
