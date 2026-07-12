"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  CheckCircle,
  Clock,
  Truck,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductImage } from "@/components/ui/product-image";
import type { Order } from "@/types";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode; step: number }
> = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock size={13} />,
    step: 1,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-700",
    icon: <CheckCircle size={13} />,
    step: 2,
  },
  processing: {
    label: "Processing",
    color: "bg-purple-100 text-purple-700",
    icon: <Clock size={13} />,
    step: 2,
  },
  shipped: {
    label: "Shipped",
    color: "bg-indigo-100 text-indigo-700",
    icon: <Truck size={13} />,
    step: 3,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle size={13} />,
    step: 4,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-600",
    icon: <Clock size={13} />,
    step: 0,
  },
};

function OrderProgressBar({ status }: { status: string }) {
  const step = statusConfig[status]?.step ?? 0;
  const steps = ["Confirmed", "Processing", "Shipped", "Delivered"];

  if (status === "cancelled") {
    return (
      <p className="text-[12px] text-red-500 font-medium">
        This order was cancelled
      </p>
    );
  }

  return (
    <div className="flex items-center gap-0 mt-3">
      {steps.map((s, i) => {
        const done = step > i + 1;
        const current = step === i + 1;
        return (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                done || current
                  ? "bg-(--green-mid) text-white"
                  : "bg-(--cream-dark) text-(--text-muted)"
              }`}
            >
              {done ? "✓" : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 transition-colors ${done ? "bg-(--green-mid)" : "bg-(--cream-dark)"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const st = statusConfig[order.status] ?? statusConfig.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl border border-(--cream-dark) overflow-hidden"
    >
      {/* Header row */}
      <div className="p-5 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <p className="font-mono text-[14px] font-semibold text-(--green-deep)">
              {order.id}
            </p>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${st.color}`}
            >
              {st.icon} {st.label}
            </span>
            {order.paymentStatus === "paid" && (
              <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Paid ✓
              </span>
            )}
          </div>
          <p className="text-[12px] text-(--text-muted)">
            {new Date(order.createdAt).toLocaleDateString("en-NG", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {order.paystackRef && (
              <span className="ml-2 font-mono opacity-70">
                Ref: {order.paystackRef}
              </span>
            )}
          </p>
        </div>

        {/* Product thumbnails */}
        <div className="flex items-center gap-1.5">
          {order.items.slice(0, 3).map((item) => (
            <div
              key={item.product.id}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[18px] shrink-0"
              style={{
                background: `linear-gradient(135deg, ${item.product.gradientFrom}, ${item.product.gradientTo})`,
              }}
              title={item.product.name}
            >
              {item.product.emoji}
            </div>
          ))}
          {order.items.length > 3 && (
            <span className="text-[11px] text-(--text-muted) shrink-0">
              +{order.items.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <p className="font-serif text-[18px] font-semibold text-(--green-mid)">
            {formatNaira(order.total)}
          </p>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-8 h-8 rounded-full border border-(--cream-dark) flex items-center justify-center hover:bg-(--cream) transition-colors text-(--text-muted)"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Expandable detail */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-(--cream-dark) px-5 py-5 bg-(--cream)"
        >
          {/* Progress bar */}
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-widest text-(--text-muted) font-medium mb-2">
              Order Progress
            </p>
            <OrderProgressBar status={order.status} />
          </div>

          {/* Items */}
          <div className="space-y-3 mb-5">
            {order.items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${item.product.gradientFrom}, ${item.product.gradientTo})`,
                  }}
                >
                  <ProductImage
                    src={item.product.imageUrl}
                    emoji={item.product.emoji}
                    size="w-10 h-10"
                    theme="light"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-(--text-dark) truncate">
                    {item.product.name}
                  </p>
                  <p className="text-[12px] text-(--text-muted)">
                    {item.product.type} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-[13px] font-semibold text-(--green-mid) shrink-0">
                  {formatNaira(item.product.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Delivery address */}
          <div className="bg-white rounded-xl p-4 border border-(--cream-dark) text-[13px] text-(--text-body)">
            <p className="text-[11px] text-(--text-muted) uppercase tracking-wide font-medium mb-1">
              Deliver to
            </p>
            {order.customer.firstName} {order.customer.lastName} ·{" "}
            {order.customer.address}, {order.customer.city},{" "}
            {order.customer.state}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function OrderHistory({ orders }: { orders: Order[] }) {
  return (
    <div className="min-h-screen bg-(--cream)">
      <div className="bg-(--green-deep) py-12">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-[13px] mb-4 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Account
          </Link>
          <div className="flex items-center gap-3">
            <Package size={24} className="text-(--gold-light)" />
            <h1 className="font-serif text-[32px] font-medium text-white">
              My Orders
            </h1>
            {orders.length > 0 && (
              <span className="bg-white/15 text-white/80 text-[12px] px-2.5 py-0.5 rounded-full font-medium">
                {orders.length}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 py-10">
        {orders.length === 0 ? (
          <EmptyState
            emoji="📦"
            title="No orders yet"
            description="Once you place an order, it will appear here with live status tracking."
            action={{ label: "Start Shopping", href: "/store" }}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <OrderCard key={order.id} order={order} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
