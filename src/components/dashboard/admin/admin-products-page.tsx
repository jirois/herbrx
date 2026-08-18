"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Flag,
  ShieldX,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Building2,
  FlaskConical,
  BadgeCheck,
  Pause,
  MoreVertical,
  X,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useAdminProducts } from "@/hooks/dashboard-hooks";
import { ProductImage } from "@/components/ui/product-image";

type ProductStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "FLAGGED"
  | "BANNED";

interface AdminProduct {
  id: string;
  name: string;
  category: string;
  emoji: string;
  status: ProductStatus;
  flagReason?: string;
  producer: string;
  producerTier: "UNVERIFIED" | "VERIFIED";
  batches: number;
  approvedBatches: number;
  nafdacNo?: string;
  imageUrl?: string;
  sales: number;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<
  ProductStatus,
  {
    badge: string;
    border: string;
    bg: string;
    icon: React.ReactNode;
    label: string;
    dot: string;
  }
> = {
  DRAFT: {
    badge: "bg-white/10 text-white/55",
    border: "border-white/[0.08]",
    bg: "",
    icon: <Clock size={12} />,
    label: "Draft",
    dot: "bg-white/30",
  },
  PENDING_REVIEW: {
    badge: "bg-amber-500/15 text-amber-400",
    border: "border-amber-500/15",
    bg: "",
    icon: <Clock size={12} />,
    label: "Pending",
    dot: "bg-amber-400",
  },
  APPROVED: {
    badge: "bg-green-500/15 text-green-400",
    border: "border-green-500/15",
    bg: "",
    icon: <CheckCircle size={12} />,
    label: "Approved",
    dot: "bg-green-400",
  },
  FLAGGED: {
    badge: "bg-red-500/15 text-red-400",
    border: "border-red-500/20",
    bg: "bg-red-500/3",
    icon: <AlertTriangle size={12} />,
    label: "Flagged",
    dot: "bg-red-400",
  },
  BANNED: {
    badge: "bg-red-900/30 text-red-500",
    border: "border-red-900/30",
    bg: "bg-red-900/5",
    icon: <XCircle size={12} />,
    label: "Banned",
    dot: "bg-red-600",
  },
};

type Action = "APPROVE" | "FLAG" | "PAUSE" | "BAN" | "RESTORE";

const inputCls =
  "w-full h-10 px-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[var(--green-mid)] transition-all";

export function AdminProductsPage() {
  const {
    data: productsData,
    loading: productsLoading,
    mutate: refetchProducts,
  } = useAdminProducts();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [hasSynced, setHasSynced] = useState(false);
  // Sync real DB data on load and after every mutation (hasSynced reset before refetch)
  if (productsData?.products && !hasSynced) {
    setProducts(productsData.products as unknown as AdminProduct[]);
    setHasSynced(true);
  }
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "ALL">(
    "PENDING_REVIEW",
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{
    product: AdminProduct;
    action: Action;
  } | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actioning, setActioning] = useState(false);

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.producer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: products.length,
    approved: products.filter((p) => p.status === "APPROVED").length,
    pending: products.filter((p) => p.status === "PENDING_REVIEW").length,
    flagged: products.filter((p) => p.status === "FLAGGED").length,
    banned: products.filter((p) => p.status === "BANNED").length,
  };

  async function applyAction() {
    if (!actionModal) return;
    setActioning(true);

    const statusMap: Record<Action, ProductStatus> = {
      APPROVE: "APPROVED",
      FLAG: "FLAGGED",
      PAUSE: "FLAGGED",
      BAN: "BANNED",
      RESTORE: "APPROVED",
    };
    const newStatus = statusMap[actionModal.action];

    // Optimistic update first for responsive UI
    setProducts((prev) =>
      prev.map((p) =>
        p.id === actionModal.product.id
          ? {
              ...p,
              status: newStatus,
              flagReason:
                actionModal.action !== "APPROVE" &&
                actionModal.action !== "RESTORE"
                  ? actionNote
                  : undefined,
            }
          : p,
      ),
    );

    try {
      await fetch("/api/dashboard/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: actionModal.product.id,
          action: actionModal.action,
          reason: actionNote,
        }),
      });
      // Re-sync from DB so our list reflects reality after the write
      setHasSynced(false);
      refetchProducts();
    } catch (err) {
      console.error("[applyAction", err);
      /* oRevert ptimistic update failure */
      setHasSynced(false);
      await refetchProducts();
    }
    setActioning(false);
    setActionModal(null);
    setActionNote("");
  }

  const actionConfig = {
    APPROVE: {
      label: "Approve Product",
      color: "bg-green-500/15 text-green-400 border-green-500/25",
      icon: <ShieldCheck size={14} />,
    },
    FLAG: {
      label: "Flag Product",
      color: "bg-amber-500/15 text-amber-400 border-amber-500/25",
      icon: <Flag size={14} />,
    },
    PAUSE: {
      label: "Pause from Store",
      color: "bg-orange-500/15 text-orange-400 border-orange-500/25",
      icon: <Pause size={14} />,
    },
    BAN: {
      label: "Ban Product",
      color: "bg-red-500/15 text-red-400 border-red-500/25",
      icon: <ShieldX size={14} />,
    },
    RESTORE: {
      label: "Restore Product",
      color: "bg-blue-500/15 text-blue-400 border-blue-500/25",
      icon: <ShieldCheck size={14} />,
    },
  };

  return (
    <DashboardShell
      heading="Product Management"
      subheading="Review, approve, flag, or ban products from all producers on the platform."
    >
      {/* Action Modal */}
      <AnimatePresence>
        {actionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActionModal(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-[#1A2030] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  {actionConfig[actionModal.action].icon}
                  <h3 className="text-[15px] font-semibold text-white">
                    {actionConfig[actionModal.action].label}
                  </h3>
                </div>
                <button
                  onClick={() => setActionModal(null)}
                  className="text-white/30 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-[13px] text-white/50">
                  Product:{" "}
                  <span className="text-white font-medium">
                    {actionModal.product.name}
                  </span>{" "}
                  by {actionModal.product.producer}
                </p>
                <div>
                  <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-1.5">
                    {actionModal.action === "APPROVE" ||
                    actionModal.action === "RESTORE"
                      ? "Note (optional)"
                      : "Reason (required)"}
                  </label>
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder={
                      actionModal.action === "FLAG"
                        ? "e.g. Microbial count exceeded limits in latest batch…"
                        : actionModal.action === "BAN"
                          ? "e.g. Confirmed toxic ingredient. Permanent removal required."
                          : "Optional note for audit log…"
                    }
                    rows={3}
                    className={`${inputCls} h-auto py-3 resize-none`}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActionModal(null)}
                    className="h-10 px-5 border border-white/10 text-white/50 hover:text-white rounded-xl text-[13px] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyAction}
                    disabled={
                      actioning ||
                      (!actionNote &&
                        actionModal.action !== "APPROVE" &&
                        actionModal.action !== "RESTORE")
                    }
                    className={`flex-1 h-10 border font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${actionConfig[actionModal.action].color}`}
                  >
                    {actioning ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Applying…
                      </>
                    ) : (
                      <>Confirm {actionConfig[actionModal.action].label}</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {productsLoading && products.length === 0 && (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-(--green-pale)" />
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-7">
        {[
          {
            label: "Total",
            value: counts.total,
            color: "text-white",
            bg: "bg-white/[0.04] border-white/[0.07]",
            status: "ALL" as const,
          },
          {
            label: "Approved",
            value: counts.approved,
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/15",
            status: "APPROVED" as const,
          },
          {
            label: "Pending",
            value: counts.pending,
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/15",
            status: "PENDING_REVIEW" as const,
          },
          {
            label: "Flagged",
            value: counts.flagged,
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/15",
            status: "FLAGGED" as const,
          },
          {
            label: "Banned",
            value: counts.banned,
            color: "text-red-600",
            bg: "bg-red-900/15 border-red-900/25",
            status: "BANNED" as const,
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl border p-4 text-center cursor-pointer ${k.bg} ${statusFilter === k.status ? "ring-1 ring-white/30" : ""}`}
            onClick={() => setStatusFilter(k.status)}
          >
            <div className={`text-[24px] font-serif font-semibold ${k.color}`}>
              {k.value}
            </div>
            <div className="text-[11px] text-white/35 mt-0.5">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or producers…"
            className="w-full h-10 pl-9 pr-4 bg-white/5 border border-white/8 rounded-xl text-[14px] text-white placeholder:text-white/30 outline-none focus:border-(--green-mid) transition-colors"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(
            [
              "ALL",
              "DRAFT",
              "PENDING_REVIEW",
              "APPROVED",
              "FLAGGED",
              "BANNED",
            ] as const
          ).map((s) => {
            const cfg = s !== "ALL" ? statusConfig[s] : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${statusFilter === s ? "bg-(--green-mid) text-white border-(--green-mid)" : "bg-white/4 text-white/45 hover:text-white border-white/[0.07]"}`}
              >
                {cfg?.icon}
                {s === "ALL"
                  ? "All"
                  : s === "PENDING_REVIEW"
                    ? "Pending"
                    : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products table */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-40 rounded-2xl border border-white/[0.07] bg-white/2">
            <p className="text-white/30 text-[14px]">
              No products match your filter
            </p>
          </div>
        )}

        {filtered.map((product, i) => {
          const cfg = statusConfig[product.status];
          const isOpen = expanded === product.id;
          const isMenu = menuOpen === product.id;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-2xl border overflow-hidden transition-all ${cfg.bg || "bg-white/3"} ${isOpen ? cfg.border : "border-white/[0.07]"}`}
            >
              {/* Row */}
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="relative shrink-0">
                  <ProductImage
                    src={product.imageUrl ?? null}
                    emoji={product.emoji}
                    size="w-10 h-10"
                    theme="dark"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0F1117] ${cfg.dot}`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-[14px] font-semibold text-white truncate">
                      {product.name}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}
                    >
                      {cfg.icon} {cfg.label}
                    </span>
                    {product.producerTier === "VERIFIED" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                        <BadgeCheck size={9} /> Verified
                      </span>
                    )}
                    {product.nafdacNo && (
                      <span className="text-[10px] text-white/30 bg-white/6 px-2 py-0.5 rounded-full">
                        NAFDAC: {product.nafdacNo}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-white/40">
                    <span className="flex items-center gap-1">
                      <Building2 size={11} /> {product.producer}
                    </span>
                    <span>{product.category}</span>
                    <span className="flex items-center gap-1">
                      <FlaskConical size={11} /> {product.approvedBatches}/
                      {product.batches} batches
                    </span>
                    {product.sales > 0 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp size={11} /> {product.sales} sold
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setExpanded(isOpen ? null : product.id)}
                    className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all"
                  >
                    {isOpen ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>

                  {/* Quick action buttons based on status */}
                  {product.status === "PENDING_REVIEW" && (
                    <button
                      onClick={() =>
                        setActionModal({ product, action: "APPROVE" })
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/15 transition-colors"
                    >
                      <CheckCircle size={11} /> Approve
                    </button>
                  )}
                  {(product.status === "APPROVED" ||
                    product.status === "PENDING_REVIEW") && (
                    <button
                      onClick={() =>
                        setActionModal({ product, action: "FLAG" })
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15 transition-colors"
                    >
                      <Flag size={11} /> Flag
                    </button>
                  )}
                  {(product.status === "FLAGGED" ||
                    product.status === "BANNED") && (
                    <button
                      onClick={() =>
                        setActionModal({ product, action: "RESTORE" })
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/15 transition-colors"
                    >
                      <ShieldCheck size={11} /> Restore
                    </button>
                  )}

                  {/* Overflow */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(isMenu ? null : product.id)}
                      className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all"
                    >
                      <MoreVertical size={14} />
                    </button>
                    <AnimatePresence>
                      {isMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1 w-44 bg-[#1E2535] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden"
                        >
                          {product.status !== "APPROVED" && (
                            <button
                              onClick={() => {
                                setActionModal({ product, action: "APPROVE" });
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[12px] text-white/70 hover:text-white hover:bg-white/6"
                            >
                              <CheckCircle
                                size={12}
                                className="text-green-400"
                              />{" "}
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActionModal({ product, action: "FLAG" });
                              setMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[12px] text-white/70 hover:text-white hover:bg-white/6"
                          >
                            <Flag size={12} className="text-amber-400" /> Flag
                          </button>
                          <button
                            onClick={() => {
                              setActionModal({ product, action: "PAUSE" });
                              setMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[12px] text-white/70 hover:text-white hover:bg-white/6"
                          >
                            <Pause size={12} className="text-orange-400" />{" "}
                            Pause
                          </button>
                          <div className="border-t border-white/[0.07] my-1" />
                          <button
                            onClick={() => {
                              setActionModal({ product, action: "BAN" });
                              setMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[12px] text-red-400 hover:bg-red-500/10"
                          >
                            <ShieldX size={12} /> Ban Permanently
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Flag reason banner */}
              {product.flagReason &&
                (product.status === "FLAGGED" ||
                  product.status === "BANNED") && (
                  <div className="mx-5 mb-3 flex items-start gap-2.5 p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                    <AlertTriangle
                      size={13}
                      className="text-red-400 shrink-0 mt-0.5"
                    />
                    <p className="text-[12px] text-white/60 leading-relaxed">
                      {product.flagReason}
                    </p>
                  </div>
                )}

              {/* Expanded detail */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-white/6 pt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        {[
                          { label: "Producer", value: product.producer },
                          { label: "Tier", value: product.producerTier },
                          {
                            label: "Batches",
                            value: `${product.approvedBatches}/${product.batches} approved`,
                          },
                          { label: "Units Sold", value: String(product.sales) },
                          {
                            label: "NAFDAC",
                            value: product.nafdacNo ?? "Not registered",
                          },
                          { label: "Category", value: product.category },
                          { label: "Created", value: product.createdAt },
                          { label: "Last Updated", value: product.updatedAt },
                        ].map((f) => (
                          <div
                            key={f.label}
                            className="bg-white/4 border border-white/6 rounded-xl p-3"
                          >
                            <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5">
                              {f.label}
                            </p>
                            <p className="text-[13px] font-medium text-white">
                              {f.value}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.status === "PENDING_REVIEW" && (
                          <button
                            onClick={() =>
                              setActionModal({ product, action: "APPROVE" })
                            }
                            className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors"
                          >
                            <CheckCircle size={13} /> Approve Product
                          </button>
                        )}
                        {product.status !== "BANNED" && (
                          <button
                            onClick={() =>
                              setActionModal({ product, action: "BAN" })
                            }
                            className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                          >
                            <ShieldX size={13} /> Ban Product
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
