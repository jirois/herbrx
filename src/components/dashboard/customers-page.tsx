"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  X,
  Users,
  TrendingUp,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { DashboardShell } from "./dashboard-shell";
import { StatCard } from "./stat-card";
import { formatNaira, cn } from "@/lib/utils";
import type { Order } from "@/types";

interface Customer {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  state: string;
  orderCount: number;
  totalSpend: number;
  lastOrder: string;
  status: "vip" | "regular" | "new";
}

function buildCustomers(orders: Order[]): Customer[] {
  const map: Record<string, Customer> = {};
  orders.forEach((o) => {
    const key = o.customer.email;
    if (!map[key]) {
      map[key] = {
        email: o.customer.email,
        firstName: o.customer.firstName,
        lastName: o.customer.lastName,
        phone: o.customer.phone,
        city: o.customer.city,
        state: o.customer.state,
        orderCount: 0,
        totalSpend: 0,
        lastOrder: o.createdAt,
        status: "new",
      };
    }
    if (o.paymentStatus === "paid") {
      map[key].orderCount += 1;
      map[key].totalSpend += o.total;
    }
    if (new Date(o.createdAt) > new Date(map[key].lastOrder))
      map[key].lastOrder = o.createdAt;
  });
  return Object.values(map)
    .map((c) => ({
      ...c,
      status: (c.totalSpend > 20000
        ? "vip"
        : c.orderCount > 1
          ? "regular"
          : "new") as "vip" | "regular" | "new",
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend);
}

interface Props {
  orders: Order[];
}

export function CustomersPage({ orders }: Props) {
  const [query, setQuery] = useState("");
  const customers = useMemo(() => buildCustomers(orders), [orders]);

  const filtered = useMemo(() => {
    if (!query.trim()) return customers;
    const q = query.toLowerCase();
    return customers.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q),
    );
  }, [customers, query]);

  const vipCount = customers.filter((c) => c.status === "vip").length;
  const avgLTV =
    customers.length > 0
      ? Math.round(
          customers.reduce((s, c) => s + c.totalSpend, 0) / customers.length,
        )
      : 0;
  const topState = (() => {
    const states: Record<string, number> = {};
    customers.forEach((c) => (states[c.state] = (states[c.state] ?? 0) + 1));
    return Object.entries(states).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  })();

  const statusStyles: Record<string, string> = {
    vip: "bg-[var(--gold)]/20     text-[var(--gold-light)]",
    regular: "bg-[var(--green-mid)]/30 text-[var(--green-pale)]",
    new: "bg-white/[0.08]          text-white/40",
  };

  return (
    <DashboardShell
      heading="Customers"
      subheading="All registered buyers and their lifetime value"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Customers"
          value={customers.length.toString()}
          icon={<Users size={18} />}
          accent="green"
          index={0}
        />
        <StatCard
          label="VIP Customers"
          value={vipCount.toString()}
          icon={<TrendingUp size={18} />}
          accent="gold"
          index={1}
          sub="₦20k+ lifetime spend"
        />
        <StatCard
          label="Avg Lifetime Value"
          value={formatNaira(avgLTV)}
          icon={<ShoppingBag size={18} />}
          accent="blue"
          index={2}
        />
        <StatCard
          label="Top Location"
          value={topState}
          icon={<MapPin size={18} />}
          accent="green"
          index={3}
        />
      </div>

      {/* Search */}
      <div className="relative max-w-85 mb-5">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers…"
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

      {/* Table */}
      <div className="bg-[#161B27] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_160px_120px_100px_80px] px-6 py-3 border-b border-white/[0.07] bg-white/2">
          {["Customer", "Location", "Total Spend", "Orders", "Status"].map(
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

        {filtered.map((customer, i) => (
          <motion.div
            key={customer.email}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.025 }}
            className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_160px_120px_100px_80px] items-center px-6 py-3.5 border-b border-white/4 hover:bg-white/2.5 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-(--green-deep) flex items-center justify-center text-[11px] font-bold text-(--green-pale) shrink-0">
                {customer.firstName[0]}
                {customer.lastName[0]}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-white truncate">
                  {customer.firstName} {customer.lastName}
                </p>
                <p className="text-[11px] text-white/35 truncate">
                  {customer.email}
                </p>
              </div>
            </div>

            <p className="hidden md:block text-[13px] text-white/50">
              {customer.city}, {customer.state}
            </p>

            <p className="hidden md:block font-serif text-[14px] font-semibold text-white">
              {formatNaira(customer.totalSpend)}
            </p>

            <p className="hidden md:block text-[13px] text-white/50">
              {customer.orderCount}
            </p>

            <div className="flex items-center justify-end md:justify-start gap-2">
              <span className="md:hidden font-serif text-[13px] font-semibold text-white">
                {formatNaira(customer.totalSpend)}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium px-2.5 py-1 rounded-full capitalize",
                  statusStyles[customer.status],
                )}
              >
                {customer.status}
              </span>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="py-20 text-center text-white/25 text-[14px]">
            No customers found.
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
