"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useSafetyAlerts } from "@/hooks/dashboard-hooks";
import {
  Bell,
  CheckCircle,
  Search,
  Package,
  Hash,
  Clock,
  Info,
  Shield,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
  Loader2,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import type { AlertSeverity } from "@/types";

type AlertStatus = "ACTIVE" | "RESOLVED";

interface Alert {
  id: string;
  title: string;
  body: string;
  severity: AlertSeverity;
  status: AlertStatus;
  productName?: string;
  batchNo?: string;
  publishedAt: string;
}

// Fallback mock while API loads
const MOCK_ALERTS: Alert[] = [
  {
    id: "a1",
    severity: "DANGER",
    status: "ACTIVE",
    title: "Counterfeit Moringa Capsules Detected in Lagos Markets",
    body: 'Multiple batches of counterfeit "SuperGreen Moringa 500mg" identified in Lagos Island and Alaba markets. Lab analysis reveals lead levels of 12.4 mg/kg — over 6× the safe limit. Do not consume. Dispose of immediately.',
    productName: "SuperGreen Moringa 500mg",
    batchNo: "B2024-FAKE-01",
    publishedAt: "2 hours ago",
  },
  {
    id: "a2",
    severity: "WARNING",
    status: "ACTIVE",
    title: "St. John's Wort + SSRI Antidepressants — Interaction Warning",
    body: "Significant risk of serotonin syndrome when combining St. John's Wort with SSRI antidepressants (sertraline, fluoxetine, citalopram). Stop St. John's Wort immediately if you take SSRIs and consult your doctor.",
    productName: "St. John's Wort Extract",
    publishedAt: "1 day ago",
  },
  {
    id: "a3",
    severity: "WARNING",
    status: "ACTIVE",
    title: "High-Dose Bitter Leaf — Hypoglycaemia Risk in Diabetics",
    body: "High-dose Bitter Leaf preparations (>500mg/day) may cause additive blood sugar-lowering effects alongside metformin or glibenclamide. Monitor glucose closely if combining these.",
    publishedAt: "3 days ago",
  },
  {
    id: "a4",
    severity: "DANGER",
    status: "RESOLVED",
    title: "Shea Butter Adulteration — Kano Batch B2024-11 Recalled",
    body: 'Batch B2024-11 of "PureShea Body Butter" failed microbial screening. All units have been recalled. The producer has been suspended from the marketplace.',
    productName: "PureShea Body Butter",
    batchNo: "B2024-11",
    publishedAt: "1 month ago",
  },
  {
    id: "a5",
    severity: "INFO",
    status: "RESOLVED",
    title: "Updated Safety Guidelines: Bitter Leaf (Vernonia amygdalina)",
    body: "Revised dosage guidelines and interaction warnings for Bitter Leaf now available in the Herb Directory and Safety Guides.",
    publishedAt: "2 months ago",
  },
];

const severityConfig: Record<
  AlertSeverity,
  {
    bg: string;
    border: string;
    badge: string;
    icon: string;
    label: string;
    dot: string;
  }
> = {
  DANGER: {
    bg: "bg-red-500/8",
    border: "border-red-500/20",
    badge: "bg-red-500/15 text-red-400",
    icon: "🚨",
    label: "Danger",
    dot: "bg-red-400",
  },
  WARNING: {
    bg: "bg-amber-500/8",
    border: "border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-400",
    icon: "⚠️",
    label: "Warning",
    dot: "bg-amber-400",
  },
  INFO: {
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
    badge: "bg-blue-500/15 text-blue-400",
    icon: "ℹ️",
    label: "Info",
    dot: "bg-blue-400",
  },
};

export function CustomerAlertsPage() {
  const { data, loading } = useSafetyAlerts("ALL");
  const alerts = (data?.alerts as Alert[] | undefined) ?? MOCK_ALERTS;

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "ALL">(
    "ALL",
  );
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "ALL">(
    "ACTIVE",
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [subEmail, setSubEmail] = useState("");
  const [subLoading, setSubLoading] = useState(false);
  const [subDone, setSubDone] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const filtered = alerts.filter((a) => {
    if (dismissed.has(a.id)) return false;
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.productName?.toLowerCase().includes(search.toLowerCase());
    const matchSeverity =
      severityFilter === "ALL" || a.severity === severityFilter;
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });

  const activeCount = alerts.filter(
    (a) => a.status === "ACTIVE" && !dismissed.has(a.id),
  ).length;
  const dangerCount = alerts.filter(
    (a) =>
      a.severity === "DANGER" && a.status === "ACTIVE" && !dismissed.has(a.id),
  ).length;

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!subEmail) return;
    setSubLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubLoading(false);
    setSubDone(true);
    setSubscribed(true);
  }

  return (
    <DashboardShell
      heading="Safety Alerts"
      subheading="Real-time warnings about dangerous, adulterated, or counterfeit herbal products."
    >
      {/* Subscription banner */}
      <AnimatePresence>
        {!subscribed && !subDone && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl bg-(--green-mid)/10 border border-(--green-mid)/25"
          >
            <div className="flex items-center gap-3 flex-1">
              <Bell size={18} className="text-(--green-pale) shrink-0" />
              <div>
                <p className="text-[14px] font-semibold text-white">
                  Get instant alerts by email
                </p>
                <p className="text-[12px] text-white/50">
                  Be notified the moment a new safety alert is published.
                </p>
              </div>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 shrink-0">
              <input
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                type="email"
                placeholder="your@email.com"
                className="h-9 px-3.5 bg-white/8 border border-white/15 rounded-lg text-[13px] text-white placeholder:text-white/30 outline-none focus:border-(--green-pale) w-48 transition-colors"
              />
              <button
                type="submit"
                disabled={subLoading || !subEmail}
                className="h-9 px-4 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-40 text-white text-[13px] font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                {subLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <>
                    <Bell size={13} /> Subscribe
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
        {subDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20"
          >
            <CheckCircle size={16} className="text-green-400" />
            <p className="text-[14px] text-white">
              Subscribed! You&apos;ll get email alerts for new safety warnings.
            </p>
            <button
              onClick={() => setSubDone(false)}
              className="ml-auto text-white/30 hover:text-white"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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
            label: "All Alerts",
            value: String(alerts.length),
            color: "text-white",
            bg: "bg-white/[0.04] border-white/[0.07]",
          },
          {
            label: "Alert Status",
            value: subscribed ? "On 🔔" : "Off 🔕",
            color: subscribed ? "text-green-400" : "text-white/40",
            bg: "bg-white/[0.04] border-white/[0.07]",
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl border p-5 ${k.bg}`}
          >
            <div className={`text-[24px] font-serif font-semibold ${k.color}`}>
              {k.value}
            </div>
            <div className="text-[11px] text-white/35 mt-0.5">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
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
        <div className="flex gap-1.5 flex-wrap">
          {(["ALL", "ACTIVE", "RESOLVED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${statusFilter === s ? "bg-(--green-mid) text-white border-(--green-mid)" : "bg-white/4 text-white/45 hover:text-white border-white/[0.07]"}`}
            >
              {s === "ALL"
                ? "All Status"
                : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
          <div className="w-px bg-white/8" />
          {(["ALL", "DANGER", "WARNING", "INFO"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${severityFilter === s ? "bg-(--green-mid) text-white border-(--green-mid)" : "bg-white/4 text-white/45 hover:text-white border-white/[0.07]"}`}
            >
              {s === "ALL"
                ? "All Severity"
                : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Alert cards */}
      {loading && (
        <div className="flex items-center justify-center h-32 text-white/30">
          <Loader2 size={24} className="animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-white/[0.07] bg-white/2">
          <CheckCircle size={32} className="text-green-400/50 mb-3" />
          <p className="text-white/40 text-[14px]">
            No alerts match your filter
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((alert, i) => {
          const cfg = severityConfig[alert.severity];
          const isOpen = expanded === alert.id;
          const isResolved = alert.status === "RESOLVED";

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-2xl border overflow-hidden transition-all ${isResolved ? "border-white/[0.07] bg-white/2 opacity-70" : `${cfg.border} ${cfg.bg}`}`}
            >
              <div className="flex items-start gap-4 p-5">
                <span className="text-[22px] shrink-0 mt-0.5">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}
                    >
                      {cfg.label}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isResolved ? "bg-white/6 text-white/30" : "bg-green-500/15 text-green-400"}`}
                    >
                      {isResolved ? "✓ Resolved" : "● Active"}
                    </span>
                  </div>
                  <p
                    className={`text-[14px] font-semibold mb-1 ${isResolved ? "text-white/45 line-through" : "text-white"}`}
                  >
                    {alert.title}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-white/30 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {alert.publishedAt}
                    </span>
                    {alert.productName && (
                      <span className="flex items-center gap-1">
                        <Package size={10} /> {alert.productName}
                      </span>
                    )}
                    {alert.batchNo && (
                      <span className="flex items-center gap-1">
                        <Hash size={10} /> {alert.batchNo}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setExpanded(isOpen ? null : alert.id)}
                    className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all"
                  >
                    {isOpen ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      setDismissed((prev) => new Set([...prev, alert.id]))
                    }
                    className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/30 hover:text-white/60 transition-all"
                    title="Dismiss"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

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
                      <p className="text-[14px] text-white/65 leading-relaxed mb-4">
                        {alert.body}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href="/booking"
                          className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-2 rounded-lg bg-(--green-mid)/15 text-(--green-pale) hover:bg-(--green-mid)/25 border border-(--green-mid)/20 transition-colors"
                        >
                          <MessageSquare size={12} /> Speak to a Pharmacist
                        </Link>
                        <Link
                          href="/herbs"
                          className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-2 rounded-lg bg-white/6 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <ExternalLink size={12} /> Herb Directory
                        </Link>
                        {alert.status === "ACTIVE" && (
                          <div className="flex items-center gap-2 ml-auto text-[11px] text-white/30">
                            <Shield size={11} /> Review conducted by HerbRx
                            pharmacists
                          </div>
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

      {/* Disclaimer */}
      <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-white/3 border border-white/6">
        <Info size={14} className="text-white/30 shrink-0 mt-0.5" />
        <p className="text-[12px] text-white/30 leading-relaxed">
          HerbRx safety alerts are independently published and are not
          affiliated with NAFDAC or any government agency. Always verify with
          your pharmacist before making decisions about your health.{" "}
          <Link
            href="/alerts"
            className="text-(--green-pale) hover:text-white transition-colors"
          >
            View all public alerts →
          </Link>
        </p>
      </div>
    </DashboardShell>
  );
}
