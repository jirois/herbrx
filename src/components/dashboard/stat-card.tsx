"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  accent?: "green" | "gold" | "blue" | "red";
  index?: number;
  sub?: string;
}

const accentMap = {
  green: "bg-[var(--green-mid)]/20 text-[var(--green-pale)]",
  gold: "bg-[var(--gold)]/20      text-[var(--gold-light)]",
  blue: "bg-blue-500/15           text-blue-400",
  red: "bg-red-500/15            text-red-400",
};

export function StatCard({
  label,
  value,
  change,
  icon,
  accent = "green",
  index = 0,
  sub,
}: StatCardProps) {
  const up = change !== undefined && change > 0;
  const down = change !== undefined && change < 0;
  const flat = change !== undefined && change === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="bg-[#161B27] border border-white/[0.07] rounded-2xl p-5 hover:border-white/12 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            accentMap[accent],
          )}
        >
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={cn(
              "flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-full",
              up
                ? "bg-green-500/15 text-green-400"
                : down
                  ? "bg-red-500/15   text-red-400"
                  : "bg-white/6 text-white/30",
            )}
          >
            {up && <TrendingUp size={11} />}
            {down && <TrendingDown size={11} />}
            {flat && <Minus size={11} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="font-serif text-[26px] font-semibold text-white leading-none mb-1">
        {value}
      </p>
      <p className="text-[13px] text-white/45">{label}</p>
      {sub && (
        <p className="text-[11px] text-white/25 mt-1 font-light">{sub}</p>
      )}
    </motion.div>
  );
}
