"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "./dashboard-shell";
import { StatCard } from "./stat-card";
import { formatNaira } from "@/lib/utils";
import { Banknote, Clock, CheckCircle, TrendingUp } from "lucide-react";
import type { Order } from "@/types";

interface Settlement {
  id: string;
  week: string;
  orders: number;
  gross: number;
  fees: number;
  net: number;
  status: "settled" | "pending" | "processing";
}

const PAYSTACK_FEE_RATE = 0.015; // 1.5% + ₦100 cap ₦2000
const PAYSTACK_FEE_FLAT = 100;

function calcFee(amount: number): number {
  const fee = amount * PAYSTACK_FEE_RATE + PAYSTACK_FEE_FLAT;
  return Math.min(fee, 2000);
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return monday.toISOString().slice(0, 10);
}

function buildSettlements(orders: Order[]): Settlement[] {
  const map: Record<string, Settlement> = {};
  orders
    .filter((o) => o.paymentStatus === "paid")
    .forEach((o) => {
      const wk = getWeekKey(o.createdAt);
      if (!map[wk]) {
        map[wk] = {
          id: `STL-${wk}`,
          week: wk,
          orders: 0,
          gross: 0,
          fees: 0,
          net: 0,
          status: "settled",
        };
      }
      const fee = calcFee(o.total);
      map[wk].orders += 1;
      map[wk].gross += o.total;
      map[wk].fees += fee;
      map[wk].net += o.total - fee;
    });

  // Mark last 2 weeks as pending/processing
  return Object.values(map)
    .sort((a, b) => b.week.localeCompare(a.week))
    .map((s, i) => ({
      ...s,
      status: i === 0 ? "pending" : i === 1 ? "processing" : "settled",
    }));
}

interface Props {
  orders: Order[];
}

export function SettlementsPage({ orders }: Props) {
  const settlements = useMemo(() => buildSettlements(orders), [orders]);

  const totalNet = settlements
    .filter((s) => s.status === "settled")
    .reduce((a, s) => a + s.net, 0);
  const pendingNet = settlements
    .filter((s) => s.status !== "settled")
    .reduce((a, s) => a + s.net, 0);
  const totalFees = settlements.reduce((a, s) => a + s.fees, 0);
  const totalGross = settlements.reduce((a, s) => a + s.gross, 0);

  const statusStyles: Record<string, string> = {
    settled: "bg-green-500/15  text-green-400",
    processing: "bg-blue-500/15   text-blue-400",
    pending: "bg-amber-500/15  text-amber-400",
  };

  return (
    <DashboardShell
      heading="Settlements"
      subheading="Weekly payouts from Paystack to your bank account"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Settled"
          value={formatNaira(totalNet)}
          icon={<CheckCircle size={18} />}
          accent="green"
          index={0}
        />
        <StatCard
          label="Pending Payout"
          value={formatNaira(pendingNet)}
          icon={<Clock size={18} />}
          accent="gold"
          index={1}
        />
        <StatCard
          label="Total Gross"
          value={formatNaira(totalGross)}
          icon={<TrendingUp size={18} />}
          accent="blue"
          index={2}
        />
        <StatCard
          label="Total Fees Paid"
          value={formatNaira(totalFees)}
          icon={<Banknote size={18} />}
          accent="green"
          index={3}
          sub="1.5% + ₦100 per txn"
        />
      </div>

      {/* Bank account notice */}
      <div className="flex items-start gap-3 bg-(--green-deep)/30 border border-(--green-mid)/30 rounded-xl px-5 py-4 mb-6 text-[13px] text-white/60">
        <Banknote size={16} className="text-(--green-pale) shrink-0 mt-0.5" />
        <p>
          Settlements are disbursed every weekday (T+1) to your registered bank
          account. Configure your account details in{" "}
          <a
            href="/dashboard/settings"
            className="text-(--green-pale) hover:text-white underline"
          >
            Settings → Payout
          </a>
          .
        </p>
      </div>

      <div className="bg-[#161B27] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[150px_1fr_120px_120px_120px_100px] px-6 py-3 border-b border-white/[0.07] bg-white/2">
          {["Week of", "Settlement ID", "Gross", "Fees", "Net", "Status"].map(
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

        {settlements.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="grid grid-cols-[1fr_auto] md:grid-cols-[150px_1fr_120px_120px_120px_100px] items-center px-6 py-4 border-b border-white/4 hover:bg-white/2.5 transition-colors"
          >
            <p className="hidden md:block text-[13px] text-white/70">
              {new Date(s.week).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            <div>
              <p className="font-mono text-[12px] text-white/50">{s.id}</p>
              <p className="text-[11px] text-white/25 mt-0.5">
                {s.orders} orders
              </p>
            </div>
            <p className="hidden md:block font-serif text-[13px] text-white/60">
              {formatNaira(s.gross)}
            </p>
            <p className="hidden md:block text-[13px] text-red-400/70">
              −{formatNaira(s.fees)}
            </p>
            <p className="hidden md:block font-serif text-[14px] font-semibold text-white">
              {formatNaira(s.net)}
            </p>
            <div className="flex items-center justify-end md:justify-start gap-2">
              <span className="md:hidden font-serif text-[13px] text-white">
                {formatNaira(s.net)}
              </span>
              <span
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[s.status]}`}
              >
                {s.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardShell>
  );
}
