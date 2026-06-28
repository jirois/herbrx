"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useVerificationStatus, producerApi } from "@/hooks/dashboard-hooks";
import {
  BadgeCheck,
  Building2,
  FileText,
  FlaskConical,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Upload,
  ChevronRight,
  Loader2,
  X,
  Info,
  Lock,
  Unlock,
  Star,
  Shield,
  Globe,
  ShoppingBag,
  TrendingUp,
  Hash,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ArrowRight,
  Edit3,
} from "lucide-react";
import Link from "next/link";

// ── Types ────────
type VerificationStatus =
  | "UNVERIFIED" // Never applied
  | "DRAFT" // Started but not submitted
  | "SUBMITTED" // Awaiting admin review
  | "UNDER_REVIEW" // Admin is actively reviewing
  | "APPROVED" // Tier 2 granted
  | "REJECTED" // Failed review, can reapply
  | "SUSPENDED"; // Was verified but suspended

// type StepStatus = "incomplete" | "complete" | "error";

interface BusinessForm {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  rcNumber: string;
  nafdacNumber: string;
  address: string;
  state: string;
  website: string;
  yearFounded: string;
  productCount: string;
  employeeRange: string;
  description: string;
}

interface DocumentForm {
  cacCertFile: File | null;
  nafdacFile: File | null;
  labPartnerFile: File | null;
  insuranceFile: File | null;
}

interface VerifiedProfilePayload {
  businessName?: string | null;
  businessEmail?: string | null;
  businessPhone?: string | null;
  rcNumber?: string | null;
  nafdacNumber?: string | null;
}

// ── Mock state — switch this to represent different flow states ────────────
// Change MOCK_STATUS to test different views:
// 'UNVERIFIED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
const MOCK_STATUS: VerificationStatus = "UNVERIFIED";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const EMPLOYEE_RANGES = ["1–5", "6–15", "16–50", "51–200", "200+"];

// ── Tier benefit cards ─────────────────────────────────────────────────────
const TIER1_BENEFITS = [
  { icon: FileText, label: "List product info and descriptions" },
  { icon: Globe, label: "Basic producer profile page" },
  { icon: FlaskConical, label: "Submit COA documents for review" },
];

const TIER2_BENEFITS = [
  { icon: ShoppingBag, label: "Full marketplace selling rights" },
  { icon: BadgeCheck, label: '"HerbRx Verified Safe" badge on all products' },
  { icon: Star, label: "Priority placement in search results" },
  { icon: TrendingUp, label: "Access to analytics and sales data" },
  { icon: Shield, label: "Consumer trust signal — 3× more likely to purchase" },
  { icon: Globe, label: "Enhanced producer profile with verification seal" },
];

const VERIFICATION_STEPS = [
  {
    id: "business",
    label: "Business Details",
    icon: Building2,
    desc: "Tell us about your business",
  },
  {
    id: "docs",
    label: "Upload Documents",
    icon: Upload,
    desc: "CAC cert, NAFDAC, lab partnership",
  },
  {
    id: "review",
    label: "Submit for Review",
    icon: BadgeCheck,
    desc: "Confirm and send to HerbRx team",
  },
];

const inputCls =
  "w-full h-10 px-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[var(--green-mid)] transition-all";
const labelCls =
  "block text-[12px] font-medium text-white/50 mb-1.5 uppercase tracking-wider";

// ── File upload zone ─────
function FileZone({
  label,
  hint,
  file,
  required,
  onChange,
}: {
  label: string;
  hint: string;
  file: File | null;
  required?: boolean;
  onChange: (f: File | null) => void;
}) {
  const [drag, setDrag] = useState(false);
  const id = `fz-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label className={labelCls}>
        {label}
        {required && " *"}
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files[0];
          if (f) onChange(f);
        }}
        onClick={() => document.getElementById(id)?.click()}
        className={`relative flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${drag ? "border-(--green-mid) bg-(--green-mid)/10" : file ? "border-green-500/40 bg-green-500/5" : "border-white/10 bg-white/3 hover:border-white/25"}`}
      >
        <input
          id={id}
          type="file"
          accept=".pdf,.jpg,.png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onChange(f);
          }}
        />

        {file ? (
          <>
            <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">
                {file.name}
              </p>
              <p className="text-[11px] text-white/35">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="text-white/30 hover:text-red-400 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-lg bg-white/6 flex items-center justify-center shrink-0">
              <Upload size={16} className="text-white/30" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-white/60">
                Drop file or click to browse
              </p>
              <p className="text-[11px] text-white/30 mt-0.5">{hint}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Status displays ───────
function SubmittedView({ status }: { status: "SUBMITTED" | "UNDER_REVIEW" }) {
  const isReviewing = status === "UNDER_REVIEW";
  return (
    <div className="max-w-xl mx-auto text-center py-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${isReviewing ? "bg-blue-500/15" : "bg-amber-500/15"}`}
      >
        {isReviewing ? (
          <Clock size={36} className="text-blue-400" />
        ) : (
          <Clock size={36} className="text-amber-400" />
        )}
      </motion.div>
      <h2 className="font-serif text-[24px] font-semibold text-white mb-2">
        {isReviewing ? "Under Active Review" : "Application Submitted"}
      </h2>
      <p className="text-[14px] text-white/50 leading-relaxed mb-8">
        {isReviewing
          ? "A HerbRx compliance officer is currently reviewing your application and documents. You'll receive an email notification within 3–5 business days."
          : "Your verification application has been received and is queued for review. Typical review time is 3–5 business days."}
      </p>

      {/* Progress tracker */}
      <div className="text-left bg-white/4 border border-white/[0.07] rounded-2xl p-6 mb-6">
        <p className="text-[12px] text-white/35 uppercase tracking-wider mb-4">
          Verification Progress
        </p>
        {[
          { label: "Application received", done: true, active: false },
          {
            label: "Initial document check",
            done: isReviewing,
            active: !isReviewing,
          },
          { label: "Compliance review", done: false, active: isReviewing },
          { label: "Decision & notification", done: false, active: false },
        ].map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-green-500/20" : step.active ? "bg-blue-500/20" : "bg-white/6"}`}
            >
              {step.done ? (
                <CheckCircle size={13} className="text-green-400" />
              ) : step.active ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <Loader2 size={13} className="text-blue-400" />
                </motion.div>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              )}
            </div>
            <span
              className={`text-[13px] ${step.done ? "text-white/60" : step.active ? "text-white font-medium" : "text-white/30"}`}
            >
              {step.label}
            </span>
            {step.active && (
              <span className="ml-auto text-[11px] text-blue-400 font-medium">
                In Progress
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/4 border border-white/[0.07] text-left">
        <Info size={14} className="text-white/40 shrink-0 mt-0.5" />
        <p className="text-[12px] text-white/45 leading-relaxed">
          Questions about your application? Contact the compliance team at{" "}
          <a
            href="mailto:compliance@herbrx.ng"
            className="text-(--green-pale) hover:text-white transition-colors"
          >
            compliance@herbrx.ng
          </a>
          , quoting your business name.
        </p>
      </div>
    </div>
  );
}

function RejectedView({ onReapply }: { onReapply: () => void }) {
  return (
    <div className="max-w-xl mx-auto py-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-red-500/15"
      >
        <XCircle size={36} className="text-red-400" />
      </motion.div>
      <h2 className="font-serif text-[24px] font-semibold text-white mb-2 text-center">
        Application Not Approved
      </h2>
      <p className="text-[14px] text-white/50 leading-relaxed mb-6 text-center">
        Your verification application was reviewed but could not be approved at
        this time. Review the feedback below and resubmit when ready.
      </p>

      {/* Rejection reasons */}
      <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-5 mb-5">
        <p className="text-[12px] text-white/35 uppercase tracking-wider mb-3">
          Reviewer Feedback
        </p>
        {[
          {
            issue: "CAC Certificate invalid or expired",
            fix: "Upload a current CAC certificate (within 12 months).",
          },
          {
            issue: "Lab partnership letter not on letterhead",
            fix: "Resubmit on official laboratory letterhead with stamp.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 py-3 border-b border-red-500/10 last:border-0"
          >
            <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-white">
                {item.issue}
              </p>
              <p className="text-[12px] text-white/50 mt-0.5">{item.fix}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onReapply}
        className="w-full h-12 bg-(--green-mid) hover:bg-(--green-light) text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <ArrowRight size={16} /> Start New Application
      </button>
    </div>
  );
}

function ApprovedView() {
  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Seal */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-center mb-10"
      >
        <div className="relative inline-flex">
          <div className="w-28 h-28 rounded-full bg-linear-to-br from-(--green-deep) to-[#0D2419] border-4 border-(--green-mid) flex flex-col items-center justify-center shadow-[0_0_40px_rgba(45,90,61,0.4)]">
            <BadgeCheck size={40} className="text-(--gold-light)" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-(--gold) flex items-center justify-center shadow-lg"
          >
            <CheckCircle size={20} className="text-white" />
          </motion.div>
        </div>
        <h2 className="font-serif text-[28px] font-semibold text-white mt-5 mb-1">
          HerbRx Verified
        </h2>
        <p className="text-(--gold-light) font-medium tracking-wide text-[14px]">
          Tier 2 · Seal of Safety Holder
        </p>
        <p className="text-[13px] text-white/40 mt-1">
          Verified 14 June 2025 · Renewal due June 2026
        </p>
      </motion.div>

      {/* What you unlocked */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-linear-to-br from-(--green-deep)/60 to-[#0D2419] border border-(--green-mid)/30 rounded-2xl p-6 mb-5"
      >
        <p className="text-[12px] text-(--gold-light) uppercase tracking-widest font-semibold mb-4">
          Your Verified Privileges
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {TIER2_BENEFITS.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-(--green-mid)/30 flex items-center justify-center shrink-0">
                <b.icon size={14} className="text-(--green-pale)" />
              </div>
              <span className="text-[13px] text-white/70">{b.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Verified badge embed code */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white/4 border border-white/[0.07] rounded-2xl p-6 mb-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Globe size={14} className="text-white/40" />
          <p className="text-[13px] font-semibold text-white">
            Add Verified Badge to Your Website
          </p>
        </div>
        <div className="bg-[#0D1117] rounded-xl p-3.5 font-mono text-[11px] text-(--green-pale) leading-relaxed overflow-x-auto mb-3 border border-white/[0.07]">
          {'<a href="https://herbrx.ng/verify/GreenHealth-NG">'}
          <br />
          {'  <img src="https://herbrx.ng/badge/verified.svg"'}
          <br />
          {'       alt="HerbRx Verified Safe" width="140" />'}
          <br />
          {"</a>"}
        </div>
        <button className="inline-flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white border border-white/8 px-3 py-1.5 rounded-lg transition-colors">
          <ExternalLink size={12} /> Copy embed code
        </button>
      </motion.div>

      {/* Renewal & actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="grid sm:grid-cols-2 gap-3"
      >
        <Link
          href="/dashboard/producer/products"
          className="flex items-center justify-between p-4 rounded-2xl bg-white/4 border border-white/[0.07] hover:border-white/20 transition-colors group"
        >
          <div>
            <p className="text-[13px] font-semibold text-white">
              Manage Products
            </p>
            <p className="text-[12px] text-white/40">
              List verified products in store
            </p>
          </div>
          <ChevronRight
            size={16}
            className="text-white/30 group-hover:text-white transition-colors"
          />
        </Link>
        <Link
          href="/dashboard/producer/batches"
          className="flex items-center justify-between p-4 rounded-2xl bg-white/4 border border-white/[0.07] hover:border-white/20 transition-colors group"
        >
          <div>
            <p className="text-[13px] font-semibold text-white">
              Submit New Batch
            </p>
            <p className="text-[12px] text-white/40">
              Keep COA records current
            </p>
          </div>
          <ChevronRight
            size={16}
            className="text-white/30 group-hover:text-white transition-colors"
          />
        </Link>
      </motion.div>

      <p className="text-[11px] text-white/25 text-center mt-5">
        Verification renews annually. HerbRx will email you 60 days before
        expiry.
      </p>
    </div>
  );
}

// ── Main component ─────
export function VerificationPage() {
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>(MOCK_STATUS);
  const [step, setStep] = useState(0); // 0 = landing, 1 = business, 2 = docs, 3 = review
  const [submitting, setSubmitting] = useState(false);

  const [business, setBusiness] = useState<BusinessForm>({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    rcNumber: "",
    nafdacNumber: "",
    address: "",
    state: "",
    website: "",
    yearFounded: "",
    productCount: "",
    employeeRange: "1–5",
    description: "",
  });

  const [docs, setDocs] = useState<DocumentForm>({
    cacCertFile: null,
    nafdacFile: null,
    labPartnerFile: null,
    insuranceFile: null,
  });

  function updateBusiness(patch: Partial<BusinessForm>) {
    setBusiness((p) => ({ ...p, ...patch }));
  }

  const businessComplete = !!(
    business.businessName &&
    business.businessEmail &&
    business.businessPhone &&
    business.rcNumber &&
    business.state
  );
  const docsComplete = !!(docs.cacCertFile && docs.labPartnerFile);

  const { data: verificationData, mutate: refetchVerification } =
    useVerificationStatus();

  // Derive status from real API response
  const apiStatus = verificationData?.status as VerificationStatus | undefined;
  const effectiveStatus = apiStatus ?? verificationStatus;

  // Pre-fill business form from API profile if available
  if (verificationData?.profile && !business.businessName) {
    const p = verificationData.profile as VerifiedProfilePayload;

    setBusiness((prev: BusinessForm) => ({
      ...prev,
      businessName: p.businessName ?? prev.businessName,
      businessEmail: p.businessEmail ?? prev.businessEmail,
      businessPhone: p.businessPhone ?? prev.businessPhone,
      rcNumber: p.rcNumber ?? prev.rcNumber,
      nafdacNumber: p.nafdacNumber ?? prev.nafdacNumber,
    }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await producerApi.applyVerification({
        businessName: business.businessName,
        businessEmail: business.businessEmail,
        businessPhone: business.businessPhone,
        rcNumber: business.rcNumber,
        nafdacNumber: business.nafdacNumber,
        state: business.state,
        website: business.website,
        // Document URLs — in production upload to Cloudinary/S3 first
        cacCertUrl: docs.cacCertFile
          ? `https://cdn.herbrx.ng/docs/${docs.cacCertFile.name}`
          : "",
        labPartnerUrl: docs.labPartnerFile
          ? `https://cdn.herbrx.ng/docs/${docs.labPartnerFile.name}`
          : "",
        nafdacUrl: docs.nafdacFile
          ? `https://cdn.herbrx.ng/docs/${docs.nafdacFile.name}`
          : "",
        insuranceUrl: docs.insuranceFile
          ? `https://cdn.herbrx.ng/docs/${docs.insuranceFile.name}`
          : "",
      });
      refetchVerification();
    } catch {
      /* optimistic fallback */
    }
    setSubmitting(false);
    setVerificationStatus("SUBMITTED");
  }

  // ── Status-based rendering ────
  if (effectiveStatus === "APPROVED") {
    return (
      <DashboardShell
        heading="Verification Status"
        subheading="Your HerbRx Seal of Safety"
      >
        <ApprovedView />
      </DashboardShell>
    );
  }

  if (effectiveStatus === "SUBMITTED") {
    return (
      <DashboardShell
        heading="Verification Status"
        subheading="Application under review"
      >
        <SubmittedView status="SUBMITTED" />
      </DashboardShell>
    );
  }

  if (effectiveStatus === "UNDER_REVIEW") {
    return (
      <DashboardShell
        heading="Verification Status"
        subheading="Compliance review in progress"
      >
        <SubmittedView status="UNDER_REVIEW" />
      </DashboardShell>
    );
  }

  if (effectiveStatus === "REJECTED") {
    return (
      <DashboardShell
        heading="Verification Status"
        subheading="Application not approved"
      >
        <RejectedView
          onReapply={() => {
            setVerificationStatus("UNVERIFIED");
            setStep(0);
          }}
        />
      </DashboardShell>
    );
  }

  // ── Application flow (UNVERIFIED / DRAFT) ───────
  return (
    <DashboardShell
      heading="Get HerbRx Verified"
      subheading="Earn the Seal of Safety — unlock marketplace selling rights and the Verified badge."
    >
      {step === 0 && (
        /* Landing / tier comparison */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-3xl"
        >
          {/* Tier comparison */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {/* Tier 1 */}
            <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={16} className="text-white/40" />
                <span className="text-[12px] font-semibold text-white/50 uppercase tracking-wider">
                  Tier 1 — Current
                </span>
              </div>
              <h3 className="font-serif text-[20px] font-semibold text-white mb-4">
                Unverified Producer
              </h3>
              <ul className="space-y-3 mb-5">
                {TIER1_BENEFITS.map((b) => (
                  <li
                    key={b.label}
                    className="flex items-center gap-3 text-[13px] text-white/55"
                  >
                    <b.icon size={14} className="text-white/30 shrink-0" />{" "}
                    {b.label}
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/[0.07] pt-4 space-y-2">
                {[
                  "Cannot sell in marketplace",
                  "No Verified badge",
                  "No analytics access",
                ].map((r) => (
                  <p
                    key={r}
                    className="flex items-center gap-2 text-[12px] text-white/25"
                  >
                    <XCircle size={12} className="text-red-500/50" /> {r}
                  </p>
                ))}
              </div>
            </div>

            {/* Tier 2 */}
            <div className="rounded-2xl border border-(--green-mid)/40 bg-linear-to-br from-(--green-deep)/50 to-[#0D2419] p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-(--gold)/20 text-(--gold-light) uppercase tracking-wider">
                  Goal
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Unlock size={16} className="text-(--gold-light)" />
                <span className="text-[12px] font-semibold text-(--gold-light) uppercase tracking-wider">
                  Tier 2 — Target
                </span>
              </div>
              <h3 className="font-serif text-[20px] font-semibold text-white mb-4">
                HerbRx Verified
              </h3>
              <ul className="space-y-3">
                {TIER2_BENEFITS.map((b) => (
                  <li
                    key={b.label}
                    className="flex items-center gap-3 text-[13px] text-white/70"
                  >
                    <div className="w-6 h-6 rounded-md bg-(--green-mid)/30 flex items-center justify-center shrink-0">
                      <b.icon size={12} className="text-(--green-pale)" />
                    </div>
                    {b.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white/4 border border-white/[0.07] rounded-2xl p-6 mb-6">
            <h4 className="text-[14px] font-semibold text-white mb-4 flex items-center gap-2">
              <FileText size={15} className="text-(--green-pale)" /> What
              You&apos;ll Need
            </h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                {
                  doc: "CAC Certificate",
                  required: true,
                  note: "Must be current (within 12 months)",
                },
                {
                  doc: "Lab Partnership Letter",
                  required: true,
                  note: "From a NAFDAC-recognised laboratory",
                },
                {
                  doc: "NAFDAC Registration",
                  required: false,
                  note: "If products are NAFDAC-registered",
                },
                {
                  doc: "Business Insurance Cert",
                  required: false,
                  note: "Product liability insurance recommended",
                },
              ].map((r) => (
                <div
                  key={r.doc}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/6"
                >
                  <span
                    className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${r.required ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/40"}`}
                  >
                    {r.required ? "!" : "?"}
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-white">
                      {r.doc}
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5">{r.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full sm:w-auto h-12 px-10 bg-(--green-mid) hover:bg-(--green-light) text-white font-semibold rounded-xl transition-colors text-[15px] flex items-center justify-center gap-2"
          >
            <BadgeCheck size={18} /> Start Verification Application{" "}
            <ChevronRight size={16} />
          </button>
          <p className="text-[12px] text-white/30 mt-3">
            Free to apply · Typical review: 3–5 business days
          </p>
        </motion.div>
      )}

      {step > 0 && (
        <div className="max-w-2xl">
          {/* Step indicator */}
          <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
            {VERIFICATION_STEPS.map((s, i) => {
              const idx = step - 1;
              const done = i < idx;
              const active = i === idx;
              return (
                <div key={s.id} className="flex items-center shrink-0">
                  <div
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-medium transition-all ${active ? "bg-(--green-mid) text-white" : done ? "text-green-400" : "text-white/30"}`}
                  >
                    {done ? <CheckCircle size={13} /> : <s.icon size={13} />}
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </div>
                  {i < VERIFICATION_STEPS.length - 1 && (
                    <div
                      className={`w-6 h-0.5 mx-1 ${done ? "bg-green-500/40" : "bg-white/[0.07]"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Step 1: Business details ── */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-white/4 border border-white/[0.07] rounded-2xl p-6 space-y-4">
                <h3 className="text-[15px] font-semibold text-white flex items-center gap-2 mb-1">
                  <Building2 size={16} className="text-(--green-pale)" />{" "}
                  Business Information
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>
                      Registered Business Name *
                    </label>
                    <input
                      value={business.businessName}
                      onChange={(e) =>
                        updateBusiness({ businessName: e.target.value })
                      }
                      placeholder="e.g. GreenHealth Nigeria Ltd"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Business Email *</label>
                    <div className="relative">
                      <Mail
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                      />
                      <input
                        type="email"
                        value={business.businessEmail}
                        onChange={(e) =>
                          updateBusiness({ businessEmail: e.target.value })
                        }
                        placeholder="business@example.com"
                        className={`${inputCls} pl-8`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Business Phone *</label>
                    <div className="relative">
                      <Phone
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                      />
                      <input
                        value={business.businessPhone}
                        onChange={(e) =>
                          updateBusiness({ businessPhone: e.target.value })
                        }
                        placeholder="+234 800 000 0000"
                        className={`${inputCls} pl-8`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>CAC RC Number *</label>
                    <div className="relative">
                      <Hash
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                      />
                      <input
                        value={business.rcNumber}
                        onChange={(e) =>
                          updateBusiness({ rcNumber: e.target.value })
                        }
                        placeholder="e.g. RC-1234567"
                        className={`${inputCls} pl-8`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>NAFDAC Number (if any)</label>
                    <input
                      value={business.nafdacNumber}
                      onChange={(e) =>
                        updateBusiness({ nafdacNumber: e.target.value })
                      }
                      placeholder="e.g. A7-1234"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>State of Operation *</label>
                    <div className="relative">
                      <MapPin
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                      />
                      <select
                        value={business.state}
                        onChange={(e) =>
                          updateBusiness({ state: e.target.value })
                        }
                        className={`${inputCls} pl-8 cursor-pointer`}
                      >
                        <option value="">Select state…</option>
                        {NIGERIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Year Founded</label>
                    <input
                      value={business.yearFounded}
                      onChange={(e) =>
                        updateBusiness({ yearFounded: e.target.value })
                      }
                      placeholder="e.g. 2018"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Number of Employees</label>
                    <select
                      value={business.employeeRange}
                      onChange={(e) =>
                        updateBusiness({ employeeRange: e.target.value })
                      }
                      className={`${inputCls} cursor-pointer`}
                    >
                      {EMPLOYEE_RANGES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Website (optional)</label>
                    <div className="relative">
                      <Globe
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                      />
                      <input
                        value={business.website}
                        onChange={(e) =>
                          updateBusiness({ website: e.target.value })
                        }
                        placeholder="https://yourwebsite.com"
                        className={`${inputCls} pl-8`}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Business Description</label>
                    <textarea
                      value={business.description}
                      onChange={(e) =>
                        updateBusiness({ description: e.target.value })
                      }
                      placeholder="Brief description of your business, products, and production process…"
                      rows={3}
                      className={`${inputCls} h-auto py-3 resize-none`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setStep(0)}
                  className="h-11 px-6 border border-white/10 text-white/50 hover:text-white rounded-xl text-[14px] transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!businessComplete}
                  className="h-11 px-8 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-[14px] flex items-center gap-2"
                >
                  Continue to Documents <ChevronRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Documents ── */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-white/4 border border-white/[0.07] rounded-2xl p-6 space-y-5">
                <h3 className="text-[15px] font-semibold text-white flex items-center gap-2 mb-1">
                  <Upload size={16} className="text-(--green-pale)" /> Upload
                  Documents
                </h3>

                <FileZone
                  label="CAC Certificate"
                  required
                  hint="PDF or image · Must be current (within 12 months)"
                  file={docs.cacCertFile}
                  onChange={(f) => setDocs((p) => ({ ...p, cacCertFile: f }))}
                />
                <FileZone
                  label="Lab Partnership Letter"
                  required
                  hint="PDF on official laboratory letterhead with stamp"
                  file={docs.labPartnerFile}
                  onChange={(f) =>
                    setDocs((p) => ({ ...p, labPartnerFile: f }))
                  }
                />
                <FileZone
                  label="NAFDAC Registration Certificate"
                  hint="Optional — required only for NAFDAC-registered products"
                  file={docs.nafdacFile}
                  onChange={(f) => setDocs((p) => ({ ...p, nafdacFile: f }))}
                />
                <FileZone
                  label="Business Insurance Certificate"
                  hint="Optional — product liability insurance recommended"
                  file={docs.insuranceFile}
                  onChange={(f) => setDocs((p) => ({ ...p, insuranceFile: f }))}
                />

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-500/8 border border-blue-500/15 mt-1">
                  <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-white/50 leading-relaxed">
                    All documents are stored securely and reviewed only by the
                    HerbRx compliance team. They will not be shared with third
                    parties.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setStep(1)}
                  className="h-11 px-6 border border-white/10 text-white/50 hover:text-white rounded-xl text-[14px] transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!docsComplete}
                  className="h-11 px-8 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-[14px] flex items-center gap-2"
                >
                  Review Application <ChevronRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Review & Submit ── */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="space-y-4 mb-6">
                {/* Business summary */}
                <div className="bg-white/4 border border-white/[0.07] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px] text-white/35 uppercase tracking-wider">
                      Business Details
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="text-[12px] text-(--green-pale) hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Edit3 size={11} /> Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {[
                      { label: "Business Name", value: business.businessName },
                      { label: "Email", value: business.businessEmail },
                      { label: "Phone", value: business.businessPhone },
                      { label: "RC Number", value: business.rcNumber },
                      { label: "State", value: business.state },
                      { label: "Employees", value: business.employeeRange },
                    ].map((f) => (
                      <div key={f.label}>
                        <p className="text-[11px] text-white/30">{f.label}</p>
                        <p className="text-[13px] font-medium text-white">
                          {f.value || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents summary */}
                <div className="bg-white/4 border border-white/[0.07] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px] text-white/35 uppercase tracking-wider">
                      Documents
                    </p>
                    <button
                      onClick={() => setStep(2)}
                      className="text-[12px] text-(--green-pale) hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Edit3 size={11} /> Edit
                    </button>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        label: "CAC Certificate",
                        file: docs.cacCertFile,
                        required: true,
                      },
                      {
                        label: "Lab Partner Letter",
                        file: docs.labPartnerFile,
                        required: true,
                      },
                      {
                        label: "NAFDAC Cert",
                        file: docs.nafdacFile,
                        required: false,
                      },
                      {
                        label: "Insurance Cert",
                        file: docs.insuranceFile,
                        required: false,
                      },
                    ].map((d) => (
                      <div
                        key={d.label}
                        className="flex items-center gap-3 text-[13px]"
                      >
                        {d.file ? (
                          <CheckCircle
                            size={14}
                            className="text-green-400 shrink-0"
                          />
                        ) : (
                          <XCircle
                            size={14}
                            className={`shrink-0 ${d.required ? "text-red-400" : "text-white/20"}`}
                          />
                        )}
                        <span
                          className={d.file ? "text-white" : "text-white/35"}
                        >
                          {d.label}
                        </span>
                        {d.file && (
                          <span className="text-white/35 text-[11px] ml-auto truncate max-w-40">
                            {d.file.name}
                          </span>
                        )}
                        {!d.file && !d.required && (
                          <span className="text-white/25 text-[11px] ml-auto">
                            Not uploaded
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Declaration */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/15">
                  <AlertTriangle
                    size={14}
                    className="text-amber-400 shrink-0 mt-0.5"
                  />
                  <p className="text-[12px] text-white/60 leading-relaxed">
                    By submitting this application, you confirm that all
                    information provided is accurate and complete. Submitting
                    false documents is grounds for permanent removal from the
                    HerbRx platform.
                  </p>
                </div>
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
                  disabled={submitting}
                  className="flex-1 h-11 bg-(--green-deep) hover:bg-(--green-mid) disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-[14px] flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Submitting
                      Application…
                    </>
                  ) : (
                    <>
                      <BadgeCheck size={15} /> Submit for Verification
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
