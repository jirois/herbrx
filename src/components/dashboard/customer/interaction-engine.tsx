"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { customerApi } from "@/hooks/dashboard-hooks";
import { cn } from "@/lib/utils";
import {
  Pill,
  Leaf,
  Plus,
  X,
  Search,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Stethoscope,
  FlaskConical,
  MessageSquarePlus,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface InteractionResult {
  id: string;
  drugName: string;
  herbName: string;
  herbScientific: string | null;
  herbAliases: string[];
  herbLocalNames: string[];
  severity: "CONTRAINDICATED" | "DANGER" | "WARNING" | "INFO" | "BENEFICIAL";
  mechanism: string | null;
  mechanismTypes: string[];
  affectedPathways: string[];
  effect: string;
  advice: string;
  evidenceLevel?: "STRONG" | "MODERATE" | "PRELIMINARY" | "ANECDOTAL";
  herbDosageThresholdMg?: number | null;
  drugDosageThresholdMg?: number | null;
  formulationContext: string[];
  rxCui?: string | null;
  source?: string;
}

const COMMON_MEDS = [
  "Warfarin",
  "Metformin",
  "Sertraline",
  "Amlodipine",
  "Lisinopril",
  "Atorvastatin",
  "Omeprazole",
  "Amoxicillin",
];

const COMMON_HERBS = [
  "Ginkgo Biloba",
  "Garlic",
  "Ginger",
  "Turmeric",
  "St. John's Wort",
  "Ginseng",
];

const severityConfig = {
  CONTRAINDICATED: {
    color: "border-red-500/50 bg-red-950/30",
    badge: "bg-red-950/60 text-red-300 border border-red-500/40",
    icon: AlertCircle,
    iconColor: "text-red-300",
    label: "Do Not Combine",
  },
  DANGER: {
    color: "border-red-500/30 bg-red-500/8",
    badge: "bg-red-500/15 text-red-400",
    icon: AlertCircle,
    iconColor: "text-red-400",
    label: "High Risk",
  },
  WARNING: {
    color: "border-amber-500/30 bg-amber-500/8",
    badge: "bg-amber-500/15 text-amber-400",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    label: "Caution",
  },
  INFO: {
    color: "border-blue-500/30 bg-blue-500/8",
    badge: "bg-blue-500/15 text-blue-400",
    icon: Info,
    iconColor: "text-blue-400",
    label: "Note",
  },
  BENEFICIAL: {
    color: "border-green-500/30 bg-green-500/8",
    badge: "bg-green-500/15 text-green-400",
    icon: CheckCircle,
    iconColor: "text-emerald-500",
    label: "Beneficial",
  },
};

const evidenceLabel: Record<string, string> = {
  STRONG: "Strong evidence (human trials)",
  MODERATE: "Moderate evidence",
  PRELIMINARY: "Preliminary evidence",
  ANECDOTAL: "Anecdotal reports only",
};

export function InteractionEngine() {
  const [medications, setMedications] = useState<string[]>([]);
  const [herbs, setHerbs] = useState<string[]>([]);
  const [medInput, setMedInput] = useState("");
  const [herbInput, setHerbInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<InteractionResult[]>([]);
  const [missingDrugs, setMissingDrugs] = useState<string[]>([]);
  const [missingHerbs, setMissingHerbs] = useState<string[]>([]);
  const [fuzzyCorrections, setFuzzyCorrections] = useState<
    { input: string; matchedAs: string; type: "drug" | "herb" }[]
  >([]);

  // Reporting a possible interaction that isn't in the database yet
  const [reportOpen, setReportOpen] = useState(false);
  const [reportDrug, setReportDrug] = useState("");
  const [reportHerb, setReportHerb] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportOutcome, setReportOutcome] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  // Confirm/dispute feedback on an existing curated result
  const [feedbackOpenId, setFeedbackOpenId] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<
    "CONFIRM" | "DISPUTE" | null
  >(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackDoneIds, setFeedbackDoneIds] = useState<Set<string>>(
    new Set(),
  );

  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(
    () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  );

  function addMed(name: string) {
    const clean = name.trim();
    if (
      !clean ||
      medications.some((m) => m.toLowerCase() === clean.toLowerCase())
    )
      return;
    setMedications((prev) => [...prev, clean]);
    setMedInput("");
    setChecked(false);
  }

  function removeMed(med: string) {
    setMedications((prev) => prev.filter((m) => m !== med));
    setChecked(false);
  }

  function addHerb(name: string) {
    const clean = name.trim();
    if (!clean || herbs.some((h) => h.toLowerCase() === clean.toLowerCase()))
      return;
    setHerbs((prev) => [...prev, clean]);
    setHerbInput("");
    setChecked(false);
  }

  function removeHerb(herb: string) {
    setHerbs((prev) => prev.filter((h) => h !== herb));
    setChecked(false);
  }

  async function runCheck() {
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/customer/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs: medications, herbs, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Interaction check failed");

      const sorted: InteractionResult[] = (
        data.results as InteractionResult[]
      ).slice();
      const order = {
        CONTRAINDICATED: 0,
        DANGER: 1,
        WARNING: 2,
        INFO: 3,
        BENEFICIAL: 4,
      };
      sorted.sort((a, b) => order[a.severity] - order[b.severity]);

      setResults(sorted);
      setMissingDrugs(data.missingDrugs ?? []);
      setMissingHerbs(data.missingHerbs ?? []);
      setFuzzyCorrections(data.fuzzyCorrections ?? []);
      setChecked(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Couldn't run the interaction check. Please try again.",
      );
    }
    setChecking(false);
  }

  async function submitReport() {
    if (!reportDrug.trim() || !reportHerb.trim() || !reportDescription.trim())
      return;
    setReportSubmitting(true);
    setReportError(null);
    try {
      const res = (await customerApi.submitInteractionFeedback({
        type: "REPORT",
        drugName: reportDrug.trim(),
        herbName: reportHerb.trim(),
        description: reportDescription.trim(),
        outcome: reportOutcome.trim() || undefined,
      })) as { message?: string };
      setReportMessage(
        res.message ?? "Report submitted. Our pharmacists will review it.",
      );
      setReportDescription("");
      setReportOutcome("");
    } catch (e) {
      setReportError(
        e instanceof Error
          ? e.message
          : "Couldn't submit your report. Please try again.",
      );
    }
    setReportSubmitting(false);
  }

  async function submitResultFeedback(interactionId: string) {
    if (!feedbackType || !feedbackNote.trim()) return;
    setFeedbackSubmitting(true);
    try {
      await customerApi.submitInteractionFeedback({
        type: feedbackType,
        interactionId,
        description: feedbackNote.trim(),
      });
      setFeedbackDoneIds((prev) => new Set(prev).add(interactionId));
      setFeedbackOpenId(null);
      setFeedbackType(null);
      setFeedbackNote("");
    } catch {
      // Non-critical — leave the form open so they can retry
    }
    setFeedbackSubmitting(false);
  }

  const hasDanger = results.some(
    (r) => r.severity === "DANGER" || r.severity === "CONTRAINDICATED",
  );

  return (
    <DashboardShell
      heading="Herb × Drug Interaction Engine"
      subheading="Check your prescription medications against herbal products for known interactions."
    >
      <div className="max-w-2xl">
        {/* Input area */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-6 mb-6">
          <label className="block text-[13px] font-medium text-white/70 mb-3">
            Your Current Medications
          </label>

          {medications.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {medications.map((med) => (
                <span
                  key={med}
                  className="inline-flex items-center gap-1.5 bg-(--green-mid)/20 border border-(--green-mid)/30 text-(--green-pale) text-[13px] px-3 py-1.5 rounded-full"
                >
                  <Pill size={12} /> {med}
                  <button
                    onClick={() => removeMed(med)}
                    className="text-white/40 hover:text-white ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                value={medInput}
                onChange={(e) => setMedInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMed(medInput)}
                placeholder="Type medication name and press Enter…"
                className="w-full h-10 pl-9 pr-4 bg-white/6 border border-white/10 rounded-xl text-[14px] text-white placeholder:text-white/30 outline-none focus:border-(--green-mid) transition-colors"
              />
            </div>
            <button
              onClick={() => addMed(medInput)}
              className="h-10 px-4 bg-(--green-mid) hover:bg-(--green-light) text-white rounded-xl text-[13px] font-medium transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="mt-3">
            <p className="text-[11px] text-white/30 mb-2 uppercase tracking-wider">
              Common medications
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_MEDS.filter(
                (m) =>
                  !medications.some(
                    (med) => med.toLowerCase() === m.toLowerCase(),
                  ),
              ).map((med) => (
                <button
                  key={med}
                  onClick={() => addMed(med)}
                  className="text-[12px] text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/[0.07] px-2.5 py-1 rounded-lg transition-all"
                >
                  {med}
                </button>
              ))}
            </div>
          </div>

          {/* Herbs section — full regimen scanning, not just "what interacts
              with my drugs" but "does THIS specific herb interact". */}
          <div className="border-t border-white/[0.07] mt-6 pt-6">
            <label className="block text-[13px] font-medium text-white/70 mb-3">
              Herbs or Supplements You&apos;re Taking or Considering{" "}
              <span className="text-white/35 font-normal">(optional)</span>
            </label>

            {herbs.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {herbs.map((herb) => (
                  <span
                    key={herb}
                    className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-[13px] px-3 py-1.5 rounded-full"
                  >
                    <Leaf size={12} /> {herb}
                    <button
                      onClick={() => removeHerb(herb)}
                      className="text-white/40 hover:text-white ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  value={herbInput}
                  onChange={(e) => setHerbInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addHerb(herbInput)}
                  placeholder="Type herb name and press Enter…"
                  className="w-full h-10 pl-9 pr-4 bg-white/6 border border-white/10 rounded-xl text-[14px] text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <button
                onClick={() => addHerb(herbInput)}
                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[13px] font-medium transition-colors flex items-center gap-1.5"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="mt-3">
              <p className="text-[11px] text-white/30 mb-2 uppercase tracking-wider">
                Common herbs
              </p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_HERBS.filter(
                  (h) =>
                    !herbs.some(
                      (herb) => herb.toLowerCase() === h.toLowerCase(),
                    ),
                ).map((herb) => (
                  <button
                    key={herb}
                    onClick={() => addHerb(herb)}
                    className="text-[12px] text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/[0.07] px-2.5 py-1 rounded-lg transition-all"
                  >
                    {herb}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-white/30 mt-3">
              Leave this empty to see every known herb interaction for your
              medications — or add specific herbs to check just those.
            </p>
          </div>

          <button
            onClick={runCheck}
            disabled={medications.length === 0 || checking}
            className="mt-6 w-full h-11 bg-(--green-deep) hover:bg-(--green-mid) disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-[14px] flex items-center justify-center gap-2"
          >
            {checking ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Checking…
              </>
            ) : (
              <>
                <Pill size={16} /> Check for Interactions
              </>
            )}
          </button>
          {error && (
            <p className="text-[12px] text-red-400 mt-3 text-center">{error}</p>
          )}
        </div>

        {/* Results */}
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {results.length === 0 ? (
                <div className="flex items-center gap-3 p-5 rounded-2xl bg-green-500/10 border border-green-500/20">
                  <CheckCircle size={22} className="text-green-400 shrink-0" />
                  <div>
                    <p className="text-[15px] font-semibold text-white">
                      No known interactions found
                    </p>
                    <p className="text-[13px] text-white/50 mt-0.5">
                      {herbs.length > 0
                        ? "None of the herbs you listed have flagged interactions with your medications in our database."
                        : "Your listed medications have no flagged interactions with common herbal products in our database."}{" "}
                      Always consult your pharmacist.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {fuzzyCorrections.length > 0 && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/4 border border-white/8 mb-4">
                      <Search
                        size={14}
                        className="text-white/35 shrink-0 mt-0.5"
                      />
                      <p className="text-[12px] text-white/45 leading-relaxed">
                        {fuzzyCorrections.map((c, idx) => (
                          <span key={c.input}>
                            Showing results for{" "}
                            <span className="text-white/70 font-medium">
                              {c.matchedAs}
                            </span>{" "}
                            (you typed &quot;{c.input}&quot;)
                            {idx < fuzzyCorrections.length - 1 ? "; " : "."}
                          </span>
                        ))}
                      </p>
                    </div>
                  )}
                  <div
                    className={`flex items-center gap-3 p-4 rounded-2xl mb-4 ${hasDanger ? "bg-red-500/10 border border-red-500/25" : "bg-amber-500/10 border border-amber-500/25"}`}
                  >
                    <AlertTriangle
                      size={20}
                      className={hasDanger ? "text-red-400" : "text-amber-400"}
                    />
                    <div>
                      <p className="text-[14px] font-semibold text-white">
                        {results.length} interaction
                        {results.length > 1 ? "s" : ""} found —{" "}
                        {hasDanger
                          ? "including high-risk combinations"
                          : "proceed with caution"}
                      </p>
                      <p className="text-[12px] text-white/50 mt-0.5">
                        Review the details below and discuss with your
                        pharmacist or doctor.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {results.map((result, i) => {
                      const cfg = severityConfig[result.severity];
                      const showMechanism =
                        result.mechanism && result.mechanism !== result.effect;
                      return (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className={`p-5 rounded-2xl border ${cfg.color}`}
                        >
                          <div className="flex items-start gap-3">
                            <cfg.icon
                              size={20}
                              className={cn("shrink-0 mt-0.5", cfg.iconColor)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="text-[15px] font-semibold text-white">
                                  {result.herbName}
                                </h3>
                                <span
                                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}
                                >
                                  {cfg.label}
                                </span>
                              </div>
                              <p className="text-[11px] text-white/35 mb-2">
                                {result.herbScientific && (
                                  <em>{result.herbScientific}</em>
                                )}
                                {result.herbLocalNames.length > 0 && (
                                  <> · {result.herbLocalNames.join(", ")}</>
                                )}
                              </p>
                              <p className="text-[12px] text-white/45 mb-2 flex items-center gap-1.5">
                                <Pill size={11} className="shrink-0" />
                                Interacts with your{" "}
                                <span className="text-white/65 font-medium capitalize">
                                  {result.drugName}
                                </span>
                              </p>
                              <p className="text-[13px] text-white/70 leading-relaxed mb-2">
                                {result.effect}
                              </p>
                              {showMechanism && (
                                <p className="flex items-start gap-2 text-[12px] text-white/40 mb-2">
                                  <FlaskConical
                                    size={12}
                                    className="shrink-0 mt-0.5"
                                  />
                                  <span>{result.mechanism}</span>
                                </p>
                              )}
                              {(result.mechanismTypes.length > 0 ||
                                result.affectedPathways.length > 0) && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {result.mechanismTypes.map((m) => (
                                    <span
                                      key={m}
                                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/6 text-white/45"
                                    >
                                      {m.replace(/_/g, " ")}
                                    </span>
                                  ))}
                                  {result.affectedPathways.map((p) => (
                                    <span
                                      key={p}
                                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/4 text-white/35 border border-white/8"
                                    >
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-start gap-2 text-[12px] text-white/50 mb-2">
                                <Info size={13} className="shrink-0 mt-0.5" />
                                <span>{result.advice}</span>
                              </div>
                              {(result.herbDosageThresholdMg != null ||
                                result.formulationContext.length > 0) && (
                                <p className="text-[11px] text-white/30 mb-1.5">
                                  {result.herbDosageThresholdMg != null && (
                                    <>
                                      Documented at herb doses ≥{" "}
                                      {result.herbDosageThresholdMg}mg/day
                                      {result.drugDosageThresholdMg != null &&
                                        ` with drug doses ≥ ${result.drugDosageThresholdMg}mg/day`}
                                      .{" "}
                                    </>
                                  )}
                                  {result.formulationContext.length > 0 && (
                                    <>
                                      Common forms:{" "}
                                      {result.formulationContext.join(", ")}.
                                    </>
                                  )}
                                </p>
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                {result.evidenceLevel && (
                                  <p className="text-[10px] text-white/25 uppercase tracking-wider">
                                    {evidenceLabel[result.evidenceLevel] ??
                                      result.evidenceLevel}
                                  </p>
                                )}
                                {result.rxCui && (
                                  <p className="text-[10px] text-white/20">
                                    RxNorm {result.rxCui}
                                  </p>
                                )}
                              </div>

                              {/* Confirm / dispute feedback loop */}
                              <div className="mt-3 pt-3 border-t border-white/6">
                                {feedbackDoneIds.has(result.id) ? (
                                  <p className="text-[11px] text-white/35">
                                    Thanks — your feedback was recorded.
                                  </p>
                                ) : feedbackOpenId === result.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={feedbackNote}
                                      onChange={(e) =>
                                        setFeedbackNote(e.target.value)
                                      }
                                      placeholder={
                                        feedbackType === "CONFIRM"
                                          ? "What happened when you experienced this? (required)"
                                          : "What seems off about this? (required)"
                                      }
                                      rows={2}
                                      className="w-full px-3 py-2 bg-white/6 border border-white/10 rounded-lg text-[12px] text-white placeholder:text-white/25 outline-none focus:border-(--green-mid) resize-none"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          submitResultFeedback(result.id)
                                        }
                                        disabled={
                                          !feedbackNote.trim() ||
                                          feedbackSubmitting
                                        }
                                        className="h-8 px-3 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white text-[11px] font-medium rounded-lg transition-colors"
                                      >
                                        {feedbackSubmitting
                                          ? "Submitting…"
                                          : "Submit"}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setFeedbackOpenId(null);
                                          setFeedbackType(null);
                                          setFeedbackNote("");
                                        }}
                                        className="h-8 px-3 text-white/40 hover:text-white text-[11px] transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-4">
                                    <span className="text-[11px] text-white/30">
                                      Have you experienced this?
                                    </span>
                                    <button
                                      onClick={() => {
                                        setFeedbackOpenId(result.id);
                                        setFeedbackType("CONFIRM");
                                      }}
                                      className="flex items-center gap-1 text-[11px] text-white/45 hover:text-emerald-400 transition-colors"
                                    >
                                      <ThumbsUp size={12} /> Confirm
                                    </button>
                                    <button
                                      onClick={() => {
                                        setFeedbackOpenId(result.id);
                                        setFeedbackType("DISPUTE");
                                      }}
                                      className="flex items-center gap-1 text-[11px] text-white/45 hover:text-red-400 transition-colors"
                                    >
                                      <ThumbsDown size={12} /> Dispute
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <p className="flex items-start gap-2 text-[12px] text-white/30 mt-4 leading-relaxed">
                    <Stethoscope size={13} className="shrink-0 mt-0.5" />
                    <span>
                      This tool is for informational purposes only and does not
                      replace professional medical advice. Always consult a
                      qualified pharmacist or physician before starting,
                      stopping, or changing any medication or supplement.
                    </span>
                  </p>
                </>
              )}
              {missingDrugs.length > 0 && (
                <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-white/4 border border-white/8 mt-4">
                  <Info size={14} className="text-white/40 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-white/45 leading-relaxed">
                    <span className="text-white/60 font-medium">
                      {missingDrugs.join(", ")}
                    </span>{" "}
                    {missingDrugs.length === 1 ? "isn't" : "aren't"} yet in our
                    curated interaction database — this doesn&apos;t mean
                    it&apos;s safe, just that we don&apos;t have data on it.
                    Always check with your pharmacist.
                  </p>
                </div>
              )}
              {missingHerbs.length > 0 && (
                <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-white/4 border border-white/8 mt-3">
                  <Leaf size={14} className="text-white/40 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-white/45 leading-relaxed">
                    <span className="text-white/60 font-medium">
                      {missingHerbs.join(", ")}
                    </span>{" "}
                    {missingHerbs.length === 1 ? "isn't" : "aren't"} yet in our
                    curated database for your listed medications.
                  </p>
                </div>
              )}

              {/* Reporting a suspected interaction that isn't curated yet —
                  the backend for this already existed (REPORT feedback
                  type, reviewed by pharmacists), it just had no visible
                  entry point anywhere in the customer dashboard. */}
              {(missingDrugs.length > 0 || missingHerbs.length > 0) && (
                <div className="mt-3 p-4 rounded-2xl border border-white/8 bg-white/2">
                  {reportMessage ? (
                    <p className="text-[13px] text-emerald-400 flex items-center gap-2">
                      <CheckCircle size={15} /> {reportMessage}
                    </p>
                  ) : reportOpen ? (
                    <div className="space-y-3">
                      <p className="text-[13px] font-medium text-white/70">
                        Report a possible interaction
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          value={reportDrug}
                          onChange={(e) => setReportDrug(e.target.value)}
                          placeholder="Medication name"
                          className="h-9 px-3 bg-white/6 border border-white/10 rounded-lg text-[13px] text-white placeholder:text-white/25 outline-none focus:border-(--green-mid)"
                        />
                        <input
                          value={reportHerb}
                          onChange={(e) => setReportHerb(e.target.value)}
                          placeholder="Herb or supplement name"
                          className="h-9 px-3 bg-white/6 border border-white/10 rounded-lg text-[13px] text-white placeholder:text-white/25 outline-none focus:border-(--green-mid)"
                        />
                      </div>
                      <textarea
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder="What makes you think these might interact? (required)"
                        rows={2}
                        className="w-full px-3 py-2 bg-white/6 border border-white/10 rounded-lg text-[13px] text-white placeholder:text-white/25 outline-none focus:border-(--green-mid) resize-none"
                      />
                      <input
                        value={reportOutcome}
                        onChange={(e) => setReportOutcome(e.target.value)}
                        placeholder="What happened, if anything? (optional)"
                        className="w-full h-9 px-3 bg-white/6 border border-white/10 rounded-lg text-[13px] text-white placeholder:text-white/25 outline-none focus:border-(--green-mid)"
                      />
                      {reportError && (
                        <p className="text-[12px] text-red-400">
                          {reportError}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={submitReport}
                          disabled={
                            !reportDrug.trim() ||
                            !reportHerb.trim() ||
                            !reportDescription.trim() ||
                            reportSubmitting
                          }
                          className="h-9 px-4 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-40 text-white text-[13px] font-medium rounded-lg transition-colors"
                        >
                          {reportSubmitting ? "Submitting…" : "Submit Report"}
                        </button>
                        <button
                          onClick={() => setReportOpen(false)}
                          className="h-9 px-4 text-white/40 hover:text-white text-[13px] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                      <p className="text-[11px] text-white/25">
                        Pharmacists review reports within 5 business days. This
                        isn&apos;t a substitute for urgent medical advice.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReportOpen(true);
                        setReportDrug(missingDrugs[0] ?? medications[0] ?? "");
                        setReportHerb(missingHerbs[0] ?? herbs[0] ?? "");
                      }}
                      className="flex items-center gap-2 text-[13px] text-white/60 hover:text-white transition-colors"
                    >
                      <MessageSquarePlus size={15} />
                      Think two of these interact? Report it for pharmacist
                      review
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
