"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  TrendingUp,
  CheckCircle,
  X,
  Loader2,
  Plus,
  Search,
  Sparkles,
  RotateCcw,
  ThumbsDown,
  Info,
} from "lucide-react";

type Severity =
  | "CONTRAINDICATED"
  | "DANGER"
  | "WARNING"
  | "INFO"
  | "BENEFICIAL";
interface GapEntry {
  drug: string;
  count: number;
  lastSeen: string;
}
interface Report {
  id: string;
  drugName: string;
  herbName: string;
  severity: Severity | null;
  description: string;
  outcome: string | null;
  createdAt: string;
  submittedAsConsultant?: boolean;
  verified?: boolean;
  promotedToDb?: boolean;
  verifiedAt?: string | null;
}
interface FeedbackEntry {
  id: string;
  type: "CONFIRM" | "DISPUTE";
  drugName: string | null;
  herbName: string | null;
  description: string;
  outcome: string | null;
  createdAt: string;
  submittedAsConsultant?: boolean;
  interaction: {
    drugName: string;
    herbName: string;
    severity: Severity;
  } | null;
}
interface Disputed {
  id: string;
  drugName: string;
  herbName: string;
  severity: Severity;
  confirmedCount: number;
  disputedCount: number;
  evidenceLevel: string;
}
interface Stats {
  totalInteractions: number;
  totalQueries: number;
  totalFeedback: number;
  totalGapQueries: number;
  gapRate: number;
  uniqueGaps: number;
  pendingReports?: number;
  pendingFeedback?: number;
}

const inputCls =
  "w-full h-10 px-4 bg-white/[0.06] border border-white/[0.1] rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[var(--green-mid)] transition-all";
const labelCls =
  "block text-[10px] text-white/35 uppercase tracking-wider mb-1.5";
const sevColors: Record<Severity, string> = {
  CONTRAINDICATED: "bg-red-950/40 text-red-300 border border-red-500/40",
  DANGER: "bg-red-500/15 text-red-400",
  WARNING: "bg-amber-500/15 text-amber-400",
  INFO: "bg-blue-500/15 text-blue-400",
  BENEFICIAL: "bg-green-500/15 text-green-400",
};
const NO_SEVERITY_CLS = "bg-white/8 text-white/40";
function sevBadgeCls(s: Severity | null | undefined) {
  return s ? (sevColors[s] ?? NO_SEVERITY_CLS) : NO_SEVERITY_CLS;
}

export function InteractionGapsPage() {
  const [gaps, setGaps] = useState<GapEntry[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const [history, setHistory] = useState<Report[]>([]);
  const [disputed, setDisputed] = useState<Disputed[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);
  const [tab, setTab] = useState<
    "gaps" | "reports" | "feedback" | "disputed" | "history"
  >("gaps");
  const [search, setSearch] = useState("");
  const [promote, setPromote] = useState<Report | null>(null);
  const [confirmDismiss, setConfirmDismiss] = useState<Report | null>(null);
  const [ackBusyId, setAckBusyId] = useState<string | null>(null);
  const [restoreBusyId, setRestoreBusyId] = useState<string | null>(null);
  type PromoteForm = {
    drugName: string;
    drugClass: string;
    herbName: string;
    herbScientific: string;
    severity: Severity;
    mechanism: string;
    effect: string;
    advice: string;
    evidenceLevel: string;
    herbLocalNames: string;
    drugAliases: string;
  };
  const [pForm, setPForm] = useState<PromoteForm>({
    drugName: "",
    drugClass: "",
    herbName: "",
    herbScientific: "",
    severity: "WARNING",
    mechanism: "",
    effect: "",
    advice: "",
    evidenceLevel: "PRELIMINARY",
    herbLocalNames: "",
    drugAliases: "",
  });
  const [promoting, setPromoting] = useState(false);
  const [pMsg, setPMsg] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/dashboard/admin/interaction-gaps");
      const d = await r.json();
      setGaps(d.gaps ?? []);
      setReports(d.reports ?? []);
      setFeedbackEntries(d.feedbackEntries ?? []);
      setHistory(d.history ?? []);
      setDisputed(d.disputed ?? []);
      setStats(d.stats ?? null);
      setLastLoaded(new Date());
    } catch {
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    // Avoid calling setState synchronously within an effect to prevent
    // cascading renders. Schedule load to run asynchronously.
    Promise.resolve().then(load);
  }, []);

  function openPromote(r: Report) {
    setPromote(r);
    setPForm((p) => ({
      ...p,
      drugName: r.drugName ?? "",
      herbName: r.herbName ?? "",
      severity: r.severity ?? "WARNING",
    }));
    setPMsg("");
  }

  async function doAction(action: "PROMOTE" | "REJECT") {
    if (!promote) return;
    setPromoting(true);
    try {
      type BaseBody = { feedbackId: string; action: "PROMOTE" | "REJECT" };
      type PromoteBody = BaseBody & {
        drugName: string;
        drugClass: string;
        herbName: string;
        herbScientific: string;
        severity: Severity;
        mechanism: string;
        effect: string;
        advice: string;
        evidenceLevel: string;
        herbLocalNames: string[];
        drugAliases: string[];
      };
      type RejectBody = BaseBody;

      const base: BaseBody = { feedbackId: promote.id, action };
      let payload: PromoteBody | RejectBody = base;
      if (action === "PROMOTE") {
        payload = {
          ...base,
          drugName: pForm.drugName,
          drugClass: pForm.drugClass,
          herbName: pForm.herbName,
          herbScientific: pForm.herbScientific,
          severity: pForm.severity,
          mechanism: pForm.mechanism,
          effect: pForm.effect,
          advice: pForm.advice,
          evidenceLevel: pForm.evidenceLevel,
          herbLocalNames: pForm.herbLocalNames
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          drugAliases: pForm.drugAliases
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };
      }
      const r = await fetch("/api/dashboard/admin/interaction-gaps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        setReports((prev) => prev.filter((x) => x.id !== promote.id));
        setPMsg(
          action === "PROMOTE" ? "Promoted to database." : "Report dismissed.",
        );
        setTimeout(() => {
          setPromote(null);
          setPMsg("");
        }, 1500);
        if (action === "PROMOTE") load();
      }
    } catch {
    } finally {
      setPromoting(false);
    }
  }

  async function confirmDismissAction() {
    if (!confirmDismiss) return;
    const target = confirmDismiss;
    setConfirmDismiss(null);
    try {
      const r = await fetch("/api/dashboard/admin/interaction-gaps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId: target.id, action: "REJECT" }),
      });
      if (r.ok) {
        setReports((prev) => prev.filter((x) => x.id !== target.id));
        load();
      }
    } catch {
      // no-op — they can retry from the list
    }
  }

  async function acknowledgeFeedback(id: string) {
    setAckBusyId(id);
    try {
      const r = await fetch("/api/dashboard/admin/interaction-gaps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId: id, action: "ACKNOWLEDGE" }),
      });
      if (r.ok) setFeedbackEntries((prev) => prev.filter((f) => f.id !== id));
    } catch {
    } finally {
      setAckBusyId(null);
    }
  }

  async function restoreReport(id: string) {
    setRestoreBusyId(id);
    try {
      const r = await fetch("/api/dashboard/admin/interaction-gaps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId: id, action: "RESTORE" }),
      });
      if (r.ok) {
        setHistory((prev) => prev.filter((h) => h.id !== id));
        load();
      }
    } catch {
    } finally {
      setRestoreBusyId(null);
    }
  }

  const fGaps = gaps.filter(
    (g) => !search || g.drug.includes(search.toLowerCase()),
  );
  const fReports = reports.filter(
    (r) =>
      !search ||
      r.drugName?.includes(search.toLowerCase()) ||
      r.herbName?.includes(search.toLowerCase()),
  );
  const fFeedback = feedbackEntries.filter(
    (f) =>
      !search ||
      (f.drugName ?? f.interaction?.drugName)
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      (f.herbName ?? f.interaction?.herbName)
        ?.toLowerCase()
        .includes(search.toLowerCase()),
  );
  const fDisputed = disputed.filter(
    (d) => !search || d.drugName?.includes(search.toLowerCase()),
  );
  const fHistory = history.filter(
    (h) =>
      !search ||
      h.drugName?.includes(search.toLowerCase()) ||
      h.herbName?.includes(search.toLowerCase()),
  );

  return (
    <DashboardShell
      heading="Interaction Engine — Admin"
      subheading="Gap report, community reports, and disputed entries — the engine's self-building feed."
    >
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-7">
          {[
            {
              label: "DB Pairs",
              value: stats.totalInteractions,
              color: "text-[var(--green-pale)]",
            },
            {
              label: "Total Queries",
              value: stats.totalQueries,
              color: "text-blue-300",
            },
            {
              label: "Feedback",
              value: stats.totalFeedback,
              color: "text-purple-300",
            },
            {
              label: "Gap Queries",
              value: stats.totalGapQueries,
              color: "text-amber-300",
            },
            {
              label: "Gap Rate",
              value: `${stats.gapRate}%`,
              color: "text-red-300",
            },
            {
              label: "Unique Gaps",
              value: stats.uniqueGaps,
              color: "text-white/60",
            },
            {
              label: "Pending Reports",
              value: stats.pendingReports ?? reports.length,
              color: "text-(--green-pale)",
            },
            {
              label: "Pending Feedback",
              value: stats.pendingFeedback ?? feedbackEntries.length,
              color: "text-purple-300",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/4 border border-white/[0.07] rounded-2xl p-4 text-center"
            >
              <p className={`text-[22px] font-serif font-semibold ${s.color}`}>
                {s.value}
              </p>
              <p className="text-[10px] text-white/30 mt-0.5 uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by drug or herb…"
            className="w-full h-10 pl-9 pr-4 bg-white/5 border border-white/8 rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none focus:border-(--green-mid) transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(
            [
              ["gaps", "Gaps"],
              ["reports", "Reports"],
              ["feedback", "Feedback"],
              ["disputed", "Disputed"],
              ["history", "History"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`text-[12px] font-medium px-4 py-2 rounded-xl border transition-all ${tab === key ? "bg-(--green-mid) text-white border-(--green-mid)" : "bg-white/4 text-white/45 border-white/7 hover:text-white"}`}
            >
              {label} (
              {key === "gaps"
                ? gaps.length
                : key === "reports"
                  ? reports.length
                  : key === "feedback"
                    ? feedbackEntries.length
                    : key === "disputed"
                      ? disputed.length
                      : history.length}
              )
            </button>
          ))}
          <button
            onClick={load}
            title={
              lastLoaded
                ? `Last refreshed ${lastLoaded.toLocaleTimeString("en-NG")}`
                : "Refresh"
            }
            className="flex items-center gap-1.5 h-10 px-3 border border-white/8 text-white/40 hover:text-white rounded-xl transition-colors text-[12px]"
          >
            <RotateCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {lastLoaded && !loading && (
        <p className="text-[11px] text-white/25 -mt-3 mb-4">
          Last refreshed {lastLoaded.toLocaleTimeString("en-NG")} — data
          doesn&apos;t update live, use Refresh to pull in new submissions.
        </p>
      )}

      {loading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 size={24} className="animate-spin text-(--green-pale)" />
        </div>
      )}

      {/* GAPS TAB */}
      {!loading && tab === "gaps" && (
        <div className="space-y-2">
          {fGaps.length === 0 && (
            <p className="text-center py-16 text-white/25 text-[14px]">
              No gaps recorded yet.
            </p>
          )}
          {fGaps.map((gap, i) => (
            <motion.div
              key={gap.drug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/[0.07] bg-white/3"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <TrendingUp size={15} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-white capitalize">
                  {gap.drug}
                </p>
                <p className="text-[12px] text-white/35">
                  Last: {new Date(gap.lastSeen).toLocaleDateString("en-NG")}
                </p>
              </div>
              <p className="text-[20px] font-serif font-semibold text-amber-400 shrink-0">
                {gap.count}
              </p>
            </motion.div>
          ))}
          {fGaps.length > 0 && (
            <div className="flex items-start gap-2 p-4 rounded-xl bg-white/3 border border-white/6 mt-3">
              <Info size={13} className="text-white/25 shrink-0 mt-0.5" />
              <p className="text-[12px] text-white/30">
                Drugs searched with no results, sorted by frequency. Review the
                Reports tab to promote community-submitted interactions for
                high-frequency gaps.
              </p>
            </div>
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {!loading && tab === "reports" && (
        <div className="space-y-3">
          {fReports.length === 0 && (
            <p className="text-center py-16 text-white/25 text-[14px]">
              No pending community reports.
            </p>
          )}
          {fReports.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white/3 border border-white/[0.07] rounded-2xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${sevBadgeCls(r.severity)}`}
                    >
                      {r.severity ?? "SEVERITY UNSET"}
                    </span>
                    <span className="text-[12px] text-white/40">
                      {new Date(r.createdAt).toLocaleDateString("en-NG")}
                    </span>
                    {r.submittedAsConsultant && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-(--green-mid)/20 text-(--green-pale) border border-(--green-mid)/30">
                        From Consultant
                      </span>
                    )}
                  </div>
                  <p className="text-[15px] font-semibold text-white mb-1">
                    {r.drugName ?? "—"} × {r.herbName ?? "—"}
                  </p>
                  <p className="text-[13px] text-white/60 leading-relaxed mb-1">
                    {r.description}
                  </p>
                  {r.outcome && (
                    <p className="text-[12px] text-white/40 italic">
                      Outcome: {r.outcome}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => openPromote(r)}
                    className="flex items-center gap-1.5 text-[12px] font-semibold px-4 py-2 rounded-xl bg(--green-mid)/15 text-(--green-pale) hover:bg-(--green-mid)/25 border border-(--green-mid)/25 transition-colors"
                  >
                    <Plus size={12} /> Promote
                  </button>
                  <button
                    onClick={() => setConfirmDismiss(r)}
                    className="flex items-center gap-1.5 text-[12px] px-4 py-2 rounded-xl border border-white/8 text-white/35 hover:text-white/60 transition-colors"
                  >
                    <X size={12} /> Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* DISPUTED TAB */}
      {!loading && tab === "disputed" && (
        <div className="space-y-3">
          {fDisputed.length === 0 && (
            <p className="text-center py-16 text-white/25 text-[14px]">
              No disputed entries.
            </p>
          )}
          {fDisputed.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-red-500/15 bg-red-500/5"
            >
              <ThumbsDown size={18} className="text-red-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-[14px] font-semibold text-white">
                    {d.drugName} × {d.herbName}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sevBadgeCls(d.severity)}`}
                  >
                    {d.severity}
                  </span>
                </div>
                <p className="text-[12px] text-white/40">{d.evidenceLevel}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] text-white/60 flex items-center gap-2">
                  <span className="flex items-center gap-1 text-green-400">
                    {d.confirmedCount} <CheckCircle size={12} />
                  </span>
                  ·
                  <span className="flex items-center gap-1 text-red-400">
                    {d.disputedCount} <X size={12} />
                  </span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* FEEDBACK TAB — individual CONFIRM/DISPUTE notes, previously only
          ever visible as an aggregate count on the interaction itself */}
      {!loading && tab === "feedback" && (
        <div className="space-y-3">
          {fFeedback.length === 0 && (
            <p className="text-center py-16 text-white/25 text-[14px]">
              No feedback awaiting review.
            </p>
          )}
          {fFeedback.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`p-5 rounded-2xl border ${f.type === "CONFIRM" ? "border-green-500/15 bg-green-500/5" : "border-red-500/15 bg-red-500/5"}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${f.type === "CONFIRM" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}
                    >
                      {f.type}
                    </span>
                    <span className="text-[12px] text-white/40">
                      {new Date(f.createdAt).toLocaleDateString("en-NG")}
                    </span>
                    {f.submittedAsConsultant && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-(--green-mid)/20 text-(--green-pale) border border-(--green-mid)/30">
                        From Consultant
                      </span>
                    )}
                  </div>
                  <p className="text-[15px] font-semibold text-white mb-1">
                    {f.herbName ?? f.interaction?.herbName ?? "—"}{" "}
                    <span className="text-white/35">
                      × {f.drugName ?? f.interaction?.drugName ?? "—"}
                    </span>
                  </p>
                  <p className="text-[13px] text-white/60 leading-relaxed mb-1">
                    {f.description}
                  </p>
                  {f.outcome && (
                    <p className="text-[12px] text-white/40 italic">
                      Outcome: {f.outcome}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() => acknowledgeFeedback(f.id)}
                    disabled={ackBusyId === f.id}
                    className="flex items-center gap-1.5 text-[12px] px-4 py-2 rounded-xl border border-white/8 text-white/40 hover:text-white disabled:opacity-40 transition-colors"
                  >
                    {ackBusyId === f.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <CheckCircle size={12} />
                    )}
                    Mark Reviewed
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {fFeedback.length > 0 && (
            <div className="flex items-start gap-2 p-4 rounded-xl bg-white/3 border border-white/6 mt-3">
              <Info size={13} className="text-white/25 shrink-0 mt-0.5" />
              <p className="text-[12px] text-white/30">
                Confirming or disputing an existing entry already updates its
                confirmed/disputed counts on submission — &quot;Mark
                Reviewed&quot; just acknowledges you&apos;ve read the note, it
                doesn&apos;t change the interaction.
              </p>
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB — previously reviewed reports (promoted or dismissed).
          Dismissing used to be permanent and invisible with no confirmation
          step at all; this keeps a trail and lets a mistaken dismiss be
          undone. */}
      {!loading && tab === "history" && (
        <div className="space-y-3">
          {fHistory.length === 0 && (
            <p className="text-center py-16 text-white/25 text-[14px]">
              No reviewed reports yet.
            </p>
          )}
          {fHistory.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-4 p-5 rounded-2xl border border-white/[0.07] bg-white/3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${h.promotedToDb ? "bg-green-500/15 text-green-400" : "bg-white/8 text-white/40"}`}
                  >
                    {h.promotedToDb ? "PROMOTED" : "DISMISSED"}
                  </span>
                  {h.verifiedAt && (
                    <span className="text-[12px] text-white/40">
                      {new Date(h.verifiedAt).toLocaleDateString("en-NG")}
                    </span>
                  )}
                </div>
                <p className="text-[14px] font-semibold text-white mb-1">
                  {h.drugName ?? "—"} × {h.herbName ?? "—"}
                </p>
                <p className="text-[13px] text-white/50 leading-relaxed">
                  {h.description}
                </p>
              </div>
              {!h.promotedToDb && (
                <button
                  onClick={() => restoreReport(h.id)}
                  disabled={restoreBusyId === h.id}
                  className="shrink-0 flex items-center gap-1.5 text-[12px] px-4 py-2 rounded-xl border border-white/8 text-white/40 hover:text-white disabled:opacity-40 transition-colors"
                >
                  {restoreBusyId === h.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <RotateCcw size={12} />
                  )}
                  Restore
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* CONFIRM DISMISS MODAL */}
      <AnimatePresence>
        {confirmDismiss && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setConfirmDismiss(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1A2030] border border-white/10 rounded-2xl w-full max-w-sm p-5"
            >
              <p className="text-[14px] font-semibold text-white mb-2">
                Dismiss this report?
              </p>
              <p className="text-[13px] text-white/50 mb-5">
                &quot;{confirmDismiss.drugName} × {confirmDismiss.herbName}
                &quot; will move to History, where it can still be restored
                later if needed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDismiss(null)}
                  className="flex-1 h-10 border border-white/10 text-white/50 hover:text-white rounded-xl text-[13px] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDismissAction}
                  className="flex-1 h-10 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl text-[13px] transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROMOTE MODAL */}
      <AnimatePresence>
        {promote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget && !promoting) setPromote(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-[#1A2030] border border-white/10 rounded-2xl w-full max-w-xl my-8 overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                <h3 className="text-[15px] font-semibold text-white">
                  Promote to Interaction Database
                </h3>
                <button
                  onClick={() => setPromote(null)}
                  className="text-white/30 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              {pMsg ? (
                <div className="p-6 flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-400" />
                  <p className="text-[14px] text-white">{pMsg}</p>
                </div>
              ) : (
                <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                  <p className="text-[12px] text-white/45">
                    Verify and enrich before promoting. Fields pre-filled from
                    the community report.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        ["Drug Name *", "drugName", "warfarin"],
                        ["Drug Class", "drugClass", "Anticoagulant"],
                        ["Herb Name *", "herbName", "Bitter Leaf"],
                        [
                          "Scientific Name",
                          "herbScientific",
                          "Vernonia amygdalina",
                        ],
                      ] as Array<[string, keyof PromoteForm, string]>
                    ).map(([l, k, ph]) => (
                      <div key={String(k)}>
                        <label className={labelCls}>{l}</label>
                        <input
                          value={pForm[k]}
                          onChange={(e) =>
                            setPForm(
                              (p) =>
                                ({ ...p, [k]: e.target.value }) as PromoteForm,
                            )
                          }
                          placeholder={ph}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Severity *</label>
                      <select
                        value={pForm.severity}
                        onChange={(e) =>
                          setPForm((p) => ({
                            ...p,
                            severity: e.target.value as Severity,
                          }))
                        }
                        className={`${inputCls} cursor-pointer`}
                      >
                        {[
                          "CONTRAINDICATED",
                          "DANGER",
                          "WARNING",
                          "INFO",
                          "BENEFICIAL",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Evidence Level *</label>
                      <select
                        value={pForm.evidenceLevel}
                        onChange={(e) =>
                          setPForm((p) => ({
                            ...p,
                            evidenceLevel: e.target.value,
                          }))
                        }
                        className={`${inputCls} cursor-pointer`}
                      >
                        {["STRONG", "MODERATE", "PRELIMINARY", "ANECDOTAL"].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>
                  {(() => {
                    const promoteFields: Array<
                      [
                        string,
                        "mechanism" | "effect" | "advice",
                        string,
                        number,
                      ]
                    > = [
                      [
                        "Mechanism",
                        "mechanism",
                        "Pharmacological explanation...",
                        2,
                      ],
                      [
                        "Clinical Effect *",
                        "effect",
                        "What happens to the patient...",
                        2,
                      ],
                      [
                        "Clinical Advice *",
                        "advice",
                        "What should they do about it...",
                        2,
                      ],
                    ];

                    return promoteFields.map(([l, k, ph, rows]) => (
                      <div key={k}>
                        <label className={labelCls}>{l}</label>
                        <textarea
                          value={pForm[k]}
                          onChange={(e) =>
                            setPForm((p) => ({ ...p, [k]: e.target.value }))
                          }
                          placeholder={ph}
                          rows={rows}
                          className={`w-full ${inputCls} h-auto py-3 resize-none`}
                        />
                      </div>
                    ));
                  })()}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>
                        Herb Local Names (comma-sep)
                      </label>
                      <input
                        value={pForm.herbLocalNames}
                        onChange={(e) =>
                          setPForm((p) => ({
                            ...p,
                            herbLocalNames: e.target.value,
                          }))
                        }
                        placeholder="Ewuro (Yoruba), Onugbu (Igbo)"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Drug Aliases (comma-sep)
                      </label>
                      <input
                        value={pForm.drugAliases}
                        onChange={(e) =>
                          setPForm((p) => ({
                            ...p,
                            drugAliases: e.target.value,
                          }))
                        }
                        placeholder="glucophage, metforal"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-white/[0.07]">
                    <button
                      onClick={() => setPromote(null)}
                      className="h-10 px-5 border border-white/10 text-white/40 rounded-xl text-[13px] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => doAction("REJECT")}
                      disabled={promoting}
                      className="h-10 px-5 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl text-[13px] disabled:opacity-40 transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => doAction("PROMOTE")}
                      disabled={
                        promoting ||
                        !pForm.drugName ||
                        !pForm.herbName ||
                        !pForm.effect ||
                        !pForm.advice
                      }
                      className="flex-1 h-10 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-40 text-white font-semibold rounded-xl text-[13px] transition-colors flex items-center justify-center gap-2"
                    >
                      {promoting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />{" "}
                          Promoting…
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} /> Promote to Database
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
