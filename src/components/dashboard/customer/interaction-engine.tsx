"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  Pill,
  Plus,
  X,
  Search,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

// Static interaction data — wire to a real database/API
const INTERACTIONS: Record<
  string,
  {
    herb: string;
    severity: "DANGER" | "WARNING" | "INFO";
    effect: string;
    advice: string;
  }[]
> = {
  warfarin: [
    {
      herb: "St. John's Wort",
      severity: "DANGER",
      effect:
        "Significantly reduces warfarin efficacy, increasing clotting risk.",
      advice: "Avoid concurrent use. Consult your physician immediately.",
    },
    {
      herb: "Garlic Extract",
      severity: "WARNING",
      effect: "May enhance anticoagulant effects, increasing bleeding risk.",
      advice: "Monitor INR closely. Limit garlic supplement dosage.",
    },
    {
      herb: "Ginger",
      severity: "WARNING",
      effect: "May potentiate antiplatelet activity.",
      advice: "Use with caution. Discuss with your doctor.",
    },
  ],
  metformin: [
    {
      herb: "Bitter Leaf (Vernonia amygdalina)",
      severity: "WARNING",
      effect:
        "May cause additive hypoglycaemic effect, risking blood sugar crash.",
      advice: "Monitor blood glucose closely if using both.",
    },
    {
      herb: "Moringa",
      severity: "INFO",
      effect: "Some evidence of mild glucose-lowering properties.",
      advice: "Inform your doctor. Monitor blood sugar levels.",
    },
  ],
  sertraline: [
    {
      herb: "St. John's Wort",
      severity: "DANGER",
      effect:
        "Risk of serotonin syndrome — a potentially life-threatening condition.",
      advice:
        "Do NOT combine. Stop St. John's Wort and consult your doctor immediately.",
    },
    {
      herb: "Valerian Root",
      severity: "WARNING",
      effect: "May increase sedation and CNS depression.",
      advice: "Avoid combining without medical supervision.",
    },
  ],
  amlodipine: [
    {
      herb: "Grapefruit",
      severity: "WARNING",
      effect: "Increases drug plasma levels, risking toxicity.",
      advice: "Avoid grapefruit products while on amlodipine.",
    },
    {
      herb: "Hawthorn (Crataegus)",
      severity: "WARNING",
      effect: "May have additive antihypertensive effects.",
      advice: "Monitor blood pressure regularly.",
    },
  ],
};

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

const severityConfig = {
  DANGER: {
    color: "border-red-500/30 bg-red-500/8",
    badge: "bg-red-500/15 text-red-400",
    icon: "🚨",
    label: "High Risk",
  },
  WARNING: {
    color: "border-amber-500/30 bg-amber-500/8",
    badge: "bg-amber-500/15 text-amber-400",
    icon: "⚠️",
    label: "Caution",
  },
  INFO: {
    color: "border-blue-500/30 bg-blue-500/8",
    badge: "bg-blue-500/15 text-blue-400",
    icon: "ℹ️",
    label: "Note",
  },
};

export function InteractionEngine() {
  const [medications, setMedications] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<(typeof INTERACTIONS)[string]>([]);

  function addMed(name: string) {
    const clean = name.trim();
    if (!clean || medications.includes(clean.toLowerCase())) return;
    setMedications((prev) => [...prev, clean]);
    setInput("");
    setChecked(false);
  }

  function removeMed(med: string) {
    setMedications((prev) => prev.filter((m) => m !== med));
    setChecked(false);
  }

  function runCheck() {
    const found: (typeof INTERACTIONS)[string] = [];
    medications.forEach((med) => {
      const key = med.toLowerCase();
      const hits = INTERACTIONS[key];
      if (hits) found.push(...hits);
    });
    // Deduplicate by herb name
    const unique = found.filter(
      (v, i, arr) => arr.findIndex((x) => x.herb === v.herb) === i,
    );
    // Sort: DANGER → WARNING → INFO
    const order = { DANGER: 0, WARNING: 1, INFO: 2 };
    setResults(unique.sort((a, b) => order[a.severity] - order[b.severity]));
    setChecked(true);
  }

  const hasDanger = results.some((r) => r.severity === "DANGER");
  const hasWarning = results.some((r) => r.severity === "WARNING");

  return (
    <DashboardShell
      heading="Herb × Drug Interaction Engine"
      subheading="Enter your prescription medications to check for dangerous interactions with herbal products."
    >
      <div className="max-w-2xl">
        {/* Input area */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-6 mb-6">
          <label className="block text-[13px] font-medium text-white/70 mb-3">
            Your Current Medications
          </label>

          {/* Medication chips */}
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

          {/* Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMed(input)}
                placeholder="Type medication name and press Enter…"
                className="w-full h-10 pl-9 pr-4 bg-white/6 border border-white/10 rounded-xl text-[14px] text-white placeholder:text-white/30 outline-none focus:border-(--green-mid) transition-colors"
              />
            </div>
            <button
              onClick={() => addMed(input)}
              className="h-10 px-4 bg-(--green-mid) hover:bg-(--green-light) text-white rounded-xl text-[13px] font-medium transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {/* Common suggestions */}
          <div className="mt-3">
            <p className="text-[11px] text-white/30 mb-2 uppercase tracking-wider">
              Common medications
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_MEDS.filter(
                (m) => !medications.includes(m.toLowerCase()),
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

          <button
            onClick={runCheck}
            disabled={medications.length === 0}
            className="mt-5 w-full h-11 bg-(--green-deep) hover:bg-(--green-mid) disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-[14px] flex items-center justify-center gap-2"
          >
            <Pill size={16} /> Check for Interactions
          </button>
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
                      Your listed medications have no flagged interactions with
                      common herbal products in our database. Always consult
                      your pharmacist.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Summary banner */}
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
                      return (
                        <motion.div
                          key={result.herb}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className={`p-5 rounded-2xl border ${cfg.color}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-[20px] shrink-0 mt-0.5">
                              {cfg.icon}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="text-[15px] font-semibold text-white">
                                  {result.herb}
                                </h3>
                                <span
                                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}
                                >
                                  {cfg.label}
                                </span>
                              </div>
                              <p className="text-[13px] text-white/70 leading-relaxed mb-2">
                                {result.effect}
                              </p>
                              <div className="flex items-start gap-2 text-[12px] text-white/50">
                                <Info size={13} className="shrink-0 mt-0.5" />
                                <span>{result.advice}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <p className="text-[12px] text-white/30 mt-4 leading-relaxed">
                    ⚕️ This tool is for informational purposes only and does not
                    replace professional medical advice. Always consult a
                    qualified pharmacist or physician before starting, stopping,
                    or changing any medication or supplement.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
