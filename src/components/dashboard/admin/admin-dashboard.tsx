"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  useAdminCompliance,
  useAdminFlags,
  useAdminAlerts,
  useAdminBatchQueue,
  useAdminOverviewStats,
} from "@/hooks/dashboard-hooks";

import { formatNaira } from "@/lib/utils";
import {
  AlertTriangle,
  Flag,
  Users,
  FlaskConical,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Clock,
  Activity,
  Loader2,
} from "lucide-react";

const flagSeverityColor = {
  HIGH: "border-red-500/25 bg-red-500/8",
  MEDIUM: "border-amber-500/25 bg-amber-500/8",
  LOW: "border-white/10 bg-white/3",
};
const flagSeverityBadge = {
  HIGH: "bg-red-500/15 text-red-400",
  MEDIUM: "bg-amber-500/15 text-amber-400",
  LOW: "bg-white/10 text-white/50",
};
const alertSeverityColor = {
  DANGER: "text-red-400",
  WARNING: "text-amber-400",
  INFO: "text-blue-400",
};

interface FlagRow {
  id: string;
  targetType: string;
  targetName: string;
  producerName?: string;
  reason: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  flaggedAt: string;
  action?: string;
}

interface AlertRow {
  id: string;
  title: string;
  severity: "DANGER" | "WARNING" | "INFO";
  status: string;
  publishedAt: string;
}

interface BatchRow {
  id: string;
  productName?: string;
  producerName?: string;
  batchNumber?: string;
  submittedAt?: string;
  status: string;
}

export function AdminDashboard({ user }: { user: { firstName: string } }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { data: complianceData } = useAdminCompliance("PENDING");
  const pendingVerifications = complianceData?.counts?.pending ?? 0;

  const { data: flagsData, loading: flagsLoading } = useAdminFlags();
  const flags = (
    (flagsData?.flaggedProducts ?? []) as unknown as FlagRow[]
  ).slice(0, 4);

  const { data: alertsData, loading: alertsLoading } = useAdminAlerts("ACTIVE");
  const alerts = ((alertsData?.alerts ?? []) as unknown as AlertRow[]).slice(
    0,
    3,
  );

  const { data: batchData, loading: batchLoading } =
    useAdminBatchQueue("SUBMITTED");
  const batches = ((batchData?.batches ?? []) as unknown as BatchRow[]).slice(
    0,
    3,
  );

  const { data: stats, loading: statsLoading } = useAdminOverviewStats();

  return (
    <DashboardShell
      heading={`${greeting}, ${user.firstName} ⚡`}
      subheading="Regulatory Dashboard — Platform safety and compliance overview."
    >
      {/* Pending compliance banner */}
      {pendingVerifications > 0 && (
        <Link href="/dashboard/admin/compliance">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/8 hover:bg-amber-500/12 transition-all cursor-pointer mb-6"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white">
                {pendingVerifications} producer verification
                {pendingVerifications === 1 ? "" : "s"} awaiting review
              </p>
              <p className="text-[12px] text-white/45">
                Review CAC, NAFDAC, and lab partnership documents in Compliance
                Management
              </p>
            </div>
            <ArrowRight size={16} className="text-white/40 shrink-0" />
          </motion.div>
        </Link>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Active Alerts",
            value: alertsLoading ? "—" : String(alerts.length),
            icon: AlertTriangle,
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/20",
          },
          {
            label: "Flagged Items",
            value: flagsLoading ? "—" : String(flags.length),
            icon: Flag,
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
          },
          {
            label: "Pending Batches",
            value: batchLoading ? "—" : String(batches.length),
            icon: FlaskConical,
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/20",
          },
          {
            label: "Total Producers",
            value: statsLoading ? "—" : String(stats?.totalProducers ?? 0),
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

          {flagsLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-(--green-pale)" />
            </div>
          )}

          {!flagsLoading && flags.length === 0 && (
            <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
              <p className="text-[13px] text-white/35">
                Nothing flagged right now — all clear.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {flags.map((flag, i) => (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className={`rounded-2xl border p-5 ${flagSeverityColor[flag.severity] ?? flagSeverityColor.LOW}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] text-white/40 uppercase tracking-wider">
                        {flag.targetType}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${flagSeverityBadge[flag.severity] ?? flagSeverityBadge.LOW}`}
                      >
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-[14px] font-semibold text-white">
                      {flag.targetName}
                    </p>
                    <p className="text-[12px] text-white/50 mt-0.5">
                      {flag.reason} · {flag.flaggedAt}
                    </p>
                  </div>
                </div>

                {flag.action ? (
                  <div className="flex items-center gap-2 text-[13px] text-white/60">
                    <CheckCircle size={14} className="text-green-400" />
                    Action taken:{" "}
                    <span className="font-medium text-white">
                      {flag.action}
                    </span>
                  </div>
                ) : (
                  <Link
                    href="/dashboard/admin/flags"
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-white/8 text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                  >
                    Review in Flagged Items <ArrowRight size={11} />
                  </Link>
                )}
              </motion.div>
            ))}
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

            {batchLoading && (
              <div className="flex items-center justify-center py-10">
                <Loader2
                  size={20}
                  className="animate-spin text-(--green-pale)"
                />
              </div>
            )}

            {!batchLoading && batches.length === 0 && (
              <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                <p className="text-[13px] text-white/35">
                  No batches waiting for review.
                </p>
              </div>
            )}

            {batches.length > 0 && (
              <div className="bg-white/3 border border-white/[0.07] rounded-2xl overflow-hidden">
                {batches.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-white">
                        {b.productName ?? "Untitled product"}
                      </p>
                      <p className="text-[12px] text-white/40">
                        {b.producerName ?? "Unknown producer"} · Batch{" "}
                        {b.batchNumber ?? "—"} · {b.submittedAt ?? ""}
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
                      href="/dashboard/admin/batches"
                      className="flex items-center gap-1 text-[12px] text-(--green-pale) hover:text-white"
                    >
                      Review <ArrowRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
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

          {alertsLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-(--green-pale)" />
            </div>
          )}

          {!alertsLoading && alerts.length === 0 && (
            <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl mb-6">
              <p className="text-[13px] text-white/35">
                No active safety alerts.
              </p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                className="p-4 rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wider ${alertSeverityColor[alert.severity] ?? "text-white/40"}`}
                    >
                      {alert.severity}
                    </span>
                    <p className="text-[13px] font-medium mt-0.5 text-white">
                      {alert.title}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/admin/alerts"
                    className="text-[11px] text-green-400 hover:text-white border border-green-500/20 px-2 py-0.5 rounded-lg transition-colors shrink-0"
                  >
                    Manage
                  </Link>
                </div>
                <p className="text-[11px] text-white/30">{alert.publishedAt}</p>
              </motion.div>
            ))}
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
              {
                label: "Total Users",
                value: statsLoading
                  ? "—"
                  : (stats?.totalUsers ?? 0).toLocaleString(),
              },
              {
                label: "Total Orders",
                value: statsLoading
                  ? "—"
                  : (stats?.totalOrders ?? 0).toLocaleString(),
              },
              {
                label: "Revenue (MTD)",
                value: statsLoading ? "—" : formatNaira(stats?.revenueMtd ?? 0),
              },
              {
                label: "Verified Producers",
                value: statsLoading
                  ? "—"
                  : String(stats?.verifiedProducers ?? 0),
              },
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
