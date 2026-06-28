"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useProducerProducts } from "@/hooks/dashboard-hooks";
import {
  Package,
  BadgeCheck,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const tierConfig = {
  UNVERIFIED: {
    color: "border-white/10 bg-white/[0.04]",
    badge: "bg-white/10 text-white/50",
    icon: "🔒",
    label: "Tier 1 — Unverified",
    desc: "You can list basic product information. Submit batch COA documents to unlock marketplace selling rights.",
    cta: "Start Verification →",
    ctaHref: "/dashboard/producer/verification",
  },
  VERIFIED: {
    color: "border-[var(--green-mid)]/30 bg-[var(--green-mid)]/5",
    badge: "bg-[var(--green-mid)]/20 text-[var(--green-pale)]",
    icon: "✅",
    label: "Tier 2 — HerbRx Verified",
    desc: 'You have marketplace selling rights and the "Verified Safe" badge on all approved products.',
    cta: "Manage Products →",
    ctaHref: "/dashboard/producer/products",
  },
};

const mockProducts = [
  { id: "1", name: "Moringa Gold Capsules", status: "APPROVED", batches: 3 },
  { id: "2", name: "Bitter Leaf Tonic", status: "PENDING_REVIEW", batches: 1 },
  { id: "3", name: "Shea Butter Balm", status: "DRAFT", batches: 0 },
  { id: "4", name: "Zobo Immune Blend", status: "FLAGGED", batches: 2 },
];

const statusConfig: Record<
  string,
  { badge: string; icon: React.ReactNode; label: string }
> = {
  APPROVED: {
    badge: "bg-green-500/15 text-green-400",
    icon: <CheckCircle size={13} />,
    label: "Approved",
  },
  PENDING_REVIEW: {
    badge: "bg-amber-500/15 text-amber-400",
    icon: <Clock size={13} />,
    label: "Under Review",
  },
  DRAFT: {
    badge: "bg-white/10 text-white/50",
    icon: <Package size={13} />,
    label: "Draft",
  },
  FLAGGED: {
    badge: "bg-red-500/15 text-red-400",
    icon: <AlertTriangle size={13} />,
    label: "Flagged",
  },
  BANNED: {
    badge: "bg-red-900/30 text-red-500",
    icon: <XCircle size={13} />,
    label: "Banned",
  },
};

interface Props {
  user: { firstName: string };
  tier?: "UNVERIFIED" | "VERIFIED";
}

export function ProducerDashboard({ user, tier = "UNVERIFIED" }: Props) {
  const { data: productsData } = useProducerProducts();
  const realProducts = productsData?.products ?? [];
  const realTier =
    (productsData?.tier as "UNVERIFIED" | "VERIFIED" | undefined) ?? tier;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const tc = tierConfig[realTier];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-semibold text-white">
          {greeting}, {user.firstName} 👋
        </h1>
        <p className="text-[14px] text-white/45 font-light mt-1">
          Compliance & Growth Suite — manage your products and certifications.
        </p>
      </div>

      {/* Verification tier card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`rounded-2xl border p-6 mb-6 ${tc.color}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-[22px]">{tc.icon}</span>
              <span
                className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${tc.badge}`}
              >
                {tc.label}
              </span>
            </div>
            <p className="text-[14px] text-white/60 leading-relaxed">
              {tc.desc}
            </p>
          </div>
          <Link
            href={tc.ctaHref}
            className="inline-flex items-center gap-1.5 bg-(--green-mid) hover:bg-(--green-light) text-white text-[13px] font-medium px-5 py-2.5 rounded-xl transition-colors shrink-0"
          >
            {tc.cta}
          </Link>
        </div>

        {tier === "UNVERIFIED" && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { step: "1", label: "Register business details" },
              { step: "2", label: "Submit product & COA docs" },
              { step: "3", label: "Unlock Verified badge + marketplace" },
            ].map((s) => (
              <div
                key={s.step}
                className="flex items-start gap-2.5 text-[12px] text-white/50"
              >
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60 shrink-0 mt-0.5">
                  {s.step}
                </span>
                {s.label}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          {
            icon: Package,
            label: "Add Product",
            href: "/dashboard/producer/products",
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/20",
          },
          {
            icon: Upload,
            label: "Submit COA",
            href: "/dashboard/producer/batches",
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/20",
          },
          {
            icon: BadgeCheck,
            label: "Get Verified",
            href: "/dashboard/producer/verification",
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
          },
          {
            icon: ShoppingBag,
            label: "View Orders",
            href: "/dashboard/producer/orders",
            color: "text-purple-400",
            bg: "bg-purple-500/10 border-purple-500/20",
          },
        ].map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
          >
            <Link
              href={item.href}
              className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl border text-center hover:bg-white/5 transition-all ${item.bg}`}
            >
              <item.icon size={22} className={item.color} />
              <span className="text-[13px] font-medium text-white/80">
                {item.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Products table + Stats */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-white">
              My Products
            </h2>
            <Link
              href="/dashboard/producer/products"
              className="text-[12px] text-(--green-pale) hover:text-white flex items-center gap-1"
            >
              Manage all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="bg-white/3 border border-white/[0.07] rounded-2xl overflow-hidden">
            {mockProducts.map((p, i) => {
              const sc = statusConfig[p.status];
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/6 flex items-center justify-center shrink-0">
                    <Package size={16} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-white truncate">
                      {p.name}
                    </p>
                    <p className="text-[12px] text-white/40">
                      {p.batches} batch submission{p.batches !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${sc.badge}`}
                  >
                    {sc.icon} {sc.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-[15px] font-semibold text-white mb-1">
            At a Glance
          </h2>
          {[
            { label: "Total Products", value: "4", sub: "2 live in store" },
            { label: "Batches Submitted", value: "6", sub: "1 under review" },
            { label: "Orders This Month", value: "23", sub: "₦87,500 revenue" },
            {
              label: "Pending Actions",
              value: "2",
              sub: "1 COA, 1 flag",
              alert: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-white/4 border rounded-xl p-4 ${stat.alert ? "border-amber-500/20" : "border-white/[0.07]"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-white/45">{stat.label}</p>
                  <p className="text-[24px] font-serif font-semibold text-white">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-white/35">{stat.sub}</p>
                </div>
                {stat.alert && (
                  <AlertTriangle size={18} className="text-amber-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
