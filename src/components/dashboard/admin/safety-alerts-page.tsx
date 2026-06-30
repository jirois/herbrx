"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useAdminAlerts, adminApi } from "@/hooks/dashboard-hooks";
import {
  AlertTriangle,
  X,
  CheckCircle,
  EyeOff,
  Megaphone,
  Search,
  Loader2,
  Clock,
  Hash,
  Package,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit3,
} from "lucide-react";
import type { AlertSeverity } from "@/types";

// ── Types ───────
type AlertStatus = "ACTIVE" | "RESOLVED";

interface Alert {
  id: string;
  title: string;
  body: string;
  severity: AlertSeverity;
  productName?: string;
  batchNo?: string;
  status: AlertStatus;
  publishedAt: string;
  createdBy: string;
  notifiedCount: number;
}

// ── Mock data ──────
const INITIAL_ALERTS: Alert[] = [
  {
    id: "a1",
    severity: "DANGER",
    status: "ACTIVE",
    title: "Counterfeit Moringa Capsules Detected — Lagos Markets",
    body: 'Multiple batches of counterfeit "SuperGreen Moringa 500mg" have been identified in Lagos Island and Alaba markets. Lab analysis reveals dangerous levels of lead (12.4 mg/kg vs limit of 2 mg/kg) and undisclosed fillers. Do not consume.',
    productName: "SuperGreen Moringa 500mg",
    batchNo: "B2024-FAKE-01",
    publishedAt: "2025-06-20 09:14",
    createdBy: "Admin Chukwuemeka",
    notifiedCount: 1842,
  },
  {
    id: "a2",
    severity: "WARNING",
    status: "ACTIVE",
    title: "Drug Interaction Advisory: St. John's Wort + SSRIs",
    body: "Multiple user reports and clinical evidence confirm a significant risk of serotonin syndrome when combining St. John's Wort (Hypericum perforatum) with SSRI antidepressants (sertraline, fluoxetine, citalopram). Users taking SSRIs must discontinue St. John's Wort immediately and consult their physician.",
    productName: "St. John's Wort Extract",
    batchNo: undefined,
    publishedAt: "2025-06-19 14:30",
    createdBy: "Dr. Adaeze Okonkwo",
    notifiedCount: 3204,
  },
  {
    id: "a3",
    severity: "DANGER",
    status: "RESOLVED",
    title: "Shea Butter Adulteration — Kano Batch B2024-11",
    body: 'Batch B2024-11 of "PureShea Body Butter" by ZoboFresh Ltd was found to contain undisclosed industrial additives and failed microbial count screening. All units have been recalled. Producers have been notified.',
    productName: "PureShea Body Butter",
    batchNo: "B2024-11",
    publishedAt: "2025-06-15 11:00",
    createdBy: "Admin Chukwuemeka",
    notifiedCount: 987,
  },
  {
    id: "a4",
    severity: "INFO",
    status: "RESOLVED",
    title: "Updated Safety Guidelines: Bitter Leaf (Vernonia amygdalina)",
    body: "HerbRx has updated its safety guidelines for Bitter Leaf preparations. New evidence suggests high-dose aqueous extracts (>500mg/day) may interact with antidiabetic medications. Updated guides are available in all five languages on the Resources page.",
    productName: undefined,
    batchNo: undefined,
    publishedAt: "2025-06-10 08:00",
    createdBy: "Dr. Adaeze Okonkwo",
    notifiedCount: 5611,
  },
];

// ── Config ──────
const severityConfig: Record<
  AlertSeverity,
  {
    badge: string;
    border: string;
    bg: string;
    label: string;
    icon: string;
  }
> = {
  DANGER: {
    badge: "bg-red-500/15 text-red-400",
    border: "border-red-500/20",
    bg: "bg-red-500/8",
    label: "DANGER",
    icon: "🚨",
  },
  WARNING: {
    badge: "bg-amber-500/15 text-amber-400",
    border: "border-amber-500/20",
    bg: "bg-amber-500/8",
    label: "WARNING",
    icon: "⚠️",
  },
  INFO: {
    badge: "bg-blue-500/15 text-blue-400",
    border: "border-blue-500/20",
    bg: "bg-blue-500/8",
    label: "INFO",
    icon: "ℹ️",
  },
};

const inputCls =
  "w-full h-10 px-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[var(--green-mid)] focus:bg-white/[0.08] transition-all";
const labelCls =
  "block text-[12px] font-medium text-white/50 mb-1.5 uppercase tracking-wider";

// ── Component ────────────
export function SafetyAlertsPage() {
  const { data: alertsData, mutate: refetchAlerts } = useAdminAlerts("ALL");
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [hasSynced, setHasSynced] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | AlertSeverity | AlertStatus>(
    "ALL",
  );
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState<string | null>(null);

  if (alertsData?.alerts && !hasSynced) {
    const shaped: Alert[] = alertsData.alerts.map((a: unknown) => {
      const aa = a as {
        id: string;
        title: string;
        body: string;
        severity: AlertSeverity;
        productName?: string | null;
        batchNo?: string | null;
        status: AlertStatus;
        publishedAt: string;
        createdBy?: string | null;
        notifiedCount?: number | null;
      };
      return {
        id: aa.id,
        title: aa.title,
        body: aa.body,
        severity: aa.severity,
        productName: aa.productName ?? undefined,
        batchNo: aa.batchNo ?? undefined,
        status: aa.status,
        publishedAt: new Date(aa.publishedAt).toLocaleString("en-NG", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        createdBy: aa.createdBy ?? "Admin",
        notifiedCount: aa.notifiedCount ?? 0,
      } as Alert;
    });
    setAlerts(shaped);
    setHasSynced(true);
  }

  const [form, setForm] = useState({
    title: "",
    body: "",
    severity: "WARNING" as AlertSeverity,
    productName: "",
    batchNo: "",
  });

  function update(patch: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function publishAlert() {
    if (!form.title || !form.body) return;
    setSubmitting(true);
    try {
      const result = await adminApi.publishAlert({
        title: form.title,
        body: form.body,
        severity: form.severity,
        productName: form.productName,
        batchNo: form.batchNo,
      });
      // Re-sync from the server so we get the real DB id and timestamp,
      // and so the customer-facing alerts page sees this on its next fetch.
      setHasSynced(false);
      await refetchAlerts();
      setPublished(result?.alerts?.id ?? null);
    } catch (err) {
      console.error("[publishAlert]", err);
      // Surface the failure instead of silently faking success
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setShowForm(false);
    setForm({
      title: "",
      body: "",
      severity: "WARNING",
      productName: "",
      batchNo: "",
    });
  }

  async function resolveAlert(id: string) {
    // Optimistic UI update
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "RESOLVED" } : a)),
    );
    try {
      await adminApi.resolveAlert({ alertId: id, status: "RESOLVED" });
      setHasSynced(false);
      refetchAlerts();
    } catch (err) {
      console.error("[resolveAlert]", err);
    }
  }

  async function deleteAlert(id: string) {
    const prevAlerts = alerts;
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    try {
      await adminApi.deleteAlert(id);
      setHasSynced(false);
      refetchAlerts();
    } catch (err) {
      console.error("[deleteAlert]", err);
      setAlerts(prevAlerts); // revert on failure
    }
  }

  async function reactivateAlert(id: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "ACTIVE" } : a)),
    );
    try {
      await adminApi.resolveAlert({ alertId: id, status: "ACTIVE" });
      setHasSynced(false);
      refetchAlerts();
    } catch (err) {
      console.error("[reactivateAlert]", err);
    }
  }

  const filtered = alerts.filter((a) => {
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.productName?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "ALL"
        ? true
        : filter === "ACTIVE"
          ? a.status === "ACTIVE"
          : filter === "RESOLVED"
            ? a.status === "RESOLVED"
            : a.severity === filter;
    return matchSearch && matchFilter;
  });

  const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;
  const dangerCount = alerts.filter(
    (a) => a.severity === "DANGER" && a.status === "ACTIVE",
  ).length;
  const totalNotified = alerts.reduce((s, a) => s + a.notifiedCount, 0);

  return (
    <DashboardShell
      heading="Safety Alert Management"
      subheading="Publish, manage, and resolve platform-wide safety alerts for Nigerian herbal consumers."
    >
      {/* Published success banner */}
      <AnimatePresence>
        {published && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20"
          >
            <Megaphone size={18} className="text-green-400 shrink-0" />
            <p className="text-[14px] text-white flex-1">
              Alert published and{" "}
              <span className="font-semibold">
                notifications sent to all subscribers.
              </span>
            </p>
            <button
              onClick={() => setPublished(null)}
              className="text-white/30 hover:text-white"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {[
          {
            label: "Active Alerts",
            value: String(activeCount),
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/15",
          },
          {
            label: "Danger Alerts",
            value: String(dangerCount),
            color: "text-orange-400",
            bg: "bg-orange-500/10 border-orange-500/15",
          },
          {
            label: "Total Published",
            value: String(alerts.length),
            color: "text-white",
            bg: "bg-white/[0.04] border-white/[0.07]",
          },
          {
            label: "Users Notified",
            value: totalNotified.toLocaleString(),
            color: "text-[var(--green-pale)]",
            bg: "bg-[var(--green-mid)]/10 border-[var(--green-mid)]/20",
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl border p-5 ${k.bg}`}
          >
            <div className={`text-[26px] font-serif font-semibold ${k.color}`}>
              {k.value}
            </div>
            <div className="text-[12px] text-white/40 mt-0.5">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts…"
            className="w-full h-10 pl-9 pr-4 bg-white/5 border border-white/8 rounded-xl text-[14px] text-white placeholder:text-white/30 outline-none focus:border-(--green-mid) transition-colors"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {(
            ["ALL", "ACTIVE", "RESOLVED", "DANGER", "WARNING", "INFO"] as const
          ).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all ${filter === f ? "bg-(--green-mid) text-white" : "bg-white/5 text-white/50 hover:text-white border border-white/[0.07]"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Publish button */}
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/25 text-red-300 hover:text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all ml-auto"
        >
          <Megaphone size={15} /> {showForm ? "Cancel" : "Publish Alert"}
        </button>
      </div>

      {/* Publish form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-white/4 border border-white/10 rounded-2xl p-6">
              <h3 className="text-[15px] font-semibold text-white mb-5 flex items-center gap-2">
                <Megaphone size={16} className="text-red-400" /> Publish New
                Safety Alert
              </h3>

              {/* Severity selector */}
              <div className="mb-5">
                <label className={labelCls}>Severity Level *</label>
                <div className="flex gap-2">
                  {(["DANGER", "WARNING", "INFO"] as AlertSeverity[]).map(
                    (s) => {
                      const cfg = severityConfig[s];
                      return (
                        <button
                          key={s}
                          onClick={() => update({ severity: s })}
                          className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${form.severity === s ? `${cfg.border} ${cfg.bg}` : "border-white/[0.07] bg-white/3 hover:border-white/20"}`}
                        >
                          <span className="text-[20px]">{cfg.icon}</span>
                          <span
                            className={`text-[12px] font-semibold ${form.severity === s ? cfg.badge.split(" ")[1] : "text-white/40"}`}
                          >
                            {cfg.label}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Alert Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => update({ title: e.target.value })}
                    placeholder="e.g. Counterfeit Moringa Detected — Lagos Markets"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Alert Body *</label>
                  <textarea
                    value={form.body}
                    onChange={(e) => update({ body: e.target.value })}
                    placeholder="Describe the safety issue in detail — include affected areas, health risks, and recommended actions…"
                    rows={5}
                    className={`${inputCls} h-auto py-3 resize-none`}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>
                      Affected Product (optional)
                    </label>
                    <div className="relative">
                      <Package
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                      />
                      <input
                        value={form.productName}
                        onChange={(e) =>
                          update({ productName: e.target.value })
                        }
                        placeholder="Product name"
                        className={`${inputCls} pl-8`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Batch Number (optional)</label>
                    <div className="relative">
                      <Hash
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                      />
                      <input
                        value={form.batchNo}
                        onChange={(e) => update({ batchNo: e.target.value })}
                        placeholder="e.g. B2024-07"
                        className={`${inputCls} pl-8`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {form.title && (
                <div
                  className={`mt-5 p-4 rounded-xl border ${severityConfig[form.severity].border} ${severityConfig[form.severity].bg}`}
                >
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
                    Preview
                  </p>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[18px]">
                      {severityConfig[form.severity].icon}
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold text-white">
                        {form.title}
                      </p>
                      {form.body && (
                        <p className="text-[12px] text-white/50 mt-1 leading-relaxed line-clamp-2">
                          {form.body}
                        </p>
                      )}
                      {form.productName && (
                        <p className="text-[11px] text-white/30 mt-1.5">
                          Product: {form.productName}
                          {form.batchNo ? ` · Batch: ${form.batchNo}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowForm(false)}
                  className="h-11 px-6 border border-white/10 text-white/50 hover:text-white rounded-xl text-[14px] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={publishAlert}
                  disabled={submitting || !form.title || !form.body}
                  className="h-11 px-8 bg-red-500/80 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-[14px] flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Publishing…
                    </>
                  ) : (
                    <>
                      <Megaphone size={14} /> Publish & Notify All Users
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-white/[0.07] bg-white/2">
          <AlertTriangle size={32} className="text-white/20 mb-3" />
          <p className="text-white/40 text-[14px]">
            No alerts match your filter
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert, i) => {
            const cfg = severityConfig[alert.severity];
            const isExpanded = expanded === alert.id;
            const isResolved = alert.status === "RESOLVED";
            const isNew = published === alert.id;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-2xl border overflow-hidden transition-all ${isResolved ? "border-white/[0.07] bg-white/2 opacity-70" : `${cfg.border} ${cfg.bg}`} ${isNew ? "ring-1 ring-green-500/40" : ""}`}
              >
                {/* Alert row */}
                <div className="flex items-start gap-4 p-5">
                  <span className="text-[22px] shrink-0 mt-0.5">
                    {cfg.icon}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}
                      >
                        {cfg.label}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isResolved ? "bg-white/6 text-white/30" : "bg-green-500/15 text-green-400"}`}
                      >
                        {isResolved ? "✓ RESOLVED" : "● ACTIVE"}
                      </span>
                      {isNew && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
                          Just Published
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[14px] font-semibold mb-0.5 ${isResolved ? "text-white/50 line-through" : "text-white"}`}
                    >
                      {alert.title}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-white/30 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {alert.publishedAt}
                      </span>
                      <span>By {alert.createdBy}</span>
                      {alert.productName && (
                        <span className="flex items-center gap-1">
                          <Package size={10} /> {alert.productName}
                        </span>
                      )}
                      {alert.notifiedCount > 0 && (
                        <span>
                          📣 {alert.notifiedCount.toLocaleString()} notified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : alert.id)}
                      className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all"
                      title="Expand"
                    >
                      {isExpanded ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                    {isResolved ? (
                      <button
                        onClick={() => reactivateAlert(alert.id)}
                        className="w-8 h-8 rounded-lg bg-white/6 hover:bg-amber-500/20 flex items-center justify-center text-white/40 hover:text-amber-400 transition-all"
                        title="Reactivate"
                      >
                        <EyeOff size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="w-8 h-8 rounded-lg bg-white/6 hover:bg-green-500/20 flex items-center justify-center text-white/40 hover:text-green-400 transition-all"
                        title="Mark Resolved"
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="w-8 h-8 rounded-lg bg-white/6 hover:bg-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-white/6 pt-4">
                        <p className="text-[14px] text-white/60 leading-relaxed mb-4">
                          {alert.body}
                        </p>
                        {(alert.productName || alert.batchNo) && (
                          <div className="flex gap-4 text-[12px] mb-4">
                            {alert.productName && (
                              <div>
                                <span className="text-white/30">Product: </span>
                                <span className="text-white font-medium">
                                  {alert.productName}
                                </span>
                              </div>
                            )}
                            {alert.batchNo && (
                              <div>
                                <span className="text-white/30">Batch: </span>
                                <span className="text-white font-medium">
                                  {alert.batchNo}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex gap-2">
                          {!isResolved && (
                            <button
                              onClick={() => resolveAlert(alert.id)}
                              className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors"
                            >
                              <CheckCircle size={12} /> Mark as Resolved
                            </button>
                          )}
                          <button className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-lg bg-white/6 text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                            <Edit3 size={12} /> Edit Alert
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
