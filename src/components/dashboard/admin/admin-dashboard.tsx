"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  AlertTriangle,
  Flag,
  Users,
  FlaskConical,
  ShieldCheck,
  ShieldX,
  Pause,
  ArrowRight,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react";

const mockFlags = [
  {
    id: "1",
    type: "Product",
    name: "ZenMax Herbal Mix",
    reason: "3 adverse user reports in 48h",
    severity: "HIGH",
    time: "1 hr ago",
  },
  {
    id: "2",
    type: "Batch",
    name: "Batch #B2024-11 (SLIMS)",
    reason: "Failed heavy metals screening",
    severity: "HIGH",
    time: "3 hr ago",
  },
  {
    id: "3",
    type: "Producer",
    name: "GreenRoot Ltd",
    reason: "Unverified COA submitted twice",
    severity: "MEDIUM",
    time: "6 hr ago",
  },
  {
    id: "4",
    type: "Product",
    name: "AloeBio Gel Capsules",
    reason: "Label mismatch with submitted COA",
    severity: "MEDIUM",
    time: "1 day ago",
  },
];

const mockAlerts = [
  {
    id: "1",
    title: "Counterfeit Moringa Detected — Lagos",
    severity: "DANGER",
    status: "ACTIVE",
    publishedAt: "2 hr ago",
  },
  {
    id: "2",
    title: "St. John's Wort Interaction Advisory",
    severity: "WARNING",
    status: "ACTIVE",
    publishedAt: "1 day ago",
  },
  {
    id: "3",
    title: "Shea Butter Adulteration — Kano",
    severity: "DANGER",
    status: "RESOLVED",
    publishedAt: "3 days ago",
  },
];

const mockBatches = [
  {
    id: "1",
    product: "Moringa Gold 500mg",
    producer: "GreenHealth NG",
    batchNo: "B2024-09",
    submitted: "2 days ago",
    status: "SUBMITTED",
  },
  {
    id: "2",
    product: "Bitter Leaf Tonic",
    producer: "HerbalNaija",
    batchNo: "B2024-10",
    submitted: "4 days ago",
    status: "UNDER_REVIEW",
  },
  {
    id: "3",
    product: "Zobo Immune Blend",
    producer: "ZoboFresh Ltd",
    batchNo: "B2024-11",
    submitted: "5 days ago",
    status: "UNDER_REVIEW",
  },
];

const flagSeverityColor = {
  HIGH: "border-red-500/25 bg-red-500/8",
  MEDIUM: "border-amber-500/25 bg-amber-500/8",
};
const flagSeverityBadge = {
  HIGH: "bg-red-500/15 text-red-400",
  MEDIUM: "bg-amber-500/15 text-amber-400",
};
const alertSeverityColor = {
  DANGER: "text-red-400",
  WARNING: "text-amber-400",
  INFO: "text-blue-400",
};

export function AdminDashboard({ user }: { user: { firstName: string } }) {
  const [flagActions, setFlagActions] = useState<Record<string, string>>({});
  const [alertStatuses, setAlertStatuses] = useState<Record<string, string>>(
    {},
  );

  function takeAction(flagId: string, action: string) {
    setFlagActions((prev) => ({ ...prev, [flagId]: action }));
  }

  function resolveAlert(alertId: string) {
    setAlertStatuses((prev) => ({ ...prev, [alertId]: "RESOLVED" }));
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <DashboardShell
      heading={`${greeting}, ${user.firstName} ⚡`}
      subheading="Regulatory Dashboard — Platform safety and compliance overview."
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Active Alerts",
            value: "2",
            icon: AlertTriangle,
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/20",
          },
          {
            label: "Flagged Items",
            value: "4",
            icon: Flag,
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
          },
          {
            label: "Pending Batches",
            value: "3",
            icon: FlaskConical,
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/20",
          },
          {
            label: "Total Producers",
            value: "18",
            icon: Users,
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/20",
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`rounded-2xl border p-5 ${k.bg}`}
          >
            <k.icon size={20} className={`${k.color} mb-3`} />
            <div className="text-[28px] font-serif font-semibold text-white">
              {k.value}
            </div>
            <div className="text-[12px] text-white/45 mt-0.5">{k.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-5">
        {/* Flagged items — main action area */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-white flex items-center gap-2">
              <Flag size={15} className="text-red-400" /> Flagged — Requires
              Action
            </h2>
            <Link
              href="/dashboard/admin/flags"
              className="text-[12px] text-(--green-pale) hover:text-white flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {mockFlags.map((flag, i) => {
              const action = flagActions[flag.id];
              return (
                <motion.div
                  key={flag.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className={`rounded-2xl border p-5 ${flagSeverityColor[flag.severity as keyof typeof flagSeverityColor]}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] text-white/40 uppercase tracking-wider">
                          {flag.type}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${flagSeverityBadge[flag.severity as keyof typeof flagSeverityBadge]}`}
                        >
                          {flag.severity}
                        </span>
                      </div>
                      <p className="text-[14px] font-semibold text-white">
                        {flag.name}
                      </p>
                      <p className="text-[12px] text-white/50 mt-0.5">
                        {flag.reason} · {flag.time}
                      </p>
                    </div>
                  </div>

                  {action ? (
                    <div className="flex items-center gap-2 text-[13px] text-white/60">
                      <CheckCircle size={14} className="text-green-400" />
                      Action taken:{" "}
                      <span className="font-medium text-white">{action}</span>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => takeAction(flag.id, "Paused")}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors"
                      >
                        <Pause size={12} /> Pause Product
                      </button>
                      <button
                        onClick={() => takeAction(flag.id, "Banned")}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                      >
                        <ShieldX size={12} /> Ban
                      </button>
                      <button
                        onClick={() => takeAction(flag.id, "Cleared")}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                      >
                        <ShieldCheck size={12} /> Clear Flag
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Batch review queue */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-white flex items-center gap-2">
                <FlaskConical size={15} className="text-blue-400" /> Batch / COA
                Review Queue
              </h2>
              <Link
                href="/dashboard/admin/batches"
                className="text-[12px] text-(--green-pale) hover:text-white flex items-center gap-1"
              >
                Full queue <ArrowRight size={12} />
              </Link>
            </div>
            <div className="bg-white/3 border border-white/[0.07] rounded-2xl overflow-hidden">
              {mockBatches.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-white">
                      {b.product}
                    </p>
                    <p className="text-[12px] text-white/40">
                      {b.producer} · Batch {b.batchNo} · {b.submitted}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 ${b.status === "SUBMITTED" ? "bg-white/10 text-white/50" : "bg-blue-500/15 text-blue-400"}`}
                  >
                    {b.status === "SUBMITTED" ? (
                      <>
                        <Clock size={11} /> New
                      </>
                    ) : (
                      <>
                        <Activity size={11} /> Reviewing
                      </>
                    )}
                  </span>
                  <Link
                    href={`/dashboard/admin/batches`}
                    className="text-[12px] text-(--green-pale) hover:text-white"
                  >
                    Review →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Alerts + Stats */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-400" /> Safety
              Alerts
            </h2>
            <Link
              href="/dashboard/admin/alerts"
              className="text-[12px] text-(--green-pale) hover:text-white flex items-center gap-1"
            >
              Manage <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3 mb-6">
            {mockAlerts.map((alert, i) => {
              const resolved =
                alertStatuses[alert.id] === "RESOLVED" ||
                alert.status === "RESOLVED";
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  className={`p-4 rounded-2xl border ${resolved ? "border-white/[0.07] bg-white/3" : "border-white/10 bg-white/5"}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider ${alertSeverityColor[alert.severity as keyof typeof alertSeverityColor]}`}
                      >
                        {alert.severity}
                      </span>
                      <p
                        className={`text-[13px] font-medium mt-0.5 ${resolved ? "text-white/40 line-through" : "text-white"}`}
                      >
                        {alert.title}
                      </p>
                    </div>
                    {resolved ? (
                      <span className="flex items-center gap-1 text-[11px] text-white/30">
                        <CheckCircle size={11} /> Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-[11px] text-green-400 hover:text-white border border-green-500/20 px-2 py-0.5 rounded-lg transition-colors shrink-0"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-white/30">
                    {alert.publishedAt}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Publish alert CTA */}
          <Link
            href="/dashboard/admin/alerts"
            className="flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors mb-6 group"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-400" />
              <div>
                <p className="text-[13px] font-semibold text-white">
                  Publish New Safety Alert
                </p>
                <p className="text-[11px] text-white/40">
                  Notify all users immediately
                </p>
              </div>
            </div>
            <ArrowRight
              size={14}
              className="text-white/30 group-hover:text-white transition-colors"
            />
          </Link>

          {/* Platform stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Users", value: "2,841" },
              { label: "Total Orders", value: "1,204" },
              { label: "Revenue (MTD)", value: "₦4.2M" },
              { label: "Verified Producers", value: "11" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/4 border border-white/[0.07] rounded-xl p-4"
              >
                <div className="text-[22px] font-serif font-semibold text-white">
                  {stat.value}
                </div>
                <div className="text-[11px] text-white/40 mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
