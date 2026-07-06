"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useIncubation, incubationApi } from "@/hooks/dashboard-hooks";
import {
  FlaskConical,
  Shield,
  Palette,
  FileCheck,
  Rocket,
  CheckCircle,
  Clock,
  Lock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  FileText,
  Star,
  Sparkles,
  Info,
  Package,
} from "lucide-react";

// ── Types ─────
type Phase = "INTAKE" | "PRECLINICAL" | "BRANDING" | "NAFDAC" | "LAUNCH";
type PhaseStatus = "COMPLETED" | "ACTIVE" | "UPCOMING" | "LOCKED";

interface SubmissionPhase {
  phase: Phase;
  enteredAt: string;
  completedAt?: string;
  notes?: string;
}

interface PhaseConfig {
  key: Phase;
  number: number;
  title: string;
  tagline: string;
  icon: React.ReactNode;
  color: string;
  accentBg: string;
  border: string;
  what: string;
  you: string[]; // what the product owner does
  herbrx: string[]; // what HerbRx does
  timeline: string;
  documents: string[];
}

const PHASES: PhaseConfig[] = [
  {
    key: "INTAKE",
    number: 1,
    title: "Formulation Intake & IP Agreement",
    tagline: "Secure your recipe. Sign the NDA. Establish ownership.",
    icon: <Shield size={22} />,
    color: "text-[var(--green-pale)]",
    accentBg: "bg-[var(--green-mid)]/20",
    border: "border-[var(--green-mid)]/40",
    what: "Your formula details are submitted securely through the Incubation Dashboard. A digital Non-Disclosure Agreement (NDA) and a fractional royalty contract protect your secret recipe while granting HerbRx the partnership rights needed to file on your behalf.",
    you: [
      "Submit your formula composition, dosage target, and origin story",
      "Sign the digital NDA (binding, legally enforceable)",
      "Agree to the royalty split (default 15% to HerbRx, 85% to you)",
    ],
    herbrx: [
      "Assigns a Compliance Advisor to your case within 2 business days",
      "Issues a digital IP receipt confirming your submission timestamp",
      "Opens a secure document vault for your product",
    ],
    timeline: "2–5 business days",
    documents: ["Digital NDA", "Royalty Contract", "IP Receipt"],
  },
  {
    key: "PRECLINICAL",
    number: 2,
    title: "Pre-Clinical Safety & Toxicity Screening",
    tagline: "Prove it's safe. Build the evidence base.",
    icon: <FlaskConical size={22} />,
    color: "text-blue-300",
    accentBg: "bg-blue-500/15",
    border: "border-blue-500/30",
    what: "Instead of jumping straight to full NAFDAC registration, HerbRx routes a sample batch to our network of partnering government or university laboratories for a Microbial & Heavy Metals Toxicity Assay. This establishes the basic human safety evidence that underpins everything downstream.",
    you: [
      "Provide a 200–500g sample batch of your current preparation",
      "Complete a standardised formula disclosure form",
      "Respond to any clarification requests from the lab within 5 days",
    ],
    herbrx: [
      "Coordinates with NAFDAC-recognised labs (NRL, NIPRD, or university partners)",
      "Covers upfront lab fee (recouped at cost from first revenue)",
      "Delivers a full COA: heavy metals, microbials, active compound ID",
      "Issues a Pass/Fail Safety Decision Report with recommendations",
    ],
    timeline: "3–6 weeks",
    documents: [
      "Sample Intake Form",
      "COA Lab Report",
      "Safety Decision Report",
    ],
  },
  {
    key: "BRANDING",
    number: 3,
    title: "Standardization & Branding",
    tagline: "From kitchen remedy to commercial product.",
    icon: <Palette size={22} />,
    color: "text-purple-300",
    accentBg: "bg-purple-500/15",
    border: "border-purple-500/30",
    what: "HerbRx expert consultants help transform the remedy into a commercial dosage form — for example, standardising a raw leaf extract into a defined 500mg capsule. Our design team then creates product packaging that meets NAFDAC's strict labelling regulations, while positioning the product to sell.",
    you: [
      "Review and approve the proposed commercial dosage form",
      "Provide any brand preferences, colour schemes, or name ideas",
      "Approve the final label and packaging design",
    ],
    herbrx: [
      "Pharmacist-led standardisation of extract concentration and dosage form",
      "Full NAFDAC-compliant label design (required text, warnings, claims)",
      "Product naming, positioning, and packaging design",
      "Revision rounds until you're satisfied",
    ],
    timeline: "3–5 weeks",
    documents: [
      "Dosage Standardisation Report",
      "NAFDAC-Compliant Label",
      "Brand Guide",
    ],
  },
  {
    key: "NAFDAC",
    number: 4,
    title: "NAFDAC Listing Under HerbRx Umbrella",
    tagline: "We file. You wait. Legally, it's real.",
    icon: <FileCheck size={22} />,
    color: "text-amber-300",
    accentBg: "bg-amber-500/15",
    border: "border-amber-500/30",
    what: "HerbRx leverages its existing corporate status — CAC registration, facility licence, and product liability insurance — to submit the product to NAFDAC for Listing Status under the local herbal remedy classification. NAFDAC typically processes these within 120 working days.",
    you: [
      "Provide any outstanding personal or business information NAFDAC requires",
      "Respond to any NAFDAC clarification queries forwarded by HerbRx",
      "Review the final NAFDAC application before submission",
    ],
    herbrx: [
      "Prepares the complete NAFDAC application dossier",
      "Submits under HerbRx corporate licence and facility registration",
      "Tracks application status and handles all NAFDAC correspondence",
      "Delivers the NAFDAC listing certificate to you directly",
    ],
    timeline: "120 working days (~6 months)",
    documents: ["NAFDAC Application Dossier", "NAFDAC Listing Certificate"],
  },
  {
    key: "LAUNCH",
    number: 5,
    title: "The HerbRx Exclusive Launch",
    tagline: "Verified. Branded. Launched. Earning.",
    icon: <Rocket size={22} />,
    color: "text-[var(--gold-light)]",
    accentBg: "bg-[var(--gold)]/15",
    border: "border-[var(--gold)]/40",
    what: 'The newly minted product launches exclusively on the HerbRx marketplace as an "HerbRx Co-Sign Product," instantly signalling trust to consumers. Revenue is split between HerbRx and you on every sale, tracked transparently in your dashboard.',
    you: [
      "Review and approve the product listing page",
      "Supply initial stock for fulfilment (or use HerbRx's fulfilment partner)",
      "Track sales and revenue in your Producer Dashboard in real time",
    ],
    herbrx: [
      "Full product listing: photos, safety review, COA badge, Co-Sign label",
      "Featured placement in launch week promotional campaigns",
      "SMS, WhatsApp, and email alerts sent to subscribed customers",
      "Monthly revenue statements with your royalty share",
    ],
    timeline: "Ongoing",
    documents: ["Launch Brief", "Revenue Share Agreement", "Product Listing"],
  },
];

const CATEGORIES = [
  "Herbal Supplement (Capsule / Tablet)",
  "Herbal Tonic / Syrup",
  "Herbal Tea / Infusion Blend",
  "Topical Cream / Balm / Oil",
  "Herbal Powder / Extract",
  "Traditional Food / Beverage",
  "Other",
];

const inputCls =
  "w-full h-11 px-4 bg-white/[0.06] border border-white/[0.1] rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[var(--green-mid)] transition-all";
const labelCls =
  "block text-[12px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider";

// ── Helpers ────────
function phaseStatus(currentPhase: Phase, phaseKey: Phase): PhaseStatus {
  const order: Phase[] = [
    "INTAKE",
    "PRECLINICAL",
    "BRANDING",
    "NAFDAC",
    "LAUNCH",
  ];
  const current = order.indexOf(currentPhase);
  const target = order.indexOf(phaseKey);
  if (target < current) return "COMPLETED";
  if (target === current) return "ACTIVE";
  if (target === current + 1) return "UPCOMING";
  return "LOCKED";
}

function statusIcon(s: PhaseStatus) {
  if (s === "COMPLETED")
    return <CheckCircle size={18} className="text-green-400" />;
  if (s === "ACTIVE")
    return (
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-4 h-4 rounded-full bg-(--green-pale) shadow-[0_0_8px_rgba(200,218,187,0.6)]" />
      </motion.div>
    );
  if (s === "UPCOMING") return <Clock size={16} className="text-white/40" />;
  return <Lock size={14} className="text-white/20" />;
}

// ── Intake Form ───────
function IntakeForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    productName: "",
    formulaCategory: "",
    description: "",
    targetDosage: "",
    currentForm: "",
    originStory: "",
    ndaSigned: false,
    royaltyAgreed: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function upd(patch: Partial<typeof form>) {
    setForm((p) => ({ ...p, ...patch }));
    setError("");
  }

  async function handleSubmit() {
    if (!form.ndaSigned || !form.royaltyAgreed) {
      setError("You must agree to both the NDA and royalty terms to proceed.");
      return;
    }
    setSubmitting(true);
    try {
      await incubationApi.submit({ ...form, royaltyRate: 0.15 });
      onSubmitted();
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Submission failed. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: "Your Formula" },
          { n: 2, label: "More Details" },
          { n: 3, label: "Legal & Submit" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${s.n <= step ? "bg-(--green-mid) text-white" : "bg-white/8 text-white/30"}`}
              >
                {s.n < step ? "✓" : s.n}
              </div>
              <span
                className={`text-[12px] hidden sm:block ${s.n === step ? "text-white font-medium" : "text-white/30"}`}
              >
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`flex-1 h-px ${s.n < step ? "bg-(--green-mid)/50" : "bg-white/8"} mx-2`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-5">
          <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-[13px] text-red-300">{error}</p>
        </div>
      )}

      <div className="bg-white/4 border border-white/[0.07] rounded-2xl p-6 space-y-5">
        {/* Step 1 */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <p className="text-[16px] font-semibold text-white mb-1">
                Tell us about your formula
              </p>
              <p className="text-[13px] text-white/50">
                This stays confidential — protected by the NDA you&apos;ll sign
                in Step 3.
              </p>
            </div>
            <div>
              <label className={labelCls}>Product Name *</label>
              <input
                value={form.productName}
                onChange={(e) => upd({ productName: e.target.value })}
                placeholder="e.g. Mama Nkechi's Asthma Blend"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Formula Category *</label>
              <select
                value={form.formulaCategory}
                onChange={(e) => upd({ formulaCategory: e.target.value })}
                className={`${inputCls} cursor-pointer`}
              >
                <option value="">Select a category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>What does it do? *</label>
              <textarea
                value={form.description}
                onChange={(e) => upd({ description: e.target.value })}
                placeholder="Describe what the remedy is for, how it's traditionally used, and why you believe it works…"
                rows={4}
                className={`${inputCls} h-auto py-3 resize-none`}
              />
            </div>
            <button
              onClick={() => {
                if (
                  !form.productName ||
                  !form.formulaCategory ||
                  !form.description
                ) {
                  setError("Please fill all required fields.");
                  return;
                }
                setStep(2);
              }}
              className="w-full h-11 bg-(--green-mid) hover:bg-(--green-light) text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Next <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <p className="text-[16px] font-semibold text-white mb-1">
                Formulation details
              </p>
              <p className="text-[13px] text-white/50">
                Optional — but the more we know, the faster we can advance you
                through the pipeline.
              </p>
            </div>
            <div>
              <label className={labelCls}>
                Current Form of the Preparation
              </label>
              <input
                value={form.currentForm}
                onChange={(e) => upd({ currentForm: e.target.value })}
                placeholder="e.g. Raw leaf decoction, dried powder, macerated oil"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Target Commercial Dosage Form</label>
              <input
                value={form.targetDosage}
                onChange={(e) => upd({ targetDosage: e.target.value })}
                placeholder="e.g. 500mg capsule, 200ml tonic, topical cream — or 'open to HerbRx recommendation'"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Origin Story</label>
              <textarea
                value={form.originStory}
                onChange={(e) => upd({ originStory: e.target.value })}
                placeholder="Where did this formula come from? Family recipe? Years of personal research? A specific health challenge you overcame?"
                rows={4}
                className={`${inputCls} h-auto py-3 resize-none`}
              />
              <p className="text-[11px] text-white/30 mt-1.5">
                A compelling origin story becomes a key part of your
                product&apos;s marketing — share as much or as little as
                you&apos;re comfortable with.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="h-11 px-6 border border-white/10 text-white/50 hover:text-white rounded-xl text-[14px] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 h-11 bg-(--green-mid) hover:bg-(--green-light) text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Review Agreements <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3 — Legal */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <div>
              <p className="text-[16px] font-semibold text-white mb-1">
                Legal Agreements
              </p>
              <p className="text-[13px] text-white/50">
                Read both documents carefully. These protect both you and
                HerbRx.
              </p>
            </div>

            {/* NDA */}
            <div
              className={`rounded-2xl border p-5 transition-all ${form.ndaSigned ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-white/3"}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-(--green-mid)/20 flex items-center justify-center shrink-0">
                  <Shield size={18} className="text-(--green-pale)" />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold text-white mb-1">
                    Non-Disclosure Agreement (NDA)
                  </p>
                  <p className="text-[13px] text-white/55 leading-relaxed mb-3">
                    HerbRx agrees that your formula details are strictly
                    confidential and will never be shared with third parties,
                    competitors, or the public without your explicit written
                    consent. The NDA is binding under Nigerian contract law.
                  </p>
                  <div className="space-y-1.5 mb-3 text-[12px] text-white/45">
                    {[
                      "Formula details protected indefinitely, even if the partnership ends",
                      "HerbRx employees sign internal NDAs covering all incubation files",
                      "You retain full IP ownership of the original formula",
                    ].map((p) => (
                      <p key={p} className="flex items-start gap-2">
                        <span className="text-(--green-pale) mt-0.5">•</span>
                        {p}
                      </p>
                    ))}
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => upd({ ndaSigned: !form.ndaSigned })}
                      className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all cursor-pointer shrink-0 ${form.ndaSigned ? "bg-green-500 border-green-500" : "border-white/30 group-hover:border-white/50"}`}
                    >
                      {form.ndaSigned && (
                        <CheckCircle size={13} className="text-white" />
                      )}
                    </div>
                    <span className="text-[13px] text-white/70">
                      I have read and agree to the Non-Disclosure Agreement
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Royalty */}
            <div
              className={`rounded-2xl border p-5 transition-all ${form.royaltyAgreed ? "border-(--gold)/30 bg-(--gold)/5" : "border-white/10 bg-white/3"}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-(--gold)/15 flex items-center justify-center shrink-0">
                  <Star size={18} className="text-(--gold-light)" />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold text-white mb-1">
                    Fractional Royalty Agreement
                  </p>
                  <p className="text-[13px] text-white/55 leading-relaxed mb-3">
                    In exchange for covering lab fees, NAFDAC filing, branding,
                    and distribution, HerbRx retains 15% of net revenue from
                    each sale of your product. You receive 85%. Revenue is
                    tracked transparently in your dashboard and paid out
                    monthly.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {[
                      {
                        label: "Your share",
                        value: "85%",
                        color: "text-[var(--green-pale)]",
                      },
                      {
                        label: "HerbRx share",
                        value: "15%",
                        color: "text-[var(--gold-light)]",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="bg-white/5 rounded-xl p-3 text-center"
                      >
                        <p
                          className={`text-[22px] font-serif font-semibold ${s.color}`}
                        >
                          {s.value}
                        </p>
                        <p className="text-[11px] text-white/40 mt-0.5">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5 mb-3 text-[12px] text-white/45">
                    {[
                      "Lab fees and filing costs recouped from revenue, not upfront",
                      "Monthly revenue statements emailed to you",
                      "Agreement is renegotiable after 12 months of live sales",
                    ].map((p) => (
                      <p key={p} className="flex items-start gap-2">
                        <span className="text-(--gold-light) mt-0.5">•</span>
                        {p}
                      </p>
                    ))}
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() =>
                        upd({ royaltyAgreed: !form.royaltyAgreed })
                      }
                      className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all cursor-pointer shrink-0 ${form.royaltyAgreed ? "bg-(--gold) border-(--gold)" : "border-white/30 group-hover:border-white/50"}`}
                    >
                      {form.royaltyAgreed && (
                        <CheckCircle size={13} className="text-white" />
                      )}
                    </div>
                    <span className="text-[13px] text-white/70">
                      I agree to the 85/15 royalty split outlined above
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Summary before submit */}
            <div className="bg-white/4 border border-white/[0.07] rounded-xl p-4">
              <p className="text-[11px] text-white/35 uppercase tracking-wider mb-2">
                Submitting
              </p>
              <p className="text-[14px] font-semibold text-white">
                {form.productName}
              </p>
              <p className="text-[12px] text-white/45">
                {form.formulaCategory}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="h-11 px-6 border border-white/10 text-white/50 hover:text-white rounded-xl text-[14px] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.ndaSigned || !form.royaltyAgreed}
                className="flex-1 h-11 bg-(--green-deep) hover:bg-(--green-mid) disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Submitting…
                  </>
                ) : (
                  <>
                    <Sparkles size={15} /> Submit to HerbRx Incubation
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Phase card ────────
function PhaseCard({
  config,
  status,
  isExpanded,
  onToggle,
  phaseLog,
}: {
  config: PhaseConfig;
  status: PhaseStatus;
  isExpanded: boolean;
  onToggle: () => void;
  phaseLog?: { enteredAt: string; completedAt?: string; notes?: string };
}) {
  const isLocked = status === "LOCKED";
  const isActive = status === "ACTIVE";
  const isCompleted = status === "COMPLETED";
  const isUpcoming = status === "UPCOMING";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden transition-all ${
        isLocked
          ? "border-white/6 bg-white/2 opacity-50"
          : isCompleted
            ? "border-green-500/20 bg-green-500/5"
            : isActive
              ? `${config.border} ${config.accentBg}`
              : "border-white/8 bg-white/3"
      }`}
    >
      {/* Header row */}
      <button
        className={`w-full flex items-center gap-4 px-5 py-5 text-left ${isLocked ? "cursor-default" : "hover:bg-white/3 transition-colors cursor-pointer"}`}
        onClick={isLocked ? undefined : onToggle}
        disabled={isLocked}
      >
        {/* Phase number circle */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
            isCompleted
              ? "bg-green-500/20 text-green-400"
              : isActive
                ? `${config.accentBg} ${config.color}`
                : "bg-white/6 text-white/25"
          }`}
        >
          {isCompleted ? <CheckCircle size={22} /> : config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${
                isCompleted
                  ? "text-green-400"
                  : isActive
                    ? config.color
                    : "text-white/25"
              }`}
            >
              Phase {config.number}
            </span>

            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isCompleted
                  ? "bg-green-500/15 text-green-400"
                  : isActive
                    ? "bg-white/10 text-white/60"
                    : isUpcoming
                      ? "bg-white/6 text-white/30"
                      : "bg-white/4 text-white/20"
              }`}
            >
              {isCompleted
                ? "✓ Complete"
                : isActive
                  ? "● In Progress"
                  : isUpcoming
                    ? "Up Next"
                    : "Locked"}
            </span>
          </div>
          <p
            className={`text-[15px] font-semibold leading-snug ${isLocked ? "text-white/30" : "text-white"}`}
          >
            {config.title}
          </p>
          <p
            className={`text-[12px] font-light mt-0.5 ${isLocked ? "text-white/20" : "text-white/45"}`}
          >
            {config.tagline}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {statusIcon(status)}
          {!isLocked && (
            <div className="text-white/30">
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          )}
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 border-t border-white/6 pt-5 space-y-5">
              <p className="text-[14px] text-white/60 leading-relaxed">
                {config.what}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* What you do */}
                <div>
                  <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Package size={11} /> Your responsibilities
                  </p>
                  <ul className="space-y-2">
                    {config.you.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[13px] text-white/60"
                      >
                        <ChevronRight
                          size={13}
                          className="shrink-0 mt-0.5 text-white/30"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What HerbRx does */}
                <div>
                  <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Sparkles size={11} /> What HerbRx handles
                  </p>
                  <ul className="space-y-2">
                    {config.herbrx.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[13px] text-white/60"
                      >
                        <CheckCircle
                          size={12}
                          className="shrink-0 mt-0.5 text-(--green-pale)"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Documents & Timeline */}
              <div className="flex flex-wrap gap-3 items-center justify-between pt-2 border-t border-white/6">
                <div className="flex flex-wrap gap-1.5">
                  {config.documents.map((doc) => (
                    <span
                      key={doc}
                      className="inline-flex items-center gap-1.5 text-[11px] text-white/45 bg-white/6 border border-white/8 px-2.5 py-1 rounded-lg"
                    >
                      <FileText size={10} /> {doc}
                    </span>
                  ))}
                </div>
                <span className="text-[12px] text-white/35 flex items-center gap-1.5">
                  <Clock size={12} /> Est. {config.timeline}
                </span>
              </div>

              {/* Phase log timestamps if available */}
              {phaseLog && (
                <div className="bg-white/4 border border-white/6 rounded-xl p-4">
                  <p className="text-[11px] text-white/35 uppercase tracking-wider mb-2">
                    Activity Log
                  </p>
                  <div className="space-y-1.5 text-[12px]">
                    <p className="text-white/50">
                      <span className="text-white/30">Entered: </span>
                      {new Date(phaseLog.enteredAt).toLocaleDateString(
                        "en-NG",
                        { dateStyle: "medium" },
                      )}
                    </p>
                    {phaseLog.completedAt && (
                      <p className="text-green-400">
                        <span className="text-white/30">Completed: </span>
                        {new Date(phaseLog.completedAt).toLocaleDateString(
                          "en-NG",
                          { dateStyle: "medium" },
                        )}
                      </p>
                    )}
                    {phaseLog.notes && (
                      <p className="text-white/45 mt-2 leading-relaxed italic">
                        &qout;{phaseLog.notes}&qout;
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main component ───
export function IncubationTrackerPage() {
  const { data, loading, mutate } = useIncubation();
  const submission = data?.submission ?? null;

  const [expanded, setExpanded] = useState<Phase | null>("INTAKE");
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmitted() {
    setSubmitted(true);
    setShowIntakeForm(false);
    mutate();
  }

  // ── Loading ───────────
  if (loading) {
    return (
      <DashboardShell
        heading="Incubation Tracker"
        subheading="Loading your pipeline…"
      >
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-(--green-pale)" />
        </div>
      </DashboardShell>
    );
  }

  // ── No submission yet — landing / intake entry ────────────────────────
  if (!submission && !showIntakeForm) {
    return (
      <DashboardShell
        heading="HerbRx Incubation Programme"
        subheading="Transform your traditional remedy into a verified, NAFDAC-listed product — without paying anything upfront."
      >
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20"
          >
            <CheckCircle size={18} className="text-green-400" />
            <p className="text-[14px] text-white font-medium">
              Application submitted! Your Compliance Advisor will review it
              within 2 business days.
            </p>
          </motion.div>
        )}

        {/* Hero value prop */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6 mb-8">
          <div className="bg-linear-to-br from-(--green-deep) to-[#0D2419] border border-(--green-mid)/30 rounded-2xl p-7">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-(--gold-light)" />
              <span className="text-[11px] font-semibold text-(--gold-light) uppercase tracking-widest">
                For Product Owners
              </span>
            </div>
            <h2 className="font-serif text-[clamp(20px,3vw,28px)] font-semibold text-white mb-3 leading-snug">
              Have a remedy that works?
              <br />
              <em className="not-italic text-(--gold-light)">
                Let&apos;s make it a real product.
              </em>
            </h2>
            <p className="text-[14px] text-white/55 leading-relaxed mb-6">
              HerbRx handles lab testing, NAFDAC filing, branding, and
              distribution. You supply the formula. We share the revenue. No
              upfront cost, all fees are recovered from sales.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                "No upfront cost",
                "You keep 85%",
                "NAFDAC certified",
                "IP protected",
                "Exclusive launch",
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-(--green-pale) bg-(--green-mid)/20 border border-(--green-mid)/30 px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => setShowIntakeForm(true)}
              className="inline-flex items-center gap-2 bg-(--green-mid) hover:bg-(--green-light) text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Sparkles size={16} /> Submit Your Formula →
            </button>
          </div>

          {/* Stats / highlights */}
          <div className="space-y-3">
            {[
              {
                icon: "🔬",
                title: "Lab-tested safety",
                desc: "Your product gets a real COA from a NAFDAC-recognised lab before anything is filed.",
              },
              {
                icon: "📋",
                title: "NAFDAC listed",
                desc: "We file under our corporate licence. Typical listing: 120 working days.",
              },
              {
                icon: "🛡️",
                title: "Your IP protected",
                desc: "NDA signed on submission. You own the formula forever, regardless of outcome.",
              },
              {
                icon: "💰",
                title: "85% revenue to you",
                desc: "Monthly payouts tracked transparently. Lab and filing costs recovered from sales, not upfront.",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/4 border border-white/[0.07]"
              >
                <span className="text-[22px] shrink-0">{s.icon}</span>
                <div>
                  <p className="text-[13px] font-semibold text-white mb-0.5">
                    {s.title}
                  </p>
                  <p className="text-[12px] text-white/45 leading-relaxed font-light">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase overview */}
        <div>
          <p className="text-[12px] font-semibold text-white/35 uppercase tracking-widest mb-4">
            The 5-Phase Pipeline
          </p>
          <div className="grid sm:grid-cols-5 gap-2">
            {PHASES.map((phase, i) => (
              <div
                key={phase.key}
                className="text-center p-4 rounded-2xl bg-white/4 border border-white/7"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${phase.accentBg} flex items-center justify-center mx-auto mb-3 ${phase.color}`}
                >
                  {phase.icon}
                </div>
                <p className="text-[10px] text-white/35 uppercase tracking-widest mb-1">
                  Phase {i + 1}
                </p>
                <p className="text-[12px] font-semibold text-white leading-snug">
                  {phase.title.split(" ").slice(0, 3).join(" ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  // ── Intake form ────
  if (showIntakeForm && !submission) {
    return (
      <DashboardShell
        heading="Submit Your Formula"
        subheading="Step 1 of the HerbRx Incubation Programme"
      >
        <button
          onClick={() => setShowIntakeForm(false)}
          className="flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white transition-colors mb-6"
        >
          ← Back
        </button>
        <IntakeForm onSubmitted={handleSubmitted} />
      </DashboardShell>
    );
  }

  // ── Active tracker ────────
  const currentPhase = (submission?.currentPhase ?? "INTAKE") as Phase;
  const phaseOrder: Phase[] = [
    "INTAKE",
    "PRECLINICAL",
    "BRANDING",
    "NAFDAC",
    "LAUNCH",
  ];
  const currentIdx = phaseOrder.indexOf(currentPhase);
  const progressPct = Math.round(((currentIdx + 0.5) / 5) * 100);

  return (
    <DashboardShell
      heading="Incubation Tracker"
      subheading={`Tracking: ${submission?.productName ?? "Your Product"}`}
    >
      {/* Status bar */}
      <div className="mb-7 bg-white/4 border border-white/[0.07] rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[18px] font-serif font-semibold text-white">
                {String(submission?.productName ?? "")}
              </h3>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-(--green-mid)/20 text-(--green-pale)">
                {(submission?.status as string) ?? "ACTIVE"}
              </span>
            </div>
            <p className="text-[13px] text-white/40">
              {String(submission?.formulaCategory)} · Submitted{" "}
              {typeof submission?.createdAt === "string"
                ? new Date(submission.createdAt).toLocaleDateString("en-NG")
                : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[28px] font-serif font-semibold text-(--green-pale)">
              {progressPct}%
            </p>
            <p className="text-[11px] text-white/35 uppercase tracking-wider">
              Complete
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/6 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-linear-to-r from-(--green-mid) to-(--green-pale)"
          />
        </div>

        {/* Phase dots */}
        <div className="flex justify-between mt-2">
          {PHASES.map((p, i) => (
            <div key={p.key} className="flex flex-col items-center">
              <div
                className={`w-2 h-2 rounded-full mt-1 ${i < currentIdx ? "bg-green-400" : i === currentIdx ? "bg-(--green-pale)" : "bg-white/12"}`}
              />
              <span
                className={`text-[9px] mt-1 hidden sm:block ${i <= currentIdx ? "text-white/40" : "text-white/15"}`}
              >
                P{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase cards */}
      <div className="space-y-3">
        {PHASES.map((phase) => {
          const status = phaseStatus(currentPhase, phase.key);
          const log = Array.isArray(submission?.phases)
            ? submission.phases.find(
                (p: SubmissionPhase) => p.phase === phase.key,
              )
            : undefined;
          return (
            <PhaseCard
              key={phase.key}
              config={phase}
              status={status}
              isExpanded={expanded === phase.key}
              onToggle={() =>
                setExpanded((prev) => (prev === phase.key ? null : phase.key))
              }
              phaseLog={log}
            />
          );
        })}
      </div>

      {/* Advisor contact */}
      <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-white/3 border border-white/6">
        <Info size={14} className="text-white/30 shrink-0 mt-0.5" />
        <p className="text-[12px] text-white/35 leading-relaxed">
          Your HerbRx Compliance Advisor will contact you within 2 business days
          to confirm receipt and answer any questions. For urgent matters email{" "}
          <a
            href="mailto:incubation@herbrx.ng"
            className="text-(--green-pale) hover:text-white transition-colors"
          >
            incubation@herbrx.ng
          </a>{" "}
          quoting your product name.
        </p>
      </div>
    </DashboardShell>
  );
}
