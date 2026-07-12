"use client";

// import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useProducerAnalytics } from "@/hooks/dashboard-hooks";
import { ProductImage } from "@/components/ui/product-image";
import {
  Package,
  BarChart2,
  Loader2,
  FlaskConical,
  Store,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

function fmt(kobo: unknown) {
  const cents = Number(kobo) || 0;
  const naira = cents / 100;
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}M`;
  if (naira >= 1_000) return `₦${(naira / 1_000).toFixed(1)}K`;
  return `₦${naira.toLocaleString()}`;
}

function MiniBar({
  value,
  max,
  color = "bg-[var(--green-mid)]",
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ProducerAnalyticsPage() {
  const { data, loading } = useProducerAnalytics();
  //   const [period, setPeriod] = useState<"6m" | "1y">("6m");

  const summary = data?.summary ?? null;
  const products = data?.products ?? [];
  const months = data?.revenueByMonth ?? [];
  const cats = data?.categories ?? [];
  const batches = data?.batches ?? [];

  const maxRevMonth = Math.max(...months.map((m) => Number(m.revenue) || 0), 1);
  const maxProductRev = Math.max(
    ...products.map((p) => Number(p.revenue) || 0),
    1,
  );

  if (loading) {
    return (
      <DashboardShell
        heading="Analytics"
        subheading="Your sales and product performance data."
      >
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-(--green-pale)" />
        </div>
      </DashboardShell>
    );
  }

  if (!summary) {
    return (
      <DashboardShell
        heading="Analytics"
        subheading="Your sales and product performance data."
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <BarChart2 size={40} className="text-white/20" />
          <p className="text-white/40 text-[15px]">No analytics data yet.</p>
          <p className="text-white/25 text-[13px]">
            Add your first product to start tracking performance.
          </p>
          <Link
            href="/dashboard/producer/products"
            className="mt-2 inline-flex items-center gap-2 text-[13px] font-semibold text-white bg-(--green-mid) hover:bg-(--green-light) px-5 py-2.5 rounded-xl transition-colors"
          >
            <Package size={14} /> Add a Product
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      heading="Analytics"
      subheading="Sales performance, product metrics, and batch history for your HerbRx store."
    >
      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Total Revenue",
            value: fmt(summary.totalRevenue),
            sub: `${summary.totalSales} units sold`,
            icon: <DollarSign size={18} className="text-(--gold-light)" />,
            bg: "bg-[var(--gold)]/10 border-[var(--gold)]/20",
            color: "text-[var(--gold-light)]",
          },
          {
            label: "Active Listings",
            value: String(summary.inStoreProducts),
            sub: `of ${summary.approvedProducts} approved`,
            icon: <Store size={18} className="text-green-400" />,
            bg: "bg-green-500/10 border-green-500/15",
            color: "text-green-400",
          },
          {
            label: "Total Stock",
            value: String(summary.totalStock),
            sub: "units across all products",
            icon: <Package size={18} className="text-blue-400" />,
            bg: "bg-blue-500/10 border-blue-500/15",
            color: "text-blue-400",
          },
          {
            label: "Approved Batches",
            value: `${summary.approvedBatches}/${summary.totalBatches}`,
            sub: "COA submissions approved",
            icon: <FlaskConical size={18} className="text-purple-400" />,
            bg: "bg-purple-500/10 border-purple-500/15",
            color: "text-purple-400",
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-2xl border p-5 ${k.bg}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center border`}
              >
                {k.icon}
              </div>
            </div>
            <p className={`text-[26px] font-serif font-semibold ${k.color}`}>
              {k.value}
            </p>
            <p className="text-[11px] text-white/35 mt-0.5">{k.label}</p>
            <p className="text-[11px] text-white/25 mt-0.5">{k.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Product Status Summary ── */}
      <div className="grid sm:grid-cols-4 gap-2 mb-8">
        {[
          {
            label: "Draft",
            // ensure numeric operations by coercing unknown values to numbers
            value:
              (Number(summary.totalProducts) || 0) -
              (Number(summary.approvedProducts) || 0) -
              (Number(summary.pendingProducts) || 0),
            color: "text-white/40",
            dot: "bg-white/20",
          },
          {
            label: "Pending Review",
            value: summary.pendingProducts,
            color: "text-amber-400",
            dot: "bg-amber-400",
          },
          {
            label: "Approved",
            value: summary.approvedProducts,
            color: "text-green-400",
            dot: "bg-green-400",
          },
          {
            label: "Live in Store",
            value: summary.inStoreProducts,
            color: "text-[var(--green-pale)]",
            dot: "bg-[var(--green-pale)]",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/6"
          >
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
            <div>
              <p className={`text-[18px] font-serif font-semibold ${s.color}`}>
                {String(s.value)}
              </p>
              <p className="text-[11px] text-white/30">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 mb-8">
        {/* ── Revenue Chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/3 border border-white/[0.07] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[15px] font-semibold text-white">
                Revenue Trend
              </h2>
              <p className="text-[12px] text-white/35 mt-0.5">Last 6 months</p>
            </div>
            <p className="text-[22px] font-serif font-semibold text-(--gold-light)">
              {fmt(summary.totalRevenue)}
            </p>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-2 h-32">
            {months.map((m, i) => {
              const pct = maxRevMonth > 0 ? (m.revenue / maxRevMonth) * 100 : 0;
              const isLast = i === months.length - 1;
              return (
                <div
                  key={m.label}
                  className="flex-1 flex flex-col items-center gap-1.5"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, pct)}%` }}
                    transition={{
                      duration: 0.6,
                      delay: 0.3 + i * 0.07,
                      ease: "easeOut",
                    }}
                    className={`w-full rounded-t-lg ${isLast ? "bg-(--green-mid)" : "bg-white/12"}`}
                    style={{ minHeight: 4 }}
                    title={`${m.label}: ${fmt(m.revenue)}`}
                  />
                  <span className="text-[9px] text-white/30 whitespace-nowrap">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Sales count row */}
          <div className="flex items-end gap-2 mt-3">
            {months.map((m) => (
              <div key={m.label} className="flex-1 text-center">
                <span className="text-[9px] text-white/20">
                  {m.sales > 0 ? `${m.sales}u` : ""}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Category breakdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/3 border border-white/[0.07] rounded-2xl p-6"
        >
          <h2 className="text-[15px] font-semibold text-white mb-5">
            By Category
          </h2>
          {cats.length === 0 ? (
            <p className="text-[13px] text-white/30">No category data yet.</p>
          ) : (
            <div className="space-y-4">
              {cats.map((cat, i) => {
                const maxRev = cats[0]?.revenue ?? 1;
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-white">
                          {cat.category}
                        </span>
                        <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                          {cat.count}
                        </span>
                      </div>
                      <span className="text-[12px] text-white/55">
                        {fmt(cat.revenue)}
                      </span>
                    </div>
                    <MiniBar
                      value={cat.revenue}
                      max={maxRev}
                      color={
                        i === 0
                          ? "bg-[var(--green-mid)]"
                          : i === 1
                            ? "bg-blue-500/60"
                            : "bg-white/20"
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Product Performance Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white/3 border border-white/[0.07] rounded-2xl overflow-hidden mb-6"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <h2 className="text-[15px] font-semibold text-white">
            Product Performance
          </h2>
          <Link
            href="/dashboard/producer/products"
            className="text-[12px] text-(--green-pale) hover:text-white transition-colors"
          >
            Manage →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-white/30">
            No products yet.{" "}
            <Link
              href="/dashboard/producer/products"
              className="text-(--green-pale) hover:text-white"
            >
              Add one →
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px_80px_100px_80px] gap-3 px-5 py-2.5 border-b border-white/5 text-[10px] text-white/25 uppercase tracking-wider">
              <span>Product</span>
              <span className="text-right">Price</span>
              <span className="text-right">Stock</span>
              <span className="text-right">Sold</span>
              <span>Revenue</span>
              <span>Status</span>
            </div>
            {products.map((p, i) => {
              const statusColors: Record<string, string> = {
                APPROVED: "text-green-400 bg-green-500/10",
                PENDING_REVIEW: "text-amber-400 bg-amber-500/10",
                DRAFT: "text-white/30 bg-white/[0.05]",
                FLAGGED: "text-red-400 bg-red-500/10",
                BANNED: "text-red-600 bg-red-900/15",
              };
              const status = String(p.status);
              return (
                <motion.div
                  key={String(p.id)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className="grid grid-cols-[1fr_80px_80px_80px_100px_80px] gap-3 px-5 py-4 border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors items-center"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ProductImage
                      src={p.imageUrl as string}
                      emoji={p.emoji as string}
                      size="w-9 h-9"
                      theme="dark"
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-white truncate">
                        {p.name as string}
                      </p>
                      <p className="text-[11px] text-white/30">
                        {p.category as string}
                      </p>
                    </div>
                  </div>
                  <p className="text-[13px] text-white/60 text-right">
                    ₦{(Number(p.price) / 100).toLocaleString()}
                  </p>
                  <p className="text-[13px] text-white/60 text-right">
                    {String(p.stock)}
                  </p>
                  <p className="text-[13px] text-white/60 text-right">
                    {String(p.sales)}
                  </p>
                  <div>
                    <p className="text-[13px] font-medium text-white mb-1">
                      {fmt(p.revenue)}
                    </p>
                    <MiniBar
                      value={Number(p.revenue) || 0}
                      max={maxProductRev}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-1 rounded-lg w-fit ${statusColors[status] ?? "text-white/30 bg-white/5"}`}
                  >
                    {p.status === "PENDING_REVIEW"
                      ? "In Review"
                      : p.status === "APPROVED"
                        ? p.inStore
                          ? "Live"
                          : "Approved"
                        : status.charAt(0) + status.slice(1).toLowerCase()}
                  </span>
                </motion.div>
              );
            })}
          </>
        )}
      </motion.div>

      {/* ── Batch History ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white/3 border border-white/7 rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <h2 className="text-[15px] font-semibold text-white">
            Recent Batch Submissions
          </h2>
          <Link
            href="/dashboard/producer/batches"
            className="text-[12px] text-(--green-pale) hover:text-white transition-colors"
          >
            View all →
          </Link>
        </div>
        {batches.length === 0 ? (
          <div className="px-5 py-8 text-center text-[13px] text-white/30">
            No batch submissions yet.{" "}
            <Link
              href="/dashboard/producer/batches"
              className="text-(--green-pale) hover:text-white"
            >
              Submit a COA →
            </Link>
          </div>
        ) : (
          batches.slice(0, 8).map((b) => {
            const batchStatus: Record<
              string,
              { color: string; label: string }
            > = {
              APPROVED: { color: "text-green-400", label: "Approved" },
              SUBMITTED: { color: "text-amber-400", label: "Pending" },
              UNDER_REVIEW: { color: "text-blue-400", label: "In Review" },
              REJECTED: { color: "text-red-400", label: "Rejected" },
            };
            const bs = batchStatus[b.status as string] ?? {
              color: "text-white/35",
              label: b.status,
            };
            return (
              <div
                key={String(b.id)}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-white/4 last:border-0"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <FlaskConical size={14} className="text-white/35" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">
                    {b.productName as string}
                  </p>
                  <p className="text-[11px] text-white/30">
                    {new Date(
                      b.createdAt as string | number | Date,
                    ).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className={`text-[11px] font-semibold ${bs.color}`}>
                  {bs.label}
                </span>
              </div>
            );
          })
        )}
      </motion.div>

      {/* Lifecycle CTA for producers with no approved products */}
      {summary.approvedProducts === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-6 p-6 rounded-2xl bg-linear-to-br from-(--green-deep) to-[#0D2419] border border-(--green-mid)/25"
        >
          <h3 className="text-[16px] font-serif font-semibold text-white mb-2">
            Get your product live in{" "}
            {Number(summary.totalProducts) > 0 ? "3 steps" : "4 steps"}
          </h3>
          <div className="grid sm:grid-cols-4 gap-3 mt-4">
            {[
              {
                n: "1",
                label: "Add Product",
                done: Number(summary.totalProducts) > 0,
                href: "/dashboard/producer/products",
              },
              {
                n: "2",
                label: "Submit for Review",
                done: Number(summary.pendingProducts) > 0,
                href: "/dashboard/producer/products",
              },
              {
                n: "3",
                label: "Submit COA",
                done: Number(summary.totalBatches) > 0,
                href: "/dashboard/producer/batches",
              },
              {
                n: "4",
                label: "Get Approved & List",
                done: Number(summary.approvedProducts) > 0,
                href: "/dashboard/producer/products",
              },
            ].map((step) => (
              <Link
                key={step.n}
                href={step.href}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${step.done ? "border-green-500/20 bg-green-500/8" : "border-white/10 bg-white/4 hover:bg-white/7"}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${step.done ? "bg-green-500 text-white" : "bg-white/10 text-white/50"}`}
                >
                  {step.done ? "✓" : step.n}
                </div>
                <span
                  className={`text-[12px] font-medium ${step.done ? "text-green-400" : "text-white/60"}`}
                >
                  {step.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </DashboardShell>
  );
}
