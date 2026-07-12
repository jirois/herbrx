"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useProducerProducts, useIncubation } from "@/hooks/dashboard-hooks";
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
  Rocket,
} from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";

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

// const mockProducts = [
//   { id: "1", name: "Moringa Gold Capsules", status: "APPROVED", batches: 3 },
//   { id: "2", name: "Bitter Leaf Tonic", status: "PENDING_REVIEW", batches: 1 },
//   { id: "3", name: "Shea Butter Balm", status: "DRAFT", batches: 0 },
//   { id: "4", name: "Zobo Immune Blend", status: "FLAGGED", batches: 2 },
// ];

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

interface Product {
  id: string;
  name: string;
  status: keyof typeof statusConfig;
  meta?: {
    emoji?: string;
    imageUrl?: string;
  };
  batchSubmissions?: Array<unknown>;
}

interface Props {
  user: { firstName: string };
  tier?: "UNVERIFIED" | "VERIFIED";
}

// on the dashboard overview page. Clicking through takes them to the
// full Incubation Tracker with the detailed pipeline.
function IncubationStatusCard() {
  const { data } = useIncubation();
  const submission = data?.submission;

  if (!submission) return null;

  const phaseOrder = ["INTAKE", "PRECLINICAL", "BRANDING", "NAFDAC", "LAUNCH"];
  const phaseLabels: Record<string, string> = {
    INTAKE: "Phase 1 — Intake & IP",
    PRECLINICAL: "Phase 2 — Safety Screening",
    BRANDING: "Phase 3 — Standardization & Branding",
    NAFDAC: "Phase 4 — NAFDAC Filing",
    LAUNCH: "Phase 5 — Exclusive Launch",
  };
  const idx = phaseOrder.indexOf(submission.currentPhase as string);
  const progress = Math.round(((idx + 0.5) / 5) * 100);

  return (
    <Link href="/dashboard/producer/incubation">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-5 rounded-2xl border border-(--green-mid)/30 bg-(--green-mid)/8 hover:bg-(--green-mid)/12 transition-all cursor-pointer mb-4"
      >
        <div className="w-10 h-10 rounded-xl bg-(--green-mid)/20 flex items-center justify-center shrink-0">
          <Rocket size={18} className="text-(--green-pale)" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[13px] font-semibold text-white truncate">
              {String(submission.productName)}
            </p>
            <span className="text-[11px] text-(--green-pale) ml-2 shrink-0">
              {progress}%
            </span>
          </div>
          <p className="text-[11px] text-white/45 mb-1.5">
            {phaseLabels[submission.currentPhase as string]}
          </p>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-(--green-mid)] to-(--green-pale)"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <ArrowRight size={14} className="text-white/30 shrink-0" />
      </motion.div>
    </Link>
  );
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

        {realTier === "UNVERIFIED" && (
          <div className="mt-4 space-y-3">
            <p className="text-[12px] text-white/40 font-light leading-relaxed">
              As an unverified producer you have two paths:{" "}
              <strong className="text-white/60">
                get your existing product verified
              </strong>
              , or{" "}
              <strong className="text-white/60">
                submit a new formula to our Incubation Programme
              </strong>{" "}
              and let HerbRx handle the lab testing, branding, and NAFDAC filing
              for you.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <Link
                href="/dashboard/producer/verification"
                className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/4 hover:bg-white/[0.07] transition-all"
              >
                <BadgeCheck size={18} className="text-amber-400 shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-white">
                    Verify my existing product
                  </p>
                  <p className="text-[11px] text-white/35">
                    Submit CAC docs + COA to get the Verified badge
                  </p>
                </div>
              </Link>
              <Link
                href="/dashboard/producer/incubation"
                className="flex items-center gap-3 p-4 rounded-xl border border-(--green-mid)/30 bg-(--green-mid)/10 hover:bg-(--green-mid)/15 transition-all"
              >
                <Rocket size={18} className="text-(--green-pale) shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-white">
                    Submit a formula for Incubation
                  </p>
                  <p className="text-[11px] text-white/35">
                    We handle labs, NAFDAC, branding — you earn 85%
                  </p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick actions — tier-aware */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {(realTier === "UNVERIFIED"
          ? [
              {
                icon: Rocket,
                label: "Incubation",
                href: "/dashboard/producer/incubation",
                color: "text-[var(--green-pale)]",
                bg: "bg-[var(--green-mid)]/10 border-[var(--green-mid)]/25",
              },
              {
                icon: BadgeCheck,
                label: "Get Verified",
                href: "/dashboard/producer/verification",
                color: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/20",
              },
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
            ]
          : [
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
                icon: ShoppingBag,
                label: "View Orders",
                href: "/dashboard/producer/orders",
                color: "text-purple-400",
                bg: "bg-purple-500/10 border-purple-500/20",
              },
              {
                icon: Rocket,
                label: "Incubation",
                href: "/dashboard/producer/incubation",
                color: "text-[var(--green-pale)]",
                bg: "bg-[var(--green-mid)]/10 border-[var(--green-mid)]/25",
              },
            ]
        ).map((item, i) => (
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
          {/* Incubation status card — shown when producer has an active submission */}
          {realTier === "UNVERIFIED" && <IncubationStatusCard />}

          <div className="flex items-center justify-between mb-4 mt-6">
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
          <div className="bg-white/3 border border-white/7 rounded-2xl overflow-hidden">
            {realProducts.length === 0 ? (
              <div className="px-5 py-8 text-center text-[13px] text-white/30">
                No products yet.{" "}
                <Link
                  href="/dashboard/producer/products"
                  className="text-(--green-pale) hover:text-white"
                >
                  Add your first product →
                </Link>
              </div>
            ) : (
              (realProducts as unknown as Product[])
                .slice(0, 5)
                .map((p: Product, i: number) => {
                  const sc =
                    statusConfig[p.status as keyof typeof statusConfig] ??
                    statusConfig.DRAFT;
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.06 }}
                      className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl  shrink-0 overflow-hidden">
                        <ProductImage
                          src={p.meta?.imageUrl ?? null}
                          emoji={p.meta?.emoji ?? "🌿"}
                          size="w-9 h-9"
                          theme="dark"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-white truncate">
                          {p.name}
                        </p>
                        <p className="text-[12px] text-white/40">
                          {p.batchSubmissions?.length ?? 0} batch
                          {(p.batchSubmissions?.length ?? 0) !== 1 ? "es" : ""}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${sc.badge}`}
                      >
                        {sc.icon} {sc.label}
                      </span>
                    </motion.div>
                  );
                })
            )}
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
