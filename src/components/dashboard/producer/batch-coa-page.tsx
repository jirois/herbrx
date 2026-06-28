"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useProducerBatches, producerApi } from "@/hooks/dashboard-hooks";
import {
  FlaskConical,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Plus,
  X,
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  ArrowRight,
  Eye,
  Calendar,
  Building2,
  Hash,
  Beaker,
  Loader2,
} from "lucide-react";
import type { BatchStatus } from "@/types";

// ── Mock data ────
const MOCK_PRODUCTS = [
  { id: "p1", name: "Moringa Gold Capsules", category: "Capsules" },
  { id: "p2", name: "Bitter Leaf Tonic", category: "Tonic" },
  { id: "p3", name: "Zobo Immune Blend", category: "Beverage" },
  { id: "p4", name: "Shea Butter Balm", category: "Topical" },
];

const MOCK_BATCHES: MockBatch[] = [
  {
    id: "b1",
    productId: "p1",
    productName: "Moringa Gold Capsules",
    batchNo: "B2024-07",
    labName: "Spectralab NG",
    testedAt: "2024-06-12",
    reviewStatus: "APPROVED",
    reviewNotes:
      "All parameters within acceptable limits. Heavy metals screening passed.",
    coaFileName: "COA_MorgingGold_B2024-07.pdf",
    submittedAt: "2024-06-15",
    supplyChain: [
      {
        stage: "Farm",
        location: "Kwara State",
        date: "2024-04-10",
        verified: true,
      },
      {
        stage: "Drying",
        location: "Ilorin Processing Hub",
        date: "2024-04-18",
        verified: true,
      },
      {
        stage: "Milling",
        location: "Lagos Mill, Ikeja",
        date: "2024-04-28",
        verified: true,
      },
      {
        stage: "Encapsulation",
        location: "GreenHealth NG Factory",
        date: "2024-05-05",
        verified: true,
      },
      {
        stage: "Lab Testing",
        location: "Spectralab NG, Abuja",
        date: "2024-06-12",
        verified: true,
      },
      {
        stage: "Packaging",
        location: "GreenHealth NG Factory",
        date: "2024-06-20",
        verified: false,
      },
    ],
  },
  {
    id: "b2",
    productId: "p2",
    productName: "Bitter Leaf Tonic",
    batchNo: "B2024-10",
    labName: "PharmAnalytics Ltd",
    testedAt: "2024-07-01",
    reviewStatus: "UNDER_REVIEW",
    reviewNotes: null,
    coaFileName: "COA_BitterLeaf_B2024-10.pdf",
    submittedAt: "2024-07-03",
    supplyChain: [
      {
        stage: "Farm",
        location: "Ogun State",
        date: "2024-05-15",
        verified: true,
      },
      {
        stage: "Harvesting",
        location: "Ogun State Farm",
        date: "2024-05-20",
        verified: true,
      },
      {
        stage: "Processing",
        location: "Ibadan Facility",
        date: "2024-05-30",
        verified: true,
      },
      {
        stage: "Lab Testing",
        location: "PharmAnalytics, Lagos",
        date: "2024-07-01",
        verified: false,
      },
      {
        stage: "Packaging",
        location: "HerbalNaija Factory",
        date: "Pending",
        verified: false,
      },
    ],
  },
  {
    id: "b3",
    productId: "p3",
    productName: "Zobo Immune Blend",
    batchNo: "B2024-11",
    labName: "NaijaLab",
    testedAt: "2024-07-10",
    reviewStatus: "REJECTED",
    reviewNotes:
      "Microbial count exceeds acceptable limits (TPC: 8.2×10⁴ CFU/g vs limit of 1×10⁴). Resubmit after remediation.",
    coaFileName: "COA_ZoboImmune_B2024-11.pdf",
    submittedAt: "2024-07-12",
    supplyChain: [
      {
        stage: "Farm",
        location: "Kano State",
        date: "2024-06-01",
        verified: true,
      },
      {
        stage: "Processing",
        location: "Kano Facility",
        date: "2024-06-10",
        verified: true,
      },
      {
        stage: "Lab Testing",
        location: "NaijaLab, Abuja",
        date: "2024-07-10",
        verified: true,
      },
      { stage: "Packaging", location: "—", date: "—", verified: false },
    ],
  },
];

// ── Types ──────
interface SupplyChainStage {
  stage: string;
  location: string;
  date: string;
  verified: boolean;
}

interface Product {
  id: string;
  name: string;
  category: string;
}

interface MockBatch {
  id: string;
  productId: string;
  productName: string;
  batchNo: string;
  labName: string;
  testedAt: string;
  reviewStatus: BatchStatus;
  reviewNotes: string | null;
  coaFileName: string;
  submittedAt: string;
  supplyChain: SupplyChainStage[];
}

type FormStep = "product" | "batch" | "upload" | "chain" | "review";

interface FormData {
  productId: string;
  batchNo: string;
  labName: string;
  testedAt: string;
  expiryDate: string;
  quantity: string;
  unit: string;
  notes: string;
  coaFile: File | null;
  chainStages: { stage: string; location: string; date: string }[];
}

interface ApiBatchPayload {
  id: string | number;
  productId: string | number;
  batchNo: string;
  reviewStatus: string;
  createdAt: string | Date;
  productName?: string | null;
  product?: {
    name: string;
  } | null;
  labName?: string | null;
  testedAt?: string | Date | null;
  reviewNotes?: string | null;
  coaFileUrl?: string | null;
}

// ── Status config ────
const statusConfig: Record<
  BatchStatus,
  {
    badge: string;
    icon: React.ReactNode;
    label: string;
    border: string;
  }
> = {
  SUBMITTED: {
    badge: "bg-white/10 text-white/60",
    icon: <Clock size={13} />,
    label: "Submitted",
    border: "border-white/[0.08]",
  },
  UNDER_REVIEW: {
    badge: "bg-blue-500/15 text-blue-400",
    icon: <Eye size={13} />,
    label: "Under Review",
    border: "border-blue-500/15",
  },
  APPROVED: {
    badge: "bg-green-500/15 text-green-400",
    icon: <CheckCircle size={13} />,
    label: "Approved",
    border: "border-green-500/15",
  },
  REJECTED: {
    badge: "bg-red-500/15 text-red-400",
    icon: <XCircle size={13} />,
    label: "Rejected",
    border: "border-red-500/15",
  },
};

const STEPS: { key: FormStep; label: string; icon: React.ReactNode }[] = [
  { key: "product", label: "Select Product", icon: <FlaskConical size={14} /> },
  { key: "batch", label: "Batch Details", icon: <Hash size={14} /> },
  { key: "upload", label: "Upload COA", icon: <Upload size={14} /> },
  { key: "chain", label: "Supply Chain", icon: <Beaker size={14} /> },
  { key: "review", label: "Review & Submit", icon: <CheckCircle size={14} /> },
];

const DEFAULT_CHAIN = [
  { stage: "Farm / Harvest", location: "", date: "" },
  { stage: "Processing", location: "", date: "" },
  { stage: "Lab Testing", location: "", date: "" },
  { stage: "Packaging", location: "", date: "" },
];

const inputCls =
  "w-full h-10 px-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[var(--green-mid)] focus:bg-white/[0.08] transition-all";
const labelCls =
  "block text-[12px] font-medium text-white/50 mb-1.5 uppercase tracking-wider";

// ── Main component ──
export function BatchCOAPage() {
  const [view, setView] = useState<"list" | "new">("list");
  const [step, setStep] = useState<FormStep>("product");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [batches, setBatches] = useState<MockBatch[]>(MOCK_BATCHES);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState<FormData>({
    productId: "",
    batchNo: "",
    labName: "",
    testedAt: "",
    expiryDate: "",
    quantity: "",
    unit: "kg",
    notes: "",
    coaFile: null,
    chainStages: DEFAULT_CHAIN.map((s) => ({ ...s })),
  });

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const selectedProduct = MOCK_PRODUCTS.find((p) => p.id === form.productId);

  function updateForm(patch: Partial<FormData>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function updateChainStage(
    i: number,
    field: "stage" | "location" | "date",
    value: string,
  ) {
    const updated = [...form.chainStages];
    updated[i] = { ...updated[i], [field]: value };
    updateForm({ chainStages: updated });
  }

  function addChainStage() {
    updateForm({
      chainStages: [...form.chainStages, { stage: "", location: "", date: "" }],
    });
  }

  function removeChainStage(i: number) {
    updateForm({ chainStages: form.chainStages.filter((_, idx) => idx !== i) });
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") updateForm({ coaFile: file });
  }

  const { data: batchData, mutate: refetchBatches } = useProducerBatches();

  // Sync real batches from API into local state on first load
  if (
    batchData?.batches &&
    batchData.batches.length > 0 &&
    JSON.stringify(batches) === JSON.stringify(MOCK_BATCHES)
  ) {
    const rawBatches = batchData.batches as unknown as ApiBatchPayload[];

    const shaped = rawBatches.map((b) => ({
      id: String(b.id),
      productId: String(b.productId),
      productName: b.productName ?? b.product?.name ?? "",
      batchNo: b.batchNo,
      labName: b.labName ?? "",
      testedAt: b.testedAt
        ? new Date(b.testedAt).toISOString().split("T")[0]
        : "",
      reviewStatus: b.reviewStatus,
      reviewNotes: b.reviewNotes ?? null,
      coaFileName: b.coaFileUrl?.split("/").pop() ?? "COA_document.pdf",
      submittedAt: b.createdAt
        ? new Date(b.createdAt).toISOString().split("T")[0]
        : "",
      supplyChain: [],
    })) as MockBatch[];

    // 3. Commit to your React state tracker
    setBatches(shaped);
  }

  // Sync real products for the submission form
  const formProducts = batchData?.products ?? MOCK_PRODUCTS;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      // In production, upload COA file to Cloudinary/S3 first, get URL back
      const coaFileUrl = form.coaFile
        ? `https://cdn.herbrx.ng/coa/${Date.now()}-${form.coaFile.name}`
        : "";

      await producerApi.submitBatch({
        productId: form.productId,
        batchNo: form.batchNo,
        labName: form.labName,
        testedAt: form.testedAt,
        coaFileUrl,
        chainStages: form.chainStages,
      });
      refetchBatches();
    } catch {
      // Optimistic fallback — still show success locally
    }
    const newBatch: MockBatch = {
      id: `b${Date.now()}`,
      productId: form.productId,
      productName: selectedProduct?.name ?? "",
      batchNo: form.batchNo,
      labName: form.labName,
      testedAt: form.testedAt,
      reviewStatus: "SUBMITTED",
      reviewNotes: null,
      coaFileName: form.coaFile?.name ?? "COA_document.pdf",
      submittedAt: new Date().toISOString().split("T")[0],
      supplyChain: form.chainStages.map((s) => ({ ...s, verified: false })),
    };
    setBatches((prev) => [newBatch, ...prev]);
    setSubmitting(false);
    setSubmitted(true);
  }

  // function resetForm() {
  //   setForm({
  //     productId: "",
  //     batchNo: "",
  //     labName: "",
  //     testedAt: "",
  //     expiryDate: "",
  //     quantity: "",
  //     unit: "kg",
  //     notes: "",
  //     coaFile: null,
  //     chainStages: DEFAULT_CHAIN.map((s) => ({ ...s })),
  //   });
  //   setStep("product");
  //   setSubmitted(false);
  //   setView("list");
  // }

  // ── Render step content ────
  function renderStep() {
    if (step === "product")
      return (
        <div>
          <p className="text-[14px] text-white/50 mb-5">
            Select the product this batch belongs to.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {(formProducts as Product[]).map((p: Product) => (
              <button
                key={p.id}
                onClick={() => updateForm({ productId: p.id })}
                className={`text-left p-4 rounded-2xl border transition-all ${form.productId === p.id ? "border-(--green-mid) bg-(--green-mid)/10" : "border-white/8 bg-white/3 hover:border-white/20"}`}
              >
                <div className="text-[22px] mb-2">🌿</div>
                <p className="text-[14px] font-semibold text-white">{p.name}</p>
                <p className="text-[12px] text-white/40 mt-0.5">{p.category}</p>
                {form.productId === p.id && (
                  <CheckCircle size={16} className="text-(--green-pale) mt-2" />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep("batch")}
            disabled={!form.productId}
            className="mt-6 h-11 px-8 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-[14px]"
          >
            Continue →
          </button>
        </div>
      );

    if (step === "batch")
      return (
        <div className="space-y-4">
          <p className="text-[14px] text-white/50 mb-5">
            Enter the laboratory and batch details for{" "}
            <span className="text-white font-medium">
              {selectedProduct?.name}
            </span>
            .
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Batch Number *</label>
              <div className="relative">
                <Hash
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  value={form.batchNo}
                  onChange={(e) => updateForm({ batchNo: e.target.value })}
                  placeholder="e.g. B2024-12"
                  className={`${inputCls} pl-8`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Testing Laboratory *</label>
              <div className="relative">
                <Building2
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  value={form.labName}
                  onChange={(e) => updateForm({ labName: e.target.value })}
                  placeholder="e.g. Spectralab NG"
                  className={`${inputCls} pl-8`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Date Tested *</label>
              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="date"
                  value={form.testedAt}
                  onChange={(e) => updateForm({ testedAt: e.target.value })}
                  className={`${inputCls} pl-8`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Expiry Date</label>
              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => updateForm({ expiryDate: e.target.value })}
                  className={`${inputCls} pl-8`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Batch Quantity</label>
              <div className="flex gap-2">
                <input
                  value={form.quantity}
                  onChange={(e) => updateForm({ quantity: e.target.value })}
                  placeholder="e.g. 500"
                  className={`${inputCls} flex-1`}
                />
                <select
                  value={form.unit}
                  onChange={(e) => updateForm({ unit: e.target.value })}
                  className="h-10 px-3 bg-white/6 border border-white/10 rounded-xl text-[14px] text-white outline-none focus:border-(--green-mid)"
                >
                  {["kg", "g", "L", "mL", "units"].map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Additional Notes</label>
              <input
                value={form.notes}
                onChange={(e) => updateForm({ notes: e.target.value })}
                placeholder="Optional"
                className={inputCls}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep("product")}
              className="h-11 px-6 border border-white/10 text-white/60 hover:text-white rounded-xl text-[14px] transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep("upload")}
              disabled={!form.batchNo || !form.labName || !form.testedAt}
              className="h-11 px-8 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-[14px]"
            >
              Continue →
            </button>
          </div>
        </div>
      );

    if (step === "upload")
      return (
        <div>
          <p className="text-[14px] text-white/50 mb-5">
            Upload the Certificate of Analysis (COA) from your testing
            laboratory. PDF only, max 10MB.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${dragOver ? "border-(--green-mid) bg-(--green-mid)/10" : form.coaFile ? "border-green-500/40 bg-green-500/5" : "border-white/12 bg-white/2 hover:border-white/25"}`}
            onClick={() => document.getElementById("coa-file-input")?.click()}
          >
            <input
              id="coa-file-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) updateForm({ coaFile: f });
              }}
            />

            {form.coaFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center">
                  <FileText size={24} className="text-green-400" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white">
                    {form.coaFile.name}
                  </p>
                  <p className="text-[12px] text-white/40 mt-0.5">
                    {(form.coaFile.size / 1024).toFixed(0)} KB · PDF
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateForm({ coaFile: null });
                  }}
                  className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-red-400 transition-colors"
                >
                  <X size={12} /> Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/6 flex items-center justify-center">
                  <Upload size={24} className="text-white/30" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white">
                    Drop COA PDF here
                  </p>
                  <p className="text-[13px] text-white/40 mt-1">
                    or click to browse files
                  </p>
                </div>
                <p className="text-[11px] text-white/25">PDF only · Max 10MB</p>
              </div>
            )}
          </div>

          {/* COA checklist */}
          <div className="mt-5 p-4 rounded-2xl bg-blue-500/8 border border-blue-500/15">
            <div className="flex items-start gap-2.5">
              <Info size={15} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-white mb-2">
                  Your COA must include
                </p>
                <ul className="space-y-1">
                  {[
                    "Heavy metals screening (Lead, Mercury, Cadmium, Arsenic)",
                    "Microbial count (TPC, Yeast & Mould, E. coli, Salmonella)",
                    "Active compound/marker identification",
                    "Moisture content & pH (where applicable)",
                    "Lab accreditation number and test date",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[12px] text-white/50"
                    >
                      <CheckCircle
                        size={11}
                        className="text-blue-400 shrink-0 mt-0.5"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep("batch")}
              className="h-11 px-6 border border-white/10 text-white/60 hover:text-white rounded-xl text-[14px] transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep("chain")}
              disabled={!form.coaFile}
              className="h-11 px-8 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-[14px]"
            >
              Continue →
            </button>
          </div>
        </div>
      );

    if (step === "chain")
      return (
        <div>
          <div className="flex items-start gap-3 mb-5 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/15">
            <Info size={15} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-white mb-1">
                Supply Chain Traceability
              </p>
              <p className="text-[12px] text-white/50 leading-relaxed">
                Document each stage from farm to bottle. This creates a
                tamper-proof digital log that builds trust with consumers and
                regulators. Future update: blockchain anchoring.
              </p>
            </div>
          </div>

          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-4.75 top-6 bottom-6 w-0.5 bg-white/6" />

            <div className="space-y-3">
              {form.chainStages.map((stage, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4 items-start"
                >
                  {/* Node */}
                  <div className="relative z-10 w-10 h-10 rounded-full bg-[#1E2535] border-2 border-white/10 flex items-center justify-center shrink-0 text-[12px] font-bold text-white/50">
                    {i + 1}
                  </div>

                  <div className="flex-1 bg-white/4 border border-white/[0.07] rounded-2xl p-4">
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls}>Stage</label>
                        <input
                          value={stage.stage}
                          onChange={(e) =>
                            updateChainStage(i, "stage", e.target.value)
                          }
                          placeholder="e.g. Harvesting"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Location</label>
                        <input
                          value={stage.location}
                          onChange={(e) =>
                            updateChainStage(i, "location", e.target.value)
                          }
                          placeholder="e.g. Kwara State"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Date</label>
                        <input
                          type="date"
                          value={stage.date}
                          onChange={(e) =>
                            updateChainStage(i, "date", e.target.value)
                          }
                          className={inputCls}
                        />
                      </div>
                    </div>
                    {form.chainStages.length > 2 && (
                      <button
                        onClick={() => removeChainStage(i)}
                        className="mt-3 flex items-center gap-1 text-[11px] text-white/30 hover:text-red-400 transition-colors"
                      >
                        <X size={11} /> Remove stage
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <button
            onClick={addChainStage}
            className="mt-4 flex items-center gap-2 text-[13px] text-(--green-pale) hover:text-white border border-white/8 hover:border-white/20 px-4 py-2.5 rounded-xl transition-all"
          >
            <Plus size={14} /> Add another stage
          </button>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep("upload")}
              className="h-11 px-6 border border-white/10 text-white/60 hover:text-white rounded-xl text-[14px] transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep("review")}
              className="h-11 px-8 bg-(--green-mid) hover:bg-(--green-light) text-white font-medium rounded-xl transition-colors text-[14px]"
            >
              Review Submission →
            </button>
          </div>
        </div>
      );

    if (step === "review")
      return (
        <div>
          <p className="text-[14px] text-white/50 mb-5">
            Review everything before submitting. Your batch will be queued for
            HerbRx admin review.
          </p>

          <div className="space-y-4 mb-6">
            {/* Product */}
            <div className="bg-white/4 border border-white/[0.07] rounded-2xl p-5">
              <p className="text-[11px] text-white/35 uppercase tracking-wider mb-2">
                Product
              </p>
              <p className="text-[16px] font-semibold text-white">
                {selectedProduct?.name}
              </p>
              <p className="text-[13px] text-white/40">
                {selectedProduct?.category}
              </p>
            </div>

            {/* Batch details */}
            <div className="bg-white/4 border border-white/[0.07] rounded-2xl p-5">
              <p className="text-[11px] text-white/35 uppercase tracking-wider mb-3">
                Batch Details
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Batch No.", value: form.batchNo },
                  { label: "Laboratory", value: form.labName },
                  { label: "Date Tested", value: form.testedAt || "—" },
                  { label: "Expiry", value: form.expiryDate || "—" },
                  {
                    label: "Quantity",
                    value: form.quantity
                      ? `${form.quantity} ${form.unit}`
                      : "—",
                  },
                  { label: "Notes", value: form.notes || "—" },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-[11px] text-white/35">{f.label}</p>
                    <p className="text-[13px] text-white font-medium">
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* COA */}
            <div className="bg-white/4 border border-white/[0.07] rounded-2xl p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-[11px] text-white/35 uppercase tracking-wider">
                  COA Document
                </p>
                <p className="text-[14px] font-medium text-white">
                  {form.coaFile?.name}
                </p>
                <p className="text-[12px] text-white/35">
                  {form.coaFile
                    ? `${(form.coaFile.size / 1024).toFixed(0)} KB`
                    : ""}
                </p>
              </div>
            </div>

            {/* Supply chain summary */}
            <div className="bg-white/4 border border-white/[0.07] rounded-2xl p-5">
              <p className="text-[11px] text-white/35 uppercase tracking-wider mb-3">
                Supply Chain — {form.chainStages.length} stages
              </p>
              <div className="space-y-2">
                {form.chainStages.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-[13px]">
                    <span className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center text-[10px] text-white/50 shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-white font-medium w-32 shrink-0">
                      {s.stage || "—"}
                    </span>
                    <span className="text-white/40">{s.location || "—"}</span>
                    <span className="text-white/25 ml-auto">
                      {s.date || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("chain")}
              className="h-11 px-6 border border-white/10 text-white/60 hover:text-white rounded-xl text-[14px] transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="h-11 px-8 bg-(--green-deep) hover:bg-(--green-mid) disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-[14px] flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Submitting…
                </>
              ) : (
                <>Submit for Review ✓</>
              )}
            </button>
          </div>
        </div>
      );
  }

  // ── Supply chain timeline (for batch detail expand) ─────
  function SupplyChainTimeline({ stages }: { stages: SupplyChainStage[] }) {
    return (
      <div className="mt-4 pt-4 border-t border-white/6">
        <p className="text-[11px] text-white/35 uppercase tracking-wider mb-4">
          Supply Chain Log
        </p>
        <div className="relative">
          <div className="absolute left-3.75 top-2 bottom-2 w-0.5 bg-white/6" />
          <div className="space-y-4">
            {stages.map((s, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div
                  className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${s.verified ? "border-green-500/50 bg-green-500/10" : "border-white/10 bg-[#1E2535]"}`}
                >
                  {s.verified ? (
                    <CheckCircle size={13} className="text-green-400" />
                  ) : (
                    <Clock size={13} className="text-white/30" />
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-white">
                      {s.stage}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.verified ? "bg-green-500/10 text-green-400" : "bg-white/6 text-white/30"}`}
                    >
                      {s.verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                  <p className="text-[12px] text-white/40">{s.location}</p>
                  <p className="text-[11px] text-white/25">{s.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ────
  return (
    <DashboardShell
      heading="Batch & COA Submissions"
      subheading="Submit lab Certificates of Analysis and track your batch review status."
    >
      {/* Success state */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-start gap-4 p-5 rounded-2xl bg-green-500/10 border border-green-500/20"
          >
            <CheckCircle size={22} className="text-green-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-white">
                Batch submitted successfully!
              </p>
              <p className="text-[13px] text-white/50 mt-0.5">
                Your batch{" "}
                <span className="text-white font-medium">
                  {batches[0]?.batchNo}
                </span>{" "}
                is now in the review queue. HerbRx admins typically review
                within 3–5 business days.
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="text-white/30 hover:text-white"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {view === "list" ? (
        <>
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {(
                  [
                    "SUBMITTED",
                    "UNDER_REVIEW",
                    "APPROVED",
                    "REJECTED",
                  ] as BatchStatus[]
                ).map((s) => {
                  const count = batches.filter(
                    (b) => b.reviewStatus === s,
                  ).length;
                  const cfg = statusConfig[s];
                  return count > 0 ? (
                    <span
                      key={s}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${cfg.badge}`}
                    >
                      {cfg.icon} {count} {cfg.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            <button
              onClick={() => {
                setView("new");
                setSubmitted(false);
              }}
              className="inline-flex items-center gap-2 bg-(--green-mid) hover:bg-(--green-light) text-white text-[13px] font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <Plus size={15} /> New Submission
            </button>
          </div>

          {/* Batch cards */}
          {batches.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-white/[0.07] bg-white/2">
              <FlaskConical size={36} className="text-white/20 mb-3" />
              <p className="text-white/40 text-[14px]">
                No batch submissions yet
              </p>
              <button
                onClick={() => setView("new")}
                className="mt-3 text-[13px] text-(--green-pale) hover:text-white flex items-center gap-1"
              >
                Submit your first batch <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {batches.map((batch, i) => {
                const cfg = statusConfig[batch.reviewStatus];
                const isExpanded = expanded === batch.id;
                return (
                  <motion.div
                    key={batch.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl border overflow-hidden transition-colors ${cfg.border} bg-white/3`}
                  >
                    {/* Header row */}
                    <button
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/3 transition-colors"
                      onClick={() => setExpanded(isExpanded ? null : batch.id)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center shrink-0">
                        <FlaskConical size={18} className="text-white/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="text-[14px] font-semibold text-white">
                            {batch.productName}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}
                          >
                            {cfg.icon} {cfg.label}
                          </span>
                        </div>
                        <p className="text-[12px] text-white/40">
                          Batch {batch.batchNo} · {batch.labName} · Submitted{" "}
                          {batch.submittedAt}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden sm:flex items-center gap-1.5 text-[12px] text-white/30">
                          <FileText size={13} /> {batch.coaFileName}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-white/40" />
                        ) : (
                          <ChevronDown size={16} className="text-white/40" />
                        )}
                      </div>
                    </button>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5">
                            {/* Review notes */}
                            {batch.reviewNotes && (
                              <div
                                className={`flex items-start gap-3 p-4 rounded-xl mb-4 ${batch.reviewStatus === "REJECTED" ? "bg-red-500/8 border border-red-500/15" : "bg-green-500/8 border border-green-500/15"}`}
                              >
                                {batch.reviewStatus === "REJECTED" ? (
                                  <AlertTriangle
                                    size={15}
                                    className="text-red-400 shrink-0 mt-0.5"
                                  />
                                ) : (
                                  <CheckCircle
                                    size={15}
                                    className="text-green-400 shrink-0 mt-0.5"
                                  />
                                )}
                                <div>
                                  <p className="text-[12px] font-semibold text-white mb-0.5">
                                    Reviewer Notes
                                  </p>
                                  <p className="text-[13px] text-white/60 leading-relaxed">
                                    {batch.reviewNotes}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* COA link */}
                            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/4 border border-white/[0.07] mb-4">
                              <FileText size={16} className="text-white/40" />
                              <span className="text-[13px] text-white flex-1">
                                {batch.coaFileName}
                              </span>
                              <button className="flex items-center gap-1.5 text-[12px] text-(--green-pale) hover:text-white transition-colors">
                                <ExternalLink size={12} /> View COA
                              </button>
                            </div>

                            {/* Supply chain */}
                            <SupplyChainTimeline stages={batch.supplyChain} />

                            {/* Rejected: resubmit action */}
                            {batch.reviewStatus === "REJECTED" && (
                              <button
                                onClick={() => {
                                  setView("new");
                                  setStep("upload");
                                }}
                                className="mt-5 inline-flex items-center gap-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-[13px] font-medium px-4 py-2.5 rounded-xl transition-colors"
                              >
                                <Upload size={14} /> Resubmit with Updated COA
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* ── New submission wizard ── */
        <div className="max-w-2xl">
          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
            {STEPS.map((s, i) => {
              const idx = STEPS.findIndex((x) => x.key === step);
              const done = i < idx;
              const active = i === idx;
              return (
                <div key={s.key} className="flex items-center shrink-0">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium transition-all ${active ? "bg-(--green-mid) text-white" : done ? "text-green-400" : "text-white/30"}`}
                  >
                    {done ? <CheckCircle size={13} /> : s.icon}
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`w-6 h-0.5 mx-1 ${done ? "bg-green-500/40" : "bg-white/6"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step card */}
          <div className="bg-white/3 border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-(--green-mid)/20 flex items-center justify-center">
                {STEPS[stepIndex]?.icon}
              </div>
              <h2 className="text-[16px] font-semibold text-white">
                {STEPS[stepIndex]?.label}
              </h2>
              <span className="text-[12px] text-white/30 ml-auto">
                Step {stepIndex + 1} of {STEPS.length}
              </span>
            </div>
            {renderStep()}
          </div>

          <button
            onClick={() => {
              setView("list");
              setStep("product");
            }}
            className="mt-4 flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white transition-colors"
          >
            <X size={13} /> Cancel and go back to submissions
          </button>
        </div>
      )}
    </DashboardShell>
  );
}
