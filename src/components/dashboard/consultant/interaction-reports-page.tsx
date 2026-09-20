"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  useConsultantQueue,
  useConsultantInteractionReports,
  consultantApi,
} from "@/hooks/dashboard-hooks";
import {
  FlaskConical,
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Users,
  Stethoscope,
} from "lucide-react";

const inputCls =
  "w-full h-10 px-3 bg--green-mid border border-white/10 rounded-xl text-[13px] text-white placeholder:text-white/25 outline-none focus:border--green-mid transition-colors";

const SEVERITY_OPTIONS = [
  { value: "", label: "Not sure / let pharmacist assess" },
  { value: "CONTRAINDICATED", label: "Contraindicated — do not combine" },
  { value: "DANGER", label: "High risk" },
  { value: "WARNING", label: "Caution / moderate" },
  { value: "INFO", label: "Minor / informational" },
  { value: "BENEFICIAL", label: "Beneficial combination" },
];

interface QueueItem {
  id: string;
  clientName: string;
  type: string;
  status: string;
  scheduledAt: string | null;
}

interface SearchResult {
  id: string;
  drugName: string;
  herbName: string;
  severity: string;
}

interface ReportItem {
  id: string;
  type: string;
  drugName: string | null;
  herbName: string | null;
  description: string;
  outcome: string | null;
  verified: boolean;
  promotedToDb: boolean;
  createdAt: string;
  consultationId: string | null;
  interaction: { drugName: string; herbName: string; severity: string } | null;
}

export function ConsultantInteractionReportsPage() {
  const { data: queueData } = useConsultantQueue("all");
  const {
    data: reportsData,
    loading: reportsLoading,
    mutate: refetchReports,
  } = useConsultantInteractionReports();

  const completedConsultations = (
    (queueData?.queue ?? []) as unknown as QueueItem[]
  ).filter((q) => q.status === "COMPLETED");
  const reports = (reportsData?.reports ?? []) as unknown as ReportItem[];

  // ── New interaction report ──────────────────────────────────────────
  const [drugName, setDrugName] = useState("");
  const [herbName, setHerbName] = useState("");
  const [severity, setSeverity] = useState("");
  const [fromConsultation, setFromConsultation] = useState(false);
  const [consultationId, setConsultationId] = useState("");
  const [description, setDescription] = useState("");
  const [outcome, setOutcome] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  async function submitReport() {
    if (!drugName.trim() || !herbName.trim() || !description.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = (await consultantApi.submitInteractionReport({
        type: "REPORT",
        drugName: drugName.trim(),
        herbName: herbName.trim(),
        severity: severity || null,
        description: description.trim(),
        outcome: outcome.trim() || undefined,
        consultationId:
          fromConsultation && consultationId ? consultationId : undefined,
      })) as { message?: string };
      setSubmitSuccess(res.message ?? "Report submitted.");
      setDrugName("");
      setHerbName("");
      setSeverity("");
      setDescription("");
      setOutcome("");
      setFromConsultation(false);
      setConsultationId("");
      await refetchReports();
      setTimeout(() => setSubmitSuccess(null), 5000);
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Couldn't submit your report.",
      );
    }
    setSubmitting(false);
  }

  // ── Confirm / dispute an existing curated interaction ───────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [judgment, setJudgment] = useState<"CONFIRM" | "DISPUTE" | null>(null);
  const [judgmentNote, setJudgmentNote] = useState("");
  const [judgmentSubmitting, setJudgmentSubmitting] = useState(false);
  const [judgmentDone, setJudgmentDone] = useState(false);

  async function runSearch() {
    if (!searchTerm.trim()) return;
    setSearching(true);
    setSearchResults([]);
    setSelected(null);
    try {
      const res = await fetch("/api/dashboard/customer/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs: [searchTerm.trim()] }),
      });
      const data = await res.json();
      setSearchResults((data.results ?? []) as SearchResult[]);
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  }

  async function submitJudgment() {
    if (!selected || !judgment || !judgmentNote.trim()) return;
    setJudgmentSubmitting(true);
    try {
      await consultantApi.submitInteractionReport({
        type: judgment,
        interactionId: selected.id,
        description: judgmentNote.trim(),
      });
      setJudgmentDone(true);
      await refetchReports();
    } catch {
      // leave form open so they can retry
    }
    setJudgmentSubmitting(false);
  }

  return (
    <DashboardShell
      heading="Interaction Reports"
      subheading="Report clinical observations, log what clients tell you during consultations, and confirm or dispute existing interaction entries."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Report a new interaction */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical size={15} className="text-white/50" />
            <h3 className="text-[14px] font-semibold text-white">
              Report an Interaction
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <input
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              placeholder="Medication name"
              className={inputCls}
            />
            <input
              value={herbName}
              onChange={(e) => setHerbName(e.target.value)}
              placeholder="Herb or supplement name"
              className={inputCls}
            />
          </div>

          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className={`${inputCls} mb-3 bg-gray-800 text-white`}
          >
            {SEVERITY_OPTIONS.map((o) => (
              <option
                key={o.value}
                value={o.value}
                className="bg-gray-800 text-white"
              >
                {o.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2.5 text-[12px] text-white/60 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={fromConsultation}
              onChange={(e) => setFromConsultation(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/6 accent-(--green-mid)"
            />
            <Users size={13} className="text-white/40" />A client told me about
            this during a consultation
          </label>

          {fromConsultation && (
            <select
              value={consultationId}
              onChange={(e) => setConsultationId(e.target.value)}
              className={`${inputCls} mb-3`}
            >
              <option value="">Which session? (optional)</option>
              {completedConsultations.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clientName} —{" "}
                  {c.scheduledAt
                    ? new Date(c.scheduledAt).toLocaleDateString("en-NG")
                    : "undated"}
                </option>
              ))}
            </select>
          )}

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              fromConsultation
                ? "Describe what the client reported (required)"
                : "Describe the interaction and your clinical basis for flagging it (required)"
            }
            rows={3}
            className={`${inputCls} h-auto py-2.5 resize-none mb-3`}
          />
          <textarea
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="Observed outcome, if any (optional)"
            rows={2}
            className={`${inputCls} h-auto py-2.5 resize-none mb-3`}
          />

          {submitError && (
            <p className="text-[12px] text-red-400 mb-3">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="text-[12px] text-emerald-400 mb-3 flex items-center gap-1.5">
              <CheckCircle2 size={13} /> {submitSuccess}
            </p>
          )}

          <button
            onClick={submitReport}
            disabled={
              !drugName.trim() ||
              !herbName.trim() ||
              !description.trim() ||
              submitting
            }
            className="w-full h-10 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-40 text-white text-[13px] font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Stethoscope size={14} />
            )}
            {submitting ? "Submitting…" : "Submit Report"}
          </button>
        </div>

        {/* Confirm / dispute an existing interaction */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Search size={15} className="text-white/50" />
            <h3 className="text-[14px] font-semibold text-white">
              Confirm or Dispute an Existing Entry
            </h3>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search by medication name…"
              className={inputCls}
            />
            <button
              onClick={runSearch}
              disabled={!searchTerm.trim() || searching}
              className="h-10 px-4 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white text-[13px] rounded-xl transition-colors shrink-0"
            >
              {searching ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>

          {searchResults.length > 0 && !selected && (
            <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
              {searchResults.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white/4 hover:bg-white/8 transition-colors"
                >
                  <p className="text-[12px] text-white">
                    {r.herbName}{" "}
                    <span className="text-white/35">× {r.drugName}</span>
                  </p>
                  <p className="text-[10px] text-white/35">{r.severity}</p>
                </button>
              ))}
            </div>
          )}

          {selected && !judgmentDone && (
            <div className="space-y-3">
              <div className="px-3 py-2 rounded-lg bg-white/4">
                <p className="text-[12px] text-white">
                  {selected.herbName}{" "}
                  <span className="text-white/35">× {selected.drugName}</span>{" "}
                  <span className="text-white/35">({selected.severity})</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setJudgment("CONFIRM")}
                  className={`flex-1 h-9 rounded-lg text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5 ${judgment === "CONFIRM" ? "bg-emerald-600 text-white" : "bg-white/6 text-white/60 hover:text-white"}`}
                >
                  <ThumbsUp size={13} /> Confirm
                </button>
                <button
                  onClick={() => setJudgment("DISPUTE")}
                  className={`flex-1 h-9 rounded-lg text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5 ${judgment === "DISPUTE" ? "bg-red-600 text-white" : "bg-white/6 text-white/60 hover:text-white"}`}
                >
                  <ThumbsDown size={13} /> Dispute
                </button>
              </div>
              {judgment && (
                <>
                  <textarea
                    value={judgmentNote}
                    onChange={(e) => setJudgmentNote(e.target.value)}
                    placeholder="Your clinical note (required)"
                    rows={2}
                    className={`${inputCls} h-auto py-2.5 resize-none`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitJudgment}
                      disabled={!judgmentNote.trim() || judgmentSubmitting}
                      className="h-9 px-4 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-40 text-white text-[12px] font-medium rounded-lg transition-colors"
                    >
                      {judgmentSubmitting ? "Submitting…" : "Submit"}
                    </button>
                    <button
                      onClick={() => {
                        setSelected(null);
                        setJudgment(null);
                        setJudgmentNote("");
                      }}
                      className="h-9 px-4 text-white/40 hover:text-white text-[12px] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {judgmentDone && (
            <p className="text-[12px] text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={13} /> Thanks — your feedback was recorded.
            </p>
          )}
        </div>
      </div>

      {/* Your submitted reports */}
      <div>
        <h3 className="text-[14px] font-semibold text-white mb-3">
          Your Submitted Reports
        </h3>
        {reportsLoading && !reportsData ? (
          <div className="p-6 text-center text-white/40 text-[13px]">
            <Loader2 size={16} className="animate-spin inline-block mr-2" />
            Loading…
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-white/8 bg-white/3">
            <p className="text-[13px] text-white/40">
              You haven&apos;t submitted any reports yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start justify-between gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-white">
                    <span className="font-medium">
                      {r.herbName ?? r.interaction?.herbName}
                    </span>{" "}
                    <span className="text-white/35">
                      × {r.drugName ?? r.interaction?.drugName}
                    </span>
                    <span className="text-[10px] text-white/30 ml-2 uppercase tracking-wider">
                      {r.type}
                    </span>
                  </p>
                  <p className="text-[12px] text-white/45 mt-1 line-clamp-2">
                    {r.description}
                  </p>
                  {r.consultationId && (
                    <p className="text-[11px] text-white/30 mt-1 flex items-center gap-1">
                      <Users size={11} /> From a consultation
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {r.promotedToDb ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
                      Added to database
                    </span>
                  ) : r.verified ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
                      Reviewed
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 flex items-center gap-1">
                      <Clock size={10} /> Pending review
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <p className="flex items-start gap-2 text-[11px] text-white/25 mt-6 leading-relaxed">
        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
        Reports are reviewed by pharmacists before being added to the curated
        database. Nothing about a specific client is stored beyond an optional
        link to the consultation itself.
      </p>
    </DashboardShell>
  );
}
