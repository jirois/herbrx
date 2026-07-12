"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { DashboardShell } from "./dashboard-shell";
import { formatNaira, cn } from "@/lib/utils";
import { ExternalLink, Star } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import type { Product } from "@/types";

interface Props {
  products: Product[];
  topProducts: { name: string; emoji: string; revenue: number; qty: number }[];
}

const badgeStyles: Record<string, string> = {
  gold: "bg-[var(--gold)]/20  text-[var(--gold-light)]",
  green: "bg-[var(--green-mid)]/30 text-[var(--green-pale)]",
  teal: "bg-teal-500/15 text-teal-400",
};

export function ProductsDashboard({ products, topProducts }: Props) {
  const revenueMap: Record<string, number> = {};
  const qtyMap: Record<string, number> = {};
  topProducts.forEach((p) => {
    const matched = products.find((pr) => pr.name === p.name);
    if (matched) {
      revenueMap[matched.id] = p.revenue;
      qtyMap[matched.id] = p.qty;
    }
  });

  const totalRevenue = Object.values(revenueMap).reduce((s, v) => s + v, 0);
  const totalUnits = Object.values(qtyMap).reduce((s, v) => s + v, 0);
  const inStock = products.filter((p) => p.inStock).length;
  const lowStock = products.filter((p) => (p.stockCount ?? 99) < 20).length;

  return (
    <DashboardShell
      heading="Products"
      subheading="Inventory performance and revenue by product"
    >
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Products",
            value: products.length.toString(),
            icon: "📦",
          },
          { label: "In Stock", value: inStock.toString(), icon: "✅" },
          { label: "Low Stock", value: lowStock.toString(), icon: "⚠️" },
          {
            label: "Total Units Sold",
            value: totalUnits.toString(),
            icon: "🌿",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-[#161B27] border border-white/[0.07] rounded-2xl p-5"
          >
            <div className="text-[24px] mb-3">{s.icon}</div>
            <p className="font-serif text-[24px] font-semibold text-white leading-none mb-1">
              {s.value}
            </p>
            <p className="text-[12px] text-white/40">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Products table */}
      <div className="bg-[#161B27] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h3 className="font-serif text-[17px] font-semibold text-white">
            All Products
          </h3>
          <Link
            href="/store"
            target="_blank"
            className="flex items-center gap-1.5 text-[12px] text-(--green-pale) hover:text-white transition-colors"
          >
            View Storefront <ExternalLink size={12} />
          </Link>
        </div>

        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_100px_120px_120px_90px_80px] px-6 py-3 border-b border-white/[0.07] bg-white/2">
          {["Product", "Badge", "Price", "Revenue", "Units", "Stock"].map(
            (h) => (
              <span
                key={h}
                className="text-[11px] uppercase tracking-widest text-white/25 font-medium"
              >
                {h}
              </span>
            ),
          )}
        </div>

        {products.map((product, i) => {
          const rev = revenueMap[product.id] ?? 0;
          const qty = qtyMap[product.id] ?? 0;
          const stockLow = (product.stockCount ?? 99) < 20;
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.025 }}
              className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_100px_120px_120px_90px_80px] items-center px-6 py-3.5 border-b border-white/4 hover:bg-white/2.5 transition-colors"
            >
              {/* Product info */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[22px] shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${product.gradientFrom}, ${product.gradientTo})`,
                  }}
                >
                  <ProductImage
                    src={product.imageUrl ?? null}
                    emoji={product.emoji}
                    size="w-9 h-9"
                    theme="dark"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={10} className="fill-(--gold) text-(--gold)" />
                    <span className="text-[11px] text-white/35">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                </div>
              </div>

              {/* Badge */}
              <div className="hidden md:block">
                <span
                  className={cn(
                    "text-[11px] font-medium px-2.5 py-1 rounded-full",
                    badgeStyles[product.badgeVariant] ?? "",
                  )}
                >
                  {product.badge}
                </span>
              </div>

              {/* Price */}
              <p className="hidden md:block font-serif text-[14px] text-white">
                {formatNaira(product.price)}
                <span className="text-white/30 text-[11px]">
                  /{product.unit}
                </span>
              </p>

              {/* Revenue */}
              <p className="hidden md:block font-serif text-[14px] font-semibold text-white">
                {rev > 0 ? (
                  formatNaira(rev)
                ) : (
                  <span className="text-white/25">{totalRevenue}</span>
                )}
              </p>

              {/* Units */}
              <p className="hidden md:block text-[13px] text-white/50">
                {qty > 0 ? qty : "—"}
              </p>

              {/* Stock */}
              <div className="flex items-center justify-end md:justify-start gap-2">
                <span className="md:hidden font-serif text-[13px] text-white">
                  {formatNaira(product.price)}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium px-2.5 py-1 rounded-full",
                    stockLow
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-green-500/15 text-green-400",
                  )}
                >
                  {stockLow ? `Low (${product.stockCount})` : "In Stock"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
