"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Package,
  Mail,
  ArrowRight,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";
import { ProductImage } from "@/components/ui/product-image";
import type { Order } from "@/types";

export function OrderSuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("herbrx_last_order");
      if (stored) {
        // Defer state update to avoid synchronous setState inside effect
        const parsed = JSON.parse(stored);
        setTimeout(() => setOrder(parsed), 0);
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-(--cream) py-16 px-6">
      <div className="max-w-150 mx-auto text-center">
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 16,
            delay: 0.15,
          }}
          className="w-24 h-24 bg-(--green-pale) rounded-full flex items-center justify-center mx-auto mb-7"
        >
          <CheckCircle size={46} className="text-(--green-mid)" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="font-serif text-[clamp(28px,4vw,42px)] font-medium text-(--green-deep) mb-3">
            Order Confirmed! 🎉
          </h1>
          <p className="text-[16px] text-(--text-muted) font-light mb-10 leading-relaxed max-w-110 mx-auto">
            Thank you for shopping with HerbRx. Your order has been received and
            will be processed shortly.
          </p>
        </motion.div>

        {/* Order detail card */}
        {(orderId || order) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl border border-(--cream-dark) p-6 mb-8 text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-(--cream-dark)">
              <div>
                <p className="text-[11px] text-(--text-muted) uppercase tracking-widest mb-0.5">
                  Order ID
                </p>
                <p className="font-mono text-[17px] font-semibold text-(--green-deep)">
                  {orderId ?? order?.id ?? "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-(--text-muted) uppercase tracking-widest mb-0.5">
                  Total Paid
                </p>
                <p className="font-serif text-[22px] font-semibold text-(--green-mid)">
                  {order ? formatNaira(order.total) : "—"}
                </p>
              </div>
            </div>

            {/* Items */}
            {order?.items && order.items.length > 0 && (
              <div className="space-y-3 mb-5">
                {order.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${item.product.gradientFrom}, ${item.product.gradientTo})`,
                      }}
                    >
                      <ProductImage
                        src={item.product.imageUrl}
                        emoji={item.product.emoji}
                        size="w-12 h-12"
                        theme="light"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-(--text-dark) truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[12px] text-(--text-muted)">
                        Qty {item.quantity} × {formatNaira(item.product.price)}
                      </p>
                    </div>
                    <span className="text-[13px] font-semibold text-(--green-mid) fshrink-0">
                      {formatNaira(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Delivery info */}
            {order?.customer && (
              <div className="bg-(--cream) rounded-xl p-4 space-y-2 border-t border-(--cream-dark) mt-4 pt-4">
                <p className="text-[11px] text-(--text-muted) uppercase tracking-widest mb-2">
                  Delivering to
                </p>
                <div className="flex items-start gap-2 text-[13px] text-(--text-body)">
                  <MapPin
                    size={14}
                    className="text-(--green-mid) mt-0.5 shrink-0"
                  />
                  <span>
                    {order.customer.firstName} {order.customer.lastName},{" "}
                    {order.customer.address}, {order.customer.city},{" "}
                    {order.customer.state}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-(--text-body)">
                  <Phone size={14} className="text-(--green-mid) shrink-0" />
                  <span>{order.customer.phone}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* What's next cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid sm:grid-cols-2 gap-4 mb-10"
        >
          {[
            {
              icon: <Mail size={20} />,
              title: "Check your email",
              desc: "Confirmation + receipt sent to your inbox",
            },
            {
              icon: <Package size={20} />,
              title: "Track your delivery",
              desc: "Tracking info sent within 24 hours",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl border border-(--cream-dark) p-4 flex items-start gap-3 text-left"
            >
              <div className="p-2 bg-(--green-pale) rounded-lg text-(--green-mid) shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="font-medium text-[14px] text-(--text-dark)">
                  {item.title}
                </p>
                <p className="text-[12px] text-(--text-muted) mt-0.5 font-light">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button variant="primary" size="lg" href="/store">
            Continue Shopping <ArrowRight size={16} />
          </Button>
          <Button variant="outline" size="lg" href="/">
            Back to Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
