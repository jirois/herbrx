"use client";

import { motion } from "framer-motion";
import { DashboardShell } from "./dashboard-shell";
import { StatCard } from "./stat-card";
import { RevenueChart } from "./revenue-chart";
import { RecentTransactions } from "./recent-transactions";
import { TopProducts } from "./top-products";
import { formatNaira } from "@/lib/utils";
import {
  Banknote,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
} from "lucide-react";
import type { Order } from "@/types";

interface Props {
  user: { firstName: string; lastName: string; email: string };
  orders: Order[];
  stats: {
    totalRevenue: number;
    thisMonthRev: number;
    revChange: number;
    totalOrders: number;
    thisMonthOrders: number;
    ordChange: number;
    totalCustomers: number;
    newCustomers: number;
    pendingOrders: number;
    failedPayments: number;
    avgOrderValue: number;
  };
  revenue: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; emoji: string; revenue: number; qty: number }[];
}

export function DashboardOverview({
  user,
  orders,
  stats,
  revenue,
  topProducts,
}: Props) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <DashboardShell
      heading={`${greeting}, ${user.firstName} 👋`}
      subheading="Here's what's happening with HerbRx today."
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Revenue"
          value={formatNaira(stats.totalRevenue)}
          change={stats.revChange}
          icon={<Banknote size={18} />}
          accent="green"
          index={0}
          sub={`${formatNaira(stats.thisMonthRev)} this month`}
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toString()}
          change={stats.ordChange}
          icon={<ShoppingCart size={18} />}
          accent="gold"
          index={1}
          sub={`${stats.thisMonthOrders} this month`}
        />
        <StatCard
          label="Total Customers"
          value={stats.totalCustomers.toString()}
          icon={<Users size={18} />}
          accent="blue"
          index={2}
          sub={`${stats.newCustomers} new this month`}
        />
        <StatCard
          label="Avg Order Value"
          value={formatNaira(stats.avgOrderValue)}
          icon={<TrendingUp size={18} />}
          accent="green"
          index={3}
        />
      </div>

      {/* Alert strip */}
      {(stats.pendingOrders > 0 || stats.failedPayments > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3 mb-6"
        >
          {stats.pendingOrders > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[13px] px-4 py-2.5 rounded-xl">
              <Clock size={14} />
              <strong>{stats.pendingOrders}</strong> orders awaiting processing
            </div>
          )}
          {stats.failedPayments > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] px-4 py-2.5 rounded-xl">
              <AlertTriangle size={14} />
              <strong>{stats.failedPayments}</strong> failed payment
              {stats.failedPayments > 1 ? "s" : ""} — review needed
            </div>
          )}
        </motion.div>
      )}

      {/* Chart + Top products */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-5 mb-6">
        <RevenueChart data={revenue} />
        <TopProducts products={topProducts} />
      </div>

      {/* Recent transactions */}
      <RecentTransactions orders={orders} limit={8} showViewAll />
    </DashboardShell>
  );
}
