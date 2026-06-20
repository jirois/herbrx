"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
type TipProps = {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
  }>;
  label?: string | number;
};

interface RevenueChartProps {
  data: { date: string; revenue: number; orders: number }[];
}
type Period = "7d" | "30d" | "90d";

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
}
function fmtNaira(v: number) {
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₦${(v / 1_000).toFixed(0)}K`;
  return `₦${v}`;
}

const Tip = ({ active, payload, label }: TipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E2535] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-[12px] text-white/50 mb-1">{fmtDate(String(label))}</p>

      <p className="text-[16px] font-semibold text-white font-serif">
        {fmtNaira(Number(payload[0]?.value ?? 0))}
      </p>

      <p className="text-[12px] text-white/40">
        {Number(payload[1]?.value ?? 0)} orders
      </p>
    </div>
  );
};

export function RevenueChart({ data }: RevenueChartProps) {
  const [period, setPeriod] = useState<Period>("30d");
  const sliced =
    period === "7d"
      ? data.slice(-7)
      : period === "30d"
        ? data.slice(-30)
        : data;
  const totalRev = sliced.reduce((s, d) => s + d.revenue, 0);
  const totalOrds = sliced.reduce((s, d) => s + d.orders, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
      className="bg-[#161B27] border border-white/[0.07] rounded-2xl p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[13px] text-white/45 mb-0.5">Total Revenue</p>
          <p className="font-serif text-[28px] font-semibold text-white">
            {fmtNaira(totalRev)}
          </p>
          <p className="text-[12px] text-white/30 mt-0.5">{totalOrds} orders</p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all",
                period === p
                  ? "bg-(--green-mid) text-white"
                  : "text-white/40 hover:text-white",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="h-50">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sliced}
            margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2D5A3D" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2D5A3D" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={period === "7d" ? 0 : period === "30d" ? 6 : 14}
            />
            <YAxis
              tickFormatter={fmtNaira}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              content={<Tip />}
              cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2D5A3D"
              strokeWidth={2}
              fill="url(#rg)"
              dot={false}
              activeDot={{ r: 4, fill: "#4A7C59", strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="transparent"
              fill="transparent"
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
