"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminApi, useAdminBatches } from "@/hooks/dashboard-hooks";
import {
  Flag,
  FlaskConical,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Pause,
  ShieldX,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  Search,
  MessageSquare,
  Activity,
  Loader2,
  X,
} from "lucide-react";
import type { BatchStatus } from "@/types";

// ── Types ──────
type FlagSeverity = "HIGH" | "MEDIUM" | "LOW";
type FlagTarget = "Product" | "Producer" | "Batch";
type FlagAction = "Paused" | "Banned" | "Cleared" | "Warned";

interface FlaggedItem {
  id: string;
  targetType: FlagTarget;
  targetName: string;
  producerName: string;
  severity: FlagSeverity;
  reason: string;
  reportCount: number;
  flaggedAt: string;
  action: FlagAction | null;
  actionNote: string;
  actionAt: string | null;
}

interface BatchReview {
  id: string;
  productName: string;
  producerName: string;
  batchNo: string;
  labName: string;
  testedAt: string;
  submittedAt: string;
  reviewStatus: BatchStatus;
  coaFileUrl: string;
  // parameters: { name: string; result: string; limit: string; pass: boolean }[];
  reviewNote: string;
  reviewedAt: string | null;
}

// Shape for batches returned by useAdminBatches
interface AdminBatch {
  id?: string;
  product?: { name?: string; producerProfile?: { businessName?: string } } | null;
  batchNo?: string | null;
  labName?: string | null;
  testedAt?: string | null;
  createdAt?: string | null;
  reviewStatus?: BatchStatus | null;
  coaFileUrl?: string | null;
  reviewNotes?: string | null;
  updatedAt?: string | null;
}

// ── Mock data ───────
const INITIAL_FLAGS: FlaggedItem[] = [
  {
    id: "f1",
    targetType: "Product",
    targetName: "ZenMax Herbal Mix",
    producerName: "NaturaBlend Ltd",
    severity: "HIGH",
    reason:
      "3 adverse event reports in 48 hours — users reporting nausea and elevated heart rate.",
    reportCount: 3,
    flaggedAt: "2025-06-20 · 14:32",
    action: null,
    actionNote: "",
    actionAt: null,
  },
  {
    id: "f2",
    targetType: "Batch",
    targetName: "Batch #B2024-11 (SLIM-FX)",
    producerName: "SlimHerbs NG",
    severity: "HIGH",
    reason:
      "Lab retest confirms heavy metals exceedance: Lead 9.8 mg/kg (limit: 2 mg/kg).",
    reportCount: 1,
    flaggedAt: "2025-06-19 · 09:15",
    action: null,
    actionNote: "",
    actionAt: null,
  },
  {
    id: "f3",
    targetType: "Producer",
    targetName: "GreenRoot Ltd",
    producerName: "GreenRoot Ltd",
    severity: "MEDIUM",
    reason:
      "Submitted identical COA documents for two different product batches — suspected document reuse.",
    reportCount: 1,
    flaggedAt: "2025-06-18 · 11:00",
    action: null,
    actionNote: "",
    actionAt: null,
  },
  {
    id: "f4",
    targetType: "Product",
    targetName: "AloeBio Gel Capsules",
    producerName: "BioAloe Nigeria",
    severity: "MEDIUM",
    reason:
      'Product label claims "cures diabetes" — unsubstantiated therapeutic claim.',
    reportCount: 2,
    flaggedAt: "2025-06-17 · 16:45",
    action: "Warned",
    actionNote: "Producer notified to update label within 7 days.",
    actionAt: "2025-06-17 · 17:10",
  },
];

// const INITIAL_BATCHES: BatchReview[] = [
//   {
//     id: "br1",
//     productName: "Moringa Gold Capsules",
//     producerName: "GreenHealth NG",
//     batchNo: "B2024-12",
//     labName: "Spectralab NG",
//     testedAt: "2025-06-10",
//     submittedAt: "2025-06-12",
//     reviewStatus: "SUBMITTED",
//     coaFileName: "COA_Moringa_B2024-12.pdf",
//     parameters: [
//       {
//         name: "Lead (Pb)",
//         result: "0.8 mg/kg",
//         limit: "< 2 mg/kg",
//         pass: true,
//       },
//       {
//         name: "Mercury (Hg)",
//         result: "0.02 mg/kg",
//         limit: "< 0.1 mg/kg",
//         pass: true,
//       },
//       {
//         name: "Arsenic (As)",
//         result: "0.15 mg/kg",
//         limit: "< 1 mg/kg",
//         pass: true,
//       },
//       {
//         name: "Total Plate Count",
//         result: "2.1×10² CFU/g",
//         limit: "< 1×10⁴",
//         pass: true,
//       },
//       { name: "E. coli", result: "Not detected", limit: "Absent", pass: true },
//       { name: "Moisture Content", result: "4.2%", limit: "< 8%", pass: true },
//     ],
//     reviewNote: "",
//     reviewedAt: null,
//   },
//   {
//     id: "br2",
//     productName: "Bitter Leaf Tonic",
//     producerName: "HerbalNaija",
//     batchNo: "B2024-10",
//     labName: "PharmAnalytics Ltd",
//     testedAt: "2025-06-08",
//     submittedAt: "2025-06-09",
//     reviewStatus: "UNDER_REVIEW",
//     coaFileName: "COA_BitterLeaf_B2024-10.pdf",
//     parameters: [
//       {
//         name: "Lead (Pb)",
//         result: "1.4 mg/kg",
//         limit: "< 2 mg/kg",
//         pass: true,
//       },
//       {
//         name: "Mercury (Hg)",
//         result: "0.05 mg/kg",
//         limit: "< 0.1 mg/kg",
//         pass: true,
//       },
//       {
//         name: "Total Plate Count",
//         result: "4.8×10³ CFU/g",
//         limit: "< 1×10⁴",
//         pass: true,
//       },
//       {
//         name: "Yeast & Mould",
//         result: "1.2×10² CFU/g",
//         limit: "< 1×10²",
//         pass: false,
//       },
//       {
//         name: "Salmonella",
//         result: "Not detected",
//         limit: "Absent",
//         pass: true,
//       },
//     ],
//     reviewNote: "",
//     reviewedAt: null,
//   },
//   {
//     id: "br3",
//     productName: "Zobo Immune Blend",
//     producerName: "ZoboFresh Ltd",
//     batchNo: "B2024-11R",
//     labName: "NaijaLab",
//     testedAt: "2025-06-15",
//     submittedAt: "2025-06-16",
//     reviewStatus: "SUBMITTED",
//     coaFileName: "COA_Zobo_B2024-11R.pdf",
//     parameters: [
//       {
//         name: "Lead (Pb)",
//         result: "0.5 mg/kg",
//         limit: "< 2 mg/kg",
//         pass: true,
//       },
//       {
//         name: "Total Plate Count",
//         result: "6.1×10³ CFU/g",
//         limit: "< 1×10⁴",
//         pass: true,
//       },
//       { name: "E. coli", result: "Not detected", limit: "Absent", pass: true },
//       { name: "Moisture Content", result: "5.8%", limit: "< 8%", pass: true },
//     ],
//     reviewNote: "",
//     reviewedAt: null,
//   },
// ];

//── Config ─────
const flagSeverityConfig: Record<
  FlagSeverity,
  { badge: string; border: string; bg: string; dot: string }
> = {
  HIGH: {
    badge: "bg-red-500/15 text-red-400",
    border: "border-red-500/20",
    bg: "bg-red-500/5",
    dot: "bg-red-400",
  },
  MEDIUM: {
    badge: "bg-amber-500/15 text-amber-400",
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    dot: "bg-amber-400",
  },
  LOW: {
    badge: "bg-blue-500/15 text-blue-400",
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    dot: "bg-blue-400",
  },
};

const batchStatusConfig: Record<
  BatchStatus,
  { badge: string; icon: React.ReactNode; label: string }
> = {
  SUBMITTED: {
    badge: "bg-white/10 text-white/55",
    icon: <Clock size={12} />,
    label: "New",
  },
  UNDER_REVIEW: {
    badge: "bg-blue-500/15 text-blue-400",
    icon: <Eye size={12} />,
    label: "Reviewing",
  },
  APPROVED: {
    badge: "bg-green-500/15 text-green-400",
    icon: <CheckCircle size={12} />,
    label: "Approved",
  },
  REJECTED: {
    badge: "bg-red-500/15 text-red-400",
    icon: <XCircle size={12} />,
    label: "Rejected",
  },
};

const inputCls =
  "w-full h-10 px-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[var(--green-mid)] transition-all";

// ── Action modal ────
function ActionModal({
  item,
  onConfirm,
  onClose,
}: {
  item: FlaggedItem;
  onConfirm: (action: FlagAction, note: string) => void;
  onClose: () => void;
}) {
  const [action, setAction] = useState<FlagAction>("Warned");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function confirm() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    onConfirm(action, note);
    setSaving(false);
  }

  const actionConfig = {
    Warned: {
      color: "bg-amber-500/20 border-amber-500/30 text-amber-300",
      desc: "Send a formal warning to the producer. Item remains visible.",
    },
    Paused: {
      color: "bg-orange-500/20 border-orange-500/30 text-orange-300",
      desc: "Temporarily hide the item from the marketplace pending review.",
    },
    Banned: {
      color: "bg-red-500/20 border-red-500/30 text-red-300",
      desc: "Permanently remove the item. Producer will be notified.",
    },
    Cleared: {
      color: "bg-green-500/20 border-green-500/30 text-green-300",
      desc: "Remove the flag — no action required. Item remains as-is.",
    },
  } as const;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#1A2030] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h3 className="text-[15px] font-semibold text-white">
            Take Action — {item.targetName}
          </h3>
          <button onClick={onClose} className="text-white/30 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-[13px] text-white/50">{item.reason}</p>

          <div>
            <p className="text-[11px] text-white/35 uppercase tracking-wider mb-2">
              Select Action
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(actionConfig) as FlagAction[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={`p-3 rounded-xl border text-left transition-all ${action === a ? actionConfig[a].color : "border-white/8 bg-white/3 hover:border-white/20 text-white/50"}`}
                >
                  <p className="text-[13px] font-semibold">{a}</p>
                  <p className="text-[11px] opacity-70 mt-0.5 leading-tight">
                    {actionConfig[a].desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
              Internal Note (optional)
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add context for the audit log…"
              rows={3}
              className={`${inputCls} h-auto py-3 resize-none`}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="h-10 px-5 border border-white/10 text-white/50 hover:text-white rounded-xl text-[13px] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirm}
              disabled={saving}
              className="flex-1 h-10 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Saving…
                </>
              ) : (
                <>Confirm {action}</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Batch review modal ──────────
function BatchReviewModal({
  batch,
  onDecision,
  onClose,
}: {
  batch: BatchReview;
  onDecision: (
    id: string,
    status: "APPROVED" | "REJECTED",
    note: string,
  ) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED" | null>(
    null,
  );
  const [noteError, setNoteError] = useState<string | null>(null);

  // const failedParams = batch.parameters.filter((p) => !p.pass);
  const fileName = batch.coaFileUrl ? batch.coaFileUrl.split("/").pop() : null;

  async function confirm(d: "APPROVED" | "REJECTED") {
    if (d === "REJECTED" && !note.trim()) {
      setNoteError("A note is required so the producer knows what to fix.");
      return;
    }
    setNoteError(null);
    setSaving(true);
    setDecision(d);
    // await new Promise((r) => setTimeout(r, 1000));
    onDecision(batch.id, d, note.trim());
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="bg-[#1A2030] border border-white/10 rounded-2xl w-full max-w-lg my-4 overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div>
            <h3 className="text-[15px] font-semibold text-white">
              {batch.productName}
            </h3>
            <p className="text-[12px] text-white/40">
              {batch.producerName} · Batch {batch.batchNo} · {batch.labName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white shrink-0 ml-3"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* COA link */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/4 border border-white/[0.07]">
            <FileText size={16} className="text-white/40" />
            <span className="text-[13px] text-white flex-1 truncate">
              {fileName ?? "No COA file on record"}
            </span>
            {batch.coaFileUrl ? (
              <a
                href={batch.coaFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[12px] text-(--green-pale) hover:text-white transition-colors shrink-0"
              >
                <ExternalLink size={12} /> View
              </a>
            ) : (
              <span className="flex items-center gap-1.5 text-[12px] text-white/25 shrink-0">
                <AlertTriangle size={12} /> Missing
              </span>
            )}
          </div>

          {!batch.coaFileUrl && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20">
              <AlertTriangle
                size={14}
                className="text-amber-400 shrink-0 mt-0.5"
              />
              <p className="text-[12px] text-amber-300">
                This submission has no COA file attached. Reject it and ask the
                producer to resubmit with the document.
              </p>
            </div>
          )}


          <p className="text-[12px] text-white/40">
            Tested by <span className="text-white/70">{batch.labName}</span>
            {batch.testedAt !== "—" && (
              <>
                {" "}
                on <span className="text-white/70">{batch.testedAt}</span>
              </>
            )}
            . Submitted {batch.submittedAt}.
          </p>

          {/* Review note */}
          <div>
            <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
              Review Note{" "}
              <span className="normal-case text-white/25">
                (sent to producer — required when rejecting)
              </span>
            </p>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (noteError) setNoteError(null);
              }}
              placeholder="e.g. Yeast &amp; Mould count exceeds acceptable limit per the attached COA. Please remediate and resubmit."
              rows={3}
              className={`${inputCls} h-auto py-3 resize-none ${noteError ? "border-red-500/40" : ""}`}
            />
            {noteError && (
              <p className="text-[11px] text-red-400 mt-1">{noteError}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => confirm("REJECTED")}
              disabled={saving && decision === "REJECTED"}
              className="flex-1 h-11 bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-red-400 hover:text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving && decision === "REJECTED" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <XCircle size={14} />
              )}
              Reject
            </button>
            <button
              onClick={() => confirm("APPROVED")}
              disabled={
                (saving && decision === "APPROVED") || !batch.coaFileUrl
              }
              className="flex-1 h-11 bg-green-500/15 hover:bg-green-500/25 border border-green-500/20 text-green-400 hover:text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {saving && decision === "APPROVED" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCircle size={14} />
              )}
              Approve
            </button>
          </div>

          {!batch.coaFileUrl && (
            <p className="text-[11px] text-white/25 text-center -mt-2">
              Approval blocked — no COA file to review.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main component ────────
export function FlaggedItemsPage() {
  const [activeTab, setActiveTab] = useState<"flags" | "batches">("flags");
  const [flags, setFlags] = useState<FlaggedItem[]>(INITIAL_FLAGS);
  // const [batches, setBatches] = useState<BatchReview[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<FlaggedItem | null>(null);
  const [batchModal, setBatchModal] = useState<BatchReview | null>(null);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<FlagSeverity | "ALL">(
    "ALL",
  );

  // Real batch submissions
  const {
    data: batchData,
    loading: batchesLoading,
    mutate: refetchBatches,
  } = useAdminBatches();
  const [batches, setBatches] = useState<BatchReview[]>([]);
  const [batchesSynced, setBatchesSynced] = useState(false);
  if (batchData?.batches && !batchesSynced) {
    const shaped: BatchReview[] = batchData.batches.map((b: AdminBatch) => ({
      id: b.id ?? "",
      productName: b.product?.name ?? "Unknown product",
      producerName:
        b.product?.producerProfile?.businessName ?? "Unknown producer",
      batchNo: b.batchNo ?? "",
      labName: b.labName ?? "—",
      testedAt: b.testedAt
        ? new Date(b.testedAt).toLocaleDateString("en-NG")
        : "—",
      submittedAt: b.createdAt
        ? new Date(b.createdAt).toLocaleDateString("en-NG")
        : "—",
      reviewStatus: (b.reviewStatus as BatchStatus) ?? "SUBMITTED",
      coaFileUrl: b.coaFileUrl ?? "",
      reviewNote: b.reviewNotes ?? "",
      reviewedAt:
        b.reviewStatus === "APPROVED" || b.reviewStatus === "REJECTED"
          ? b.updatedAt
            ? new Date(b.updatedAt).toLocaleString("en-NG")
            : null
          : null,
    }));
    setBatches(shaped);
    setBatchesSynced(true);
  }
  // Poll so a batch a producer submits while an admin has this tab open
  useEffect(() => {
    const interval = setInterval(() => {
      setBatchesSynced(false);
      refetchBatches();
    }, 20_000);
    return () => clearInterval(interval);
  }, [refetchBatches]);

  function applyFlagAction(id: string, action: FlagAction, note: string) {
    // Optimistic update
    setFlags((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              action,
              actionNote: note,
              actionAt: new Date().toLocaleString("en-NG"),
            }
          : f,
      ),
    );
    setActionModal(null);

    // Sync to API
    const flag = flags.find((f) => f.id === id);
    if (flag) {
      adminApi
        .takeFlagAction({
          targetType: flag.targetType,
          targetId: id,
          action: action.toUpperCase(),
          reason: note,
        })
        .catch(() => {});
    }
  }

  async function applyBatchDecision(
    id: string,
    status: "APPROVED" | "REJECTED",
    note: string,
  ) {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              reviewStatus: status,
              reviewNote: note,
              reviewedAt: new Date().toLocaleString("en-NG"),
            }
          : b,
      ),
    );
    setBatchModal(null);
    try {
      adminApi.reviewBatch({ batchId: id, decision: status, reviewNote: note });
      // Re-Sync from the server so we reflect the true saved
      setBatchesSynced(false);
      await refetchBatches();
    } catch {
      setBatchesSynced(false);
    }
  }

  const pendingFlags = flags.filter((f) => !f.action).length;
  const pendingBatches = batches.filter(
    (b) => b.reviewStatus === "SUBMITTED" || b.reviewStatus === "UNDER_REVIEW",
  ).length;

  const filteredFlags = flags.filter((f) => {
    const matchSearch =
      !search ||
      f.targetName.toLowerCase().includes(search.toLowerCase()) ||
      f.producerName.toLowerCase().includes(search.toLowerCase());
    const matchSeverity =
      severityFilter === "ALL" || f.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  return (
    <DashboardShell
      heading="Flagged Items & Batch Review"
      subheading="Review adverse reports, flag actions, and COA batch submissions from producers."
    >
      {/* Modals */}
      <AnimatePresence>
        {actionModal && (
          <ActionModal
            item={actionModal}
            onConfirm={(a, n) => applyFlagAction(actionModal.id, a, n)}
            onClose={() => setActionModal(null)}
          />
        )}
        {batchModal && (
          <BatchReviewModal
            batch={batchModal}
            onDecision={applyBatchDecision}
            onClose={() => setBatchModal(null)}
          />
        )}
      </AnimatePresence>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {[
          {
            label: "Pending Flags",
            value: String(pendingFlags),
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/15",
          },
          {
            label: "Pending Batches",
            value: String(pendingBatches),
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/15",
          },
          {
            label: "Actioned Flags",
            value: String(flags.filter((f) => !!f.action).length),
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/15",
          },
          {
            label: "Batches Reviewed",
            value: String(
              batches.filter(
                (b) =>
                  b.reviewStatus === "APPROVED" ||
                  b.reviewStatus === "REJECTED",
              ).length,
            ),
            color: "text-white",
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
            <div className={`text-[26px] font-serif font-semibold ${k.color}`}>
              {k.value}
            </div>
            <div className="text-[12px] text-white/40 mt-0.5">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/4 border border-white/[0.07] rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("flags")}
          className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all flex items-center gap-2 ${activeTab === "flags" ? "bg-(--green-mid) text-white shadow" : "text-white/50 hover:text-white"}`}
        >
          <Flag size={14} /> Flagged Items
          {pendingFlags > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingFlags}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("batches")}
          className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all flex items-center gap-2 ${activeTab === "batches" ? "bg-(--green-mid) text-white shadow" : "text-white/50 hover:text-white"}`}
        >
          <FlaskConical size={14} /> Batch Review Queue
          {pendingBatches > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingBatches}
            </span>
          )}
        </button>
      </div>

      {/* ── Flagged Items ── */}
      {activeTab === "flags" && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search flags…"
                className="w-full h-10 pl-9 pr-4 bg-white/5 border border-white/8 rounded-xl text-[14px] text-white placeholder:text-white/30 outline-none focus:border-(--green-mid) transition-colors"
              />
            </div>
            <div className="flex gap-1.5">
              {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${severityFilter === s ? "bg-(--green-mid) text-white border-(--green-mid)" : "border-white/[0.07] text-white/45 hover:text-white bg-white/4"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFlags.map((flag, i) => {
              const cfg = flagSeverityConfig[flag.severity];
              const isExpanded = expanded === flag.id;
              const isActioned = !!flag.action;

              return (
                <motion.div
                  key={flag.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border overflow-hidden ${isActioned ? "border-white/[0.07] bg-white/2 opacity-75" : `${cfg.border} ${cfg.bg}`}`}
                >
                  <div className="flex items-start gap-4 p-5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${cfg.dot}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] text-white/35 uppercase tracking-wider">
                          {flag.targetType}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}
                        >
                          {flag.severity}
                        </span>
                        {flag.reportCount > 1 && (
                          <span className="text-[10px] text-white/30 bg-white/6 px-2 py-0.5 rounded-full">
                            {flag.reportCount} reports
                          </span>
                        )}
                        {isActioned && (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${flag.action === "Cleared" ? "bg-green-500/15 text-green-400" : flag.action === "Banned" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}
                          >
                            ✓ {flag.action}
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] font-semibold text-white">
                        {flag.targetName}
                      </p>
                      <p className="text-[12px] text-white/40">
                        {flag.producerName} · {flag.flaggedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : flag.id)}
                        className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all"
                      >
                        {isExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                      {!isActioned && (
                        <button
                          onClick={() => setActionModal(flag)}
                          className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-white/[0.07] text-white/60 hover:text-white hover:bg-white/12 transition-colors"
                        >
                          <Activity size={12} /> Take Action
                        </button>
                      )}
                    </div>
                  </div>

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
                          <p className="text-[13px] text-white/60 leading-relaxed mb-3">
                            {flag.reason}
                          </p>
                          {flag.actionNote && (
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/4 border border-white/[0.07] mb-3">
                              <MessageSquare
                                size={13}
                                className="text-white/30 shrink-0 mt-0.5"
                              />
                              <div>
                                <p className="text-[11px] text-white/35 uppercase tracking-wider mb-0.5">
                                  Action Note
                                </p>
                                <p className="text-[12px] text-white/60">
                                  {flag.actionNote}
                                </p>
                                {flag.actionAt && (
                                  <p className="text-[11px] text-white/25 mt-0.5">
                                    {flag.actionAt}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          {!isActioned && (
                            <div className="flex flex-wrap gap-2">
                              {[
                                {
                                  action: "Warned" as FlagAction,
                                  icon: <AlertTriangle size={12} />,
                                  cls: "bg-amber-500/10 text-amber-400 border-amber-500/15 hover:bg-amber-500/20",
                                },
                                {
                                  action: "Paused" as FlagAction,
                                  icon: <Pause size={12} />,
                                  cls: "bg-orange-500/10 text-orange-400 border-orange-500/15 hover:bg-orange-500/20",
                                },
                                {
                                  action: "Banned" as FlagAction,
                                  icon: <ShieldX size={12} />,
                                  cls: "bg-red-500/10 text-red-400 border-red-500/15 hover:bg-red-500/20",
                                },
                                {
                                  action: "Cleared" as FlagAction,
                                  icon: <ShieldCheck size={12} />,
                                  cls: "bg-green-500/10 text-green-400 border-green-500/15 hover:bg-green-500/20",
                                },
                              ].map((a) => (
                                <button
                                  key={a.action}
                                  onClick={() => setActionModal(flag)}
                                  className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors ${a.cls}`}
                                >
                                  {a.icon} {a.action}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Batch Review Queue ── */}
      {activeTab === "batches" && (
       <div className="space-y-3">
          {batchesLoading && batches.length === 0 ? (
            <div className="p-5 rounded-2xl border border-white/8 bg-white/3 text-[13px] text-white/40 text-center">
              Loading batch submissions…
            </div>
          ) : batches.length === 0 ? (
            <div className="p-5 rounded-2xl border border-white/8 bg-white/3 text-[13px] text-white/40 text-center">
              No batch submissions waiting for review.
            </div>
          ) : batches.map((batch, i) => {
            const cfg = batchStatusConfig[batch.reviewStatus]
            const isExpanded = expanded === `b-${batch.id}`
            const isDone     = batch.reviewStatus === 'APPROVED' || batch.reviewStatus === 'REJECTED'
            const missingFile = !batch.coaFileUrl

            return (
              <motion.div key={batch.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border overflow-hidden ${isDone ? 'border-white/[0.07] bg-white/2 opacity-75' : 'border-white/10 bg-white/4'}`}
              >
                <div className="flex items-center gap-4 p-5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.07] flex items-center justify-center shrink-0">
                    <FlaskConical size={18} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-[14px] font-semibold text-white">{batch.productName}</p>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      {missingFile && !isDone && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
                          NO COA FILE
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-white/40">
                      {batch.producerName} · Batch {batch.batchNo} · {batch.labName} · Submitted {batch.submittedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setExpanded(isExpanded ? null : `b-${batch.id}`)}
                      className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {!isDone && (
                      <button onClick={() => setBatchModal(batch)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors"
                      >
                        <Eye size={12} /> Review COA
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-white/6 pt-4 space-y-3">
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/4 border border-white/[0.07]">
                          <FileText size={16} className="text-white/40 shrink-0" />
                          <span className="text-[13px] text-white flex-1 truncate">
                            {batch.coaFileUrl ? batch.coaFileUrl.split('/').pop() : 'No COA file on record'}
                          </span>
                          {batch.coaFileUrl && (
                            <a href={batch.coaFileUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[12px] text-(--green-pale) hover:text-white transition-colors shrink-0"
                            >
                              <ExternalLink size={12} /> View
                            </a>
                          )}
                        </div>
                        {batch.reviewNote && (
                          <div className="p-3 rounded-xl bg-white/4 border border-white/[0.07]">
                            <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1">Review Note</p>
                            <p className="text-[12px] text-white/60">{batch.reviewNote}</p>
                            {batch.reviewedAt && <p className="text-[11px] text-white/25 mt-1">{batch.reviewedAt}</p>}
                          </div>
                        )}
                        {!isDone && (
                          <button onClick={() => setBatchModal(batch)}
                            className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                          >
                            <Eye size={12} /> Open Full COA Review
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </DashboardShell>
  );
}
