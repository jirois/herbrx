"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { formatNaira, cn } from "@/lib/utils";
import { ProductImage } from "@/components/ui/product-image";
import type { Order } from "@/types";

const statusStyles: Record<string, string> = {
  delivered: "bg-green-500/15  text-green-400",
  shipped: "bg-blue-500/15   text-blue-400",
  confirmed: "bg-[#2D5A3D]/40 text-[#C8DABB]",
  processing: "bg-purple-500/15 text-purple-400",
  pending: "bg-amber-500/15  text-amber-400",
  cancelled: "bg-red-500/15    text-red-400",
};
const payStyles: Record<string, string> = {
  paid: "text-green-400",
  pending: "text-amber-400",
  failed: "text-red-400",
};

interface Props {
  orders: Order[];
  limit?: number;
  showViewAll?: boolean;
}

export function RecentTransactions({
  orders,
  limit = 8,
  showViewAll = true,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const visible = orders.slice(0, limit);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 }}
      className="bg-[#161B27] border border-white/[0.07] rounded-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
        <h3 className="font-serif text-[17px] font-semibold text-white">
          Recent Transactions
        </h3>
        {showViewAll && (
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-1 text-[12px] text-(--green-pale) hover:text-white transition-colors font-medium"
          >
            View all <ArrowRight size={13} />
          </Link>
        )}
      </div>

      <div className="hidden md:grid grid-cols-[1fr_140px_100px_100px_80px] px-6 py-2.5 border-b border-white/4">
        {["Customer", "Order ID", "Amount", "Status", "Payment"].map((h) => (
          <span
            key={h}
            className="text-[11px] uppercase tracking-widest text-white/25 font-medium"
          >
            {h}
          </span>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="py-16 text-center text-white/30 text-[14px]">
          No transactions yet
        </div>
      )}

      {visible.map((order, i) => {
        const st = statusStyles[order.status] ?? statusStyles.pending;
        const pay = payStyles[order.paymentStatus] ?? payStyles.pending;
        const exp = expanded === order.id;
        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <div
              onClick={() => setExpanded(exp ? null : order.id)}
              className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_140px_100px_100px_80px] items-center px-6 py-3.5 border-b border-white/4 hover:bg-white/2.5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-(--green-deep) flex items-center justify-center text-[11px] font-bold text-(--green-pale) shrink-0">
                  {order.customer.firstName[0]}
                  {order.customer.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-[11px] text-white/35 truncate hidden md:block">
                    {order.customer.email}
                  </p>
                </div>
              </div>
              <div className="hidden md:block">
                <p className="text-[12px] font-mono text-white/50">
                  {order.id}
                </p>
                <p className="text-[10px] text-white/25 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
              <p className="hidden md:block font-serif text-[14px] font-semibold text-white">
                {formatNaira(order.total)}
              </p>
              <div className="hidden md:block">
                <span
                  className={cn(
                    "text-[11px] font-medium px-2.5 py-1 rounded-full capitalize",
                    st,
                  )}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end md:justify-start">
                <span
                  className={cn(
                    "text-[12px] font-medium hidden md:inline capitalize",
                    pay,
                  )}
                >
                  {order.paymentStatus}
                </span>
                <span className="md:hidden font-serif text-[14px] font-semibold text-white">
                  {formatNaira(order.total)}
                </span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-white/25 transition-transform",
                    exp && "rotate-180",
                  )}
                />
              </div>
            </div>
            {exp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-white/2.5 border-b border-white/4 px-6 py-4"
              >
                <div className="grid sm:grid-cols-3 gap-4 text-[13px]">
                  <div>
                    <p className="text-white/35 text-[11px] uppercase tracking-wide mb-1">
                      Delivery
                    </p>
                    <p className="text-white/70">
                      {order.customer.address}, {order.customer.city},{" "}
                      {order.customer.state}
                    </p>
                    <p className="text-white/45">{order.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-white/35 text-[11px] uppercase tracking-wide mb-1">
                      Items
                    </p>
                    {order.items.map((item) => (
                      <p key={item.product.id} className="text-white/70">
                        <ProductImage
                          src={item.product.imageUrl ?? null}
                          emoji={item.product.emoji}
                          size="w-9 h-9"
                          theme="dark"
                        />
                        {item.product.name} ×{item.quantity}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="text-white/35 text-[11px] uppercase tracking-wide mb-1">
                      Paystack Ref
                    </p>
                    <p className="font-mono text-white/50 text-[12px] break-all">
                      {order.paystackRef ?? "—"}
                    </p>
                    <p className="text-white/35 mt-1">
                      {new Date(order.createdAt).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
