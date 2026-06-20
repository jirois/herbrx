"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingBag,
  User,
  Settings,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import type { Order } from "@/types";
import Image from "next/image";

interface Props {
  user: {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    phone?: string;
    image?: string;
  };
  recentOrders: Order[];
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock size={12} />,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-700",
    icon: <CheckCircle size={12} />,
  },
  processing: {
    label: "Processing",
    color: "bg-purple-100 text-purple-700",
    icon: <Clock size={12} />,
  },
  shipped: {
    label: "Shipped",
    color: "bg-indigo-100 text-indigo-700",
    icon: <Package size={12} />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle size={12} />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-600",
    icon: <Clock size={12} />,
  },
};

export function AccountDashboard({ user, recentOrders }: Props) {
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const totalSpend = recentOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + o.total, 0);

  const quickLinks = [
    {
      href: "/account/orders",
      icon: <Package size={20} />,
      label: "My Orders",
      desc: `${recentOrders.length} orders`,
    },
    {
      href: "/store",
      icon: <ShoppingBag size={20} />,
      label: "Shop Products",
      desc: "Verified herbal products",
    },
    {
      href: "/account/settings",
      icon: <Settings size={20} />,
      label: "Settings",
      desc: "Profile & preferences",
    },
  ];

  return (
    <div className="min-h-screen bg-(--cream)">
      {/* Header */}
      <div className="bg-(--green-deep) py-12">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-5">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                height={16}
                width={16}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-(--green-mid) border-2 border-white/20 flex items-center justify-center font-serif text-[24px] font-semibold text-white">
                {initials}
              </div>
            )}
            <div>
              <p className="text-white/60 text-[12px] uppercase tracking-widest mb-0.5">
                Welcome back
              </p>
              <h1 className="font-serif text-[28px] font-medium text-white">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-white/50 text-[13px]">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Total Orders",
              value: recentOrders.length.toString(),
              icon: "📦",
            },
            {
              label: "Total Spent",
              value: formatNaira(totalSpend),
              icon: "💳",
            },
            {
              label: "Saved Address",
              value: recentOrders[0]?.customer.city ?? "—",
              icon: "📍",
            },
            {
              label: "Member Since",
              value: new Date().getFullYear().toString(),
              icon: "🌿",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-(--cream-dark) p-5"
            >
              <p className="text-[24px] mb-2">{stat.icon}</p>
              <p className="font-serif text-[20px] font-semibold text-(--green-deep)">
                {stat.value}
              </p>
              <p className="text-[12px] text-(--text-muted) mt-0.5">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Recent orders */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-[22px] font-semibold text-(--green-deep)">
                Recent Orders
              </h2>
              <Link
                href="/account/orders"
                className="text-[13px] text-(--green-mid) font-medium hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-(--cream-dark) p-10 text-center">
                <p className="text-[40px] mb-3">🌿</p>
                <p className="font-serif text-[18px] text-(--green-deep) mb-2">
                  No orders yet
                </p>
                <p className="text-[13px] text-(--text-muted) mb-5">
                  Start exploring our verified products
                </p>
                <Link
                  href="/store"
                  className="inline-flex items-center gap-2 bg-(--green-deep) text-white text-[13px] font-medium px-5 py-2.5 rounded-full hover:bg-(--green-mid) transition-colors"
                >
                  Shop Now <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order, i) => {
                  const st = statusConfig[order.status] ?? statusConfig.pending;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="bg-white rounded-2xl border border-(--cream-dark) p-5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-mono text-[13px] font-semibold text-(--green-deep)">
                            {order.id}
                          </p>
                          <p className="text-[12px] text-(--text-muted) mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-NG",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${st.color}`}
                          >
                            {st.icon} {st.label}
                          </span>
                          <span className="font-serif text-[16px] font-semibold text-(--green-mid)">
                            {formatNaira(order.total)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {order.items.slice(0, 3).map((item) => (
                          <div
                            key={item.product.id}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-[18px]"
                            style={{
                              background: `linear-gradient(135deg, ${item.product.gradientFrom}, ${item.product.gradientTo})`,
                            }}
                            title={item.product.name}
                          >
                            {item.product.emoji}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-[12px] text-(--text-muted)">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h2 className="font-serif text-[22px] font-semibold text-(--green-deep) mb-5">
              Quick Links
            </h2>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-4 bg-white rounded-xl border border-(--cream-dark) p-4 hover:border-(--green-mid) hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 bg-(--green-pale) rounded-xl flex items-center justify-center text-(--green-mid) shrink-0 group-hover:bg-(--green-mid) group-hover:text-white transition-all">
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-(--text-dark)">
                      {link.label}
                    </p>
                    <p className="text-[12px] text-(--text-muted)">
                      {link.desc}
                    </p>
                  </div>
                  <ArrowRight
                    size={15}
                    className="text-(--text-muted) group-hover:text-(--green-mid) transition-colors"
                  />
                </Link>
              ))}
            </div>

            {/* Profile card */}
            <div className="mt-5 bg-(--green-deep) rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <User size={18} className="text-(--gold-light)" />
                <h3 className="font-medium text-[15px]">Your Profile</h3>
              </div>
              <div className="space-y-1.5 text-[13px] text-white/60">
                <p>
                  {user.firstName} {user.lastName}
                </p>
                <p>{user.email}</p>
                {user.phone && <p>{user.phone}</p>}
              </div>
              <Link
                href="/account/settings"
                className="inline-flex items-center gap-1.5 mt-4 text-[12px] text-(--gold-light) hover:text-white transition-colors"
              >
                Edit profile <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
