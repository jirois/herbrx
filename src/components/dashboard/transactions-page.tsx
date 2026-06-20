"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Download, ChevronDown, ChevronUp } from "lucide-react";
import { DashboardShell } from "./dashboard-shell";
import { formatNaira, cn } from "@/lib/utils";
import type { Order } from "@/types";

const STATUS_ALL = "all";
type StatusFilter = "all" | Order["status"];
type PayFilter = "all" | Order["paymentStatus"];

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
}

export function TransactionsPage({ orders }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>(STATUS_ALL);
  const [payment, setPayment] = useState<PayFilter>(STATUS_ALL);
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const filtered = useMemo(() => {
    let res = [...orders];
    if (query.trim()) {
      const q = query.toLowerCase();
      res = res.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.firstName.toLowerCase().includes(q) ||
          o.customer.lastName.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          (o.paystackRef ?? "").toLowerCase().includes(q),
      );
    }
    if (status !== "all") res = res.filter((o) => o.status === status);
    if (payment !== "all") res = res.filter((o) => o.paymentStatus === payment);

    res.sort((a, b) => {
      const av =
        sortField === "date" ? new Date(a.createdAt).getTime() : a.total;
      const bv =
        sortField === "date" ? new Date(b.createdAt).getTime() : b.total;
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return res;
  }, [orders, query, status, payment, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function SortIcon({ field }: { field: typeof sortField }) {
    if (sortField !== field)
      return <ChevronDown size={12} className="opacity-30" />;
    return sortDir === "desc" ? (
      <ChevronDown size={12} className="text-(--green-pale)" />
    ) : (
      <ChevronUp size={12} className="text-(--green-pale)" />
    );
  }

  // CSV export
  function exportCSV() {
    const headers = [
      "Order ID",
      "Customer",
      "Email",
      "Phone",
      "Amount",
      "Status",
      "Payment",
      "Date",
      "Paystack Ref",
    ];
    const rows = filtered.map((o) => [
      o.id,
      `${o.customer.firstName} ${o.customer.lastName}`,
      o.customer.email,
      o.customer.phone,
      o.total,
      o.status,
      o.paymentStatus,
      new Date(o.createdAt).toISOString(),
      o.paystackRef ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "herbrx-transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardShell
      heading="Transactions"
      subheading="All orders and payment records"
    >
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-50 max-w-[320px]">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, order ID, ref…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-(--green-mid) transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as StatusFilter);
            setPage(1);
          }}
          className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/8 text-[13px] text-white/70 outline-none focus:border-(--green-mid) cursor-pointer"
        >
          <option value="all">All Statuses</option>
          {[
            "pending",
            "processing",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled",
          ].map((s) => (
            <option key={s} value={s} className="bg-[#1E2535] capitalize">
              {s}
            </option>
          ))}
        </select>

        {/* Payment filter */}
        <select
          value={payment}
          onChange={(e) => {
            setPayment(e.target.value as PayFilter);
            setPage(1);
          }}
          className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/8 text-[13px] text-white/70 outline-none focus:border-(--green-mid) cursor-pointer"
        >
          <option value="all">All Payments</option>
          {["paid", "pending", "failed"].map((p) => (
            <option key={p} value={p} className="bg-[#1E2535] capitalize">
              {p}
            </option>
          ))}
        </select>

        <span className="text-[12px] text-white/30 ml-auto">
          {filtered.length} results
        </span>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-[13px] text-white/60 hover:text-white hover:border-white/18 transition-all"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#161B27] border border-white/[0.07] rounded-2xl overflow-hidden mb-4">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_130px_110px_110px_90px_36px] px-6 py-3 border-b border-white/[0.07] bg-white/2">
          {[
            { label: "Customer", field: null },
            { label: "Order ID", field: null },
            { label: "Amount", field: "amount" as const },
            { label: "Status", field: null },
            { label: "Payment", field: null },
            { label: "", field: null },
          ].map((h, i) => (
            <button
              key={i}
              onClick={() => h.field && toggleSort(h.field)}
              className={cn(
                "flex items-center gap-1 text-[11px] uppercase tracking-widest text-white/25 font-medium text-left",
                h.field && "hover:text-white/50 cursor-pointer",
              )}
            >
              {h.label}
              {h.field && <SortIcon field={h.field} />}
            </button>
          ))}
        </div>

        {/* Rows */}
        <AnimatePresence initial={false}>
          {paginated.length === 0 && (
            <div className="py-20 text-center text-white/25 text-[14px]">
              No transactions match your filters.
            </div>
          )}
          {paginated.map((order, i) => {
            const isExp = expanded === order.id;
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <div
                  onClick={() => setExpanded(isExp ? null : order.id)}
                  className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_130px_110px_110px_90px_36px] items-center px-6 py-3.5 border-b border-white/4 hover:bg-white/2.5 transition-colors cursor-pointer"
                >
                  {/* Customer */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-(--green-deep) flex items-center justify-center text-[11px] font-bold text-(--green-pale) shrink-0">
                      {order.customer.firstName[0]}
                      {order.customer.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-white truncate">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-[11px] text-white/35 truncate">
                        {order.customer.email}
                      </p>
                    </div>
                  </div>

                  {/* Order ID */}
                  <div className="hidden md:block">
                    <p className="font-mono text-[12px] text-white/50">
                      {order.id}
                    </p>
                    <p className="text-[10px] text-white/25 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Amount */}
                  <p className="hidden md:block font-serif text-[14px] font-semibold text-white">
                    {formatNaira(order.total)}
                  </p>

                  {/* Status */}
                  <div className="hidden md:block">
                    <span
                      className={cn(
                        "text-[11px] font-medium px-2.5 py-1 rounded-full capitalize",
                        statusStyles[order.status] ?? "",
                      )}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Payment */}
                  <span
                    className={cn(
                      "hidden md:block text-[12px] font-medium capitalize",
                      payStyles[order.paymentStatus] ?? "",
                    )}
                  >
                    {order.paymentStatus}
                  </span>

                  {/* Mobile amount + expand */}
                  <div className="flex items-center gap-2 md:justify-start justify-end">
                    <span className="md:hidden font-serif text-[13px] font-semibold text-white">
                      {formatNaira(order.total)}
                    </span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-white/20 transition-transform shrink-0",
                        isExp && "rotate-180",
                      )}
                    />
                  </div>
                </div>

                {/* Expanded */}
                {isExp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-white/2 border-b border-white/4 px-6 py-5"
                  >
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 text-[13px]">
                      <div>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">
                          Delivery
                        </p>
                        <p className="text-white/70">
                          {order.customer.address}
                        </p>
                        <p className="text-white/50">
                          {order.customer.city}, {order.customer.state}
                        </p>
                        <p className="text-white/40 mt-1">
                          {order.customer.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">
                          Items ({order.items.length})
                        </p>
                        {order.items.map((item) => (
                          <p key={item.product.id} className="text-white/70">
                            {item.product.emoji} {item.product.name} ×
                            {item.quantity} —{" "}
                            {formatNaira(item.product.price * item.quantity)}
                          </p>
                        ))}
                      </div>
                      <div>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">
                          Totals
                        </p>
                        <p className="text-white/50">
                          Subtotal: {formatNaira(order.subtotal)}
                        </p>
                        <p className="text-white/50">
                          Shipping:{" "}
                          {order.shipping === 0
                            ? "Free"
                            : formatNaira(order.shipping)}
                        </p>
                        <p className="text-white font-semibold mt-1">
                          Total: {formatNaira(order.total)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">
                          Paystack
                        </p>
                        <p className="font-mono text-[11px] text-white/40 break-all">
                          {order.paystackRef ?? "—"}
                        </p>
                        {order.paystackTxId && (
                          <p className="text-white/30 text-[11px] mt-0.5">
                            TX #{order.paystackTxId}
                          </p>
                        )}
                        <p className="text-white/35 text-[11px] mt-1">
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
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[13px] text-white/40">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 hover:border-white/18 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 hover:border-white/18 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
