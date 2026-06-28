"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useProducerProducts, producerApi } from "@/hooks/dashboard-hooks";
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  Upload,
  ArrowRight,
  Loader2,
  BadgeCheck,
  FlaskConical,
  MoreVertical,
  Copy,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import type { ProductStatus } from "@/types";

// ── Types ───────
interface ManagedProduct {
  id: string;
  name: string;
  category: string;
  type: string;
  emoji: string;
  price: number;
  status: ProductStatus;
  flagReason?: string;
  batches: number;
  approvedBatches: number;
  stock: number;
  sales: number;
  revenue: number;
  createdAt: string;
  description: string;
  ingredients: string[];
  warnings: string[];
  nafdacNo?: string;
  inStore: boolean;
}

interface BatchSubmissionPayload {
  id?: string | number;
  reviewStatus: "APPROVED" | "PENDING" | "REJECTED" | string; // Type strictly if statuses are known
}

interface ProductMetaPayload {
  productType?: string;
  emoji?: string;
  price?: number;
  stock?: number;
  sales?: number;
  revenue?: number;
  ingredients?: string[];
  warnings?: string[];
  nafdacNo?: string;
  inStore?: boolean;
}
interface ApiProductPayload {
  id: string | number;
  name: string;
  category?: string | null;
  status: string;
  flagReason?: string | null;
  batchSubmissions?: BatchSubmissionPayload[] | null;
  createdAt?: string;
  description?: string | null;
  meta?: ProductMetaPayload | null;
}
type FormMode = "create" | "edit";
// type ViewMode = "grid" | "list";

// ── Mock data ─────
const INITIAL_PRODUCTS: ManagedProduct[] = [
  {
    id: "p1",
    name: "Moringa Gold Capsules",
    category: "Capsules",
    type: "Capsules",
    emoji: "🫚",
    price: 6200,
    status: "APPROVED",
    batches: 3,
    approvedBatches: 3,
    stock: 120,
    sales: 198,
    revenue: 1227600,
    createdAt: "2024-04-10",
    description:
      "Cold-pressed Moringa oleifera from certified farms. Rich in iron, calcium, and antioxidants.",
    ingredients: [
      "Moringa Oleifera Leaf Powder (500mg)",
      "Vegetable Cellulose (capsule)",
    ],
    warnings: [
      "May interact with thyroid medication",
      "High in vitamin K — consult doctor if on warfarin",
    ],
    nafdacNo: "A7-1234",
    inStore: true,
  },
  {
    id: "p2",
    name: "Bitter Leaf Tonic",
    category: "Tonic",
    type: "Tonic",
    emoji: "🌿",
    price: 3800,
    status: "PENDING_REVIEW",
    batches: 1,
    approvedBatches: 0,
    stock: 60,
    sales: 0,
    revenue: 0,
    createdAt: "2024-07-01",
    description:
      "Cold-extracted Vernonia amygdalina for blood sugar support and digestive health.",
    ingredients: [
      "Bitter Leaf Extract (250mg)",
      "Distilled Water",
      "Glycerin (preservative)",
    ],
    warnings: [
      "Consult doctor if diabetic — may lower blood glucose",
      "Not for use during pregnancy",
    ],
    nafdacNo: undefined,
    inStore: false,
  },
  {
    id: "p3",
    name: "Shea Butter Balm",
    category: "Topical",
    type: "Topical",
    emoji: "🧴",
    price: 2500,
    status: "DRAFT",
    batches: 0,
    approvedBatches: 0,
    stock: 0,
    sales: 0,
    revenue: 0,
    createdAt: "2024-07-15",
    description:
      "Raw unrefined shea butter from Northern Nigeria for skin hydration and relief.",
    ingredients: [
      "Unrefined Shea Butter (Vitellaria paradoxa)",
      "Coconut Oil",
      "Lavender Essential Oil",
    ],
    warnings: ["For external use only", "Patch test before use"],
    nafdacNo: undefined,
    inStore: false,
  },
  {
    id: "p4",
    name: "Zobo Immune Blend",
    category: "Beverage",
    type: "Powder",
    emoji: "🫐",
    price: 4200,
    status: "FLAGGED",
    batches: 2,
    approvedBatches: 1,
    stock: 35,
    sales: 42,
    revenue: 176400,
    createdAt: "2024-05-20",
    description:
      "Hibiscus-based immune support blend with Vitamin C and African herbs.",
    ingredients: [
      "Hibiscus Sabdariffa (Zobo)",
      "Moringa Leaf",
      "Ginger",
      "Lemon Peel",
      "Vitamin C (Ascorbic Acid)",
    ],
    warnings: [
      "High in antioxidants — consult doctor if on blood pressure medication",
    ],
    flagReason:
      "Microbial count exceeded limits in Batch B2024-11. Remediation required before relisting.",
    nafdacNo: undefined,
    inStore: false,
  },
];

const CATEGORIES = [
  "Capsules",
  "Tonic",
  "Topical",
  "Beverage",
  "Tea & Blend",
  "Tincture",
  "Powder",
  "Oil",
  "Other",
];

// ── Status config ────
const statusConfig: Record<
  ProductStatus,
  {
    badge: string;
    border: string;
    bg: string;
    icon: React.ReactNode;
    label: string;
    dot: string;
  }
> = {
  DRAFT: {
    badge: "bg-white/10 text-white/55",
    border: "border-white/[0.08]",
    bg: "bg-white/[0.03]",
    icon: <Edit3 size={12} />,
    label: "Draft",
    dot: "bg-white/30",
  },
  PENDING_REVIEW: {
    badge: "bg-amber-500/15 text-amber-400",
    border: "border-amber-500/15",
    bg: "bg-amber-500/5",
    icon: <Clock size={12} />,
    label: "Under Review",
    dot: "bg-amber-400",
  },
  APPROVED: {
    badge: "bg-green-500/15 text-green-400",
    border: "border-green-500/15",
    bg: "bg-green-500/5",
    icon: <CheckCircle size={12} />,
    label: "Approved",
    dot: "bg-green-400",
  },
  FLAGGED: {
    badge: "bg-red-500/15 text-red-400",
    border: "border-red-500/20",
    bg: "bg-red-500/5",
    icon: <AlertTriangle size={12} />,
    label: "Flagged",
    dot: "bg-red-400",
  },
  BANNED: {
    badge: "bg-red-900/30 text-red-500",
    border: "border-red-900/30",
    bg: "bg-red-900/10",
    icon: <XCircle size={12} />,
    label: "Banned",
    dot: "bg-red-600",
  },
};

const inputCls =
  "w-full h-10 px-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[var(--green-mid)] transition-all";
const labelCls =
  "block text-[12px] font-medium text-white/50 mb-1.5 uppercase tracking-wider";

// ── Helpers ─────
function fmt(n: number) {
  return `₦${n.toLocaleString()}`;
}

// ── Form component ─────
function ProductForm({
  mode,
  initial,
  onSave,
  onCancel,
}: {
  mode: FormMode;
  initial?: ManagedProduct | null;
  onSave: (p: Partial<ManagedProduct>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    category: initial?.category ?? "Capsules",
    type: initial?.type ?? "",
    emoji: initial?.emoji ?? "🌿",
    price: initial?.price ? String(initial.price) : "",
    description: initial?.description ?? "",
    nafdacNo: initial?.nafdacNo ?? "",
    ingredients: initial?.ingredients?.join("\n") ?? "",
    warnings: initial?.warnings?.join("\n") ?? "",
  });
  const [saving, setSaving] = useState(false);

  function update(patch: Partial<typeof form>) {
    setForm((p) => ({ ...p, ...patch }));
  }

  async function handleSave() {
    if (!form.name || !form.price || !form.description) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    onSave({
      name: form.name,
      category: form.category,
      type: form.type || form.category,
      emoji: form.emoji,
      price: Number(form.price),
      description: form.description,
      nafdacNo: form.nafdacNo || undefined,
      ingredients: form.ingredients
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      warnings: form.warnings
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setSaving(false);
  }

  const EMOJIS = [
    "🌿",
    "🫚",
    "🧴",
    "🫐",
    "🍃",
    "🌸",
    "🌾",
    "🥬",
    "🫖",
    "💊",
    "🧪",
    "🍋",
  ];

  return (
    <div className="bg-[#1A2030] border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
        <h3 className="text-[15px] font-semibold text-white flex items-center gap-2">
          <Package size={16} className="text-(--green-pale)" />
          {mode === "create" ? "Add New Product" : `Edit — ${initial?.name}`}
        </h3>
        <button onClick={onCancel} className="text-white/30 hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Emoji picker */}
        <div>
          <label className={labelCls}>Product Icon</label>
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => update({ emoji: e })}
                className={`w-10 h-10 text-[22px] rounded-xl border transition-all ${form.emoji === e ? "border-(--green-mid) bg-(--green-mid)/15" : "border-white/8 bg-white/4 hover:border-white/20"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Product Name *</label>
            <input
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="e.g. Moringa Gold Capsules"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Category *</label>
            <select
              value={form.category}
              onChange={(e) => update({ category: e.target.value })}
              className={`${inputCls} cursor-pointer`}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Price (₦) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => update({ price: e.target.value })}
              placeholder="e.g. 4500"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>NAFDAC Number</label>
            <input
              value={form.nafdacNo}
              onChange={(e) => update({ nafdacNo: e.target.value })}
              placeholder="e.g. A7-1234 (if registered)"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Product Type / Form</label>
            <input
              value={form.type}
              onChange={(e) => update({ type: e.target.value })}
              placeholder="e.g. Capsule, Tincture, Cream"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="A clear, accurate description of the product, its benefits, and sourcing…"
            rows={3}
            className={`${inputCls} h-auto py-3 resize-none`}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Ingredients (one per line)</label>
            <textarea
              value={form.ingredients}
              onChange={(e) => update({ ingredients: e.target.value })}
              placeholder={
                "Moringa Oleifera Leaf Powder (500mg)\nVegetable Cellulose (capsule)"
              }
              rows={4}
              className={`${inputCls} h-auto py-3 resize-none font-mono text-[12px]`}
            />
          </div>
          <div>
            <label className={labelCls}>Safety Warnings (one per line)</label>
            <textarea
              value={form.warnings}
              onChange={(e) => update({ warnings: e.target.value })}
              placeholder={
                "Consult doctor if pregnant\nNot for use alongside blood-thinners"
              }
              rows={4}
              className={`${inputCls} h-auto py-3 resize-none font-mono text-[12px]`}
            />
          </div>
        </div>

        {/* COA notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/15">
          <FlaskConical size={15} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-white mb-1">
              COA Submission Required for Approval
            </p>
            <p className="text-[12px] text-white/50 leading-relaxed">
              After saving your product, go to{" "}
              <strong className="text-white/70">Batch / COA</strong> to submit
              your Certificate of Analysis. Without an approved COA, this
              product cannot be listed in the marketplace.
            </p>
            <Link
              href="/dashboard/producer/batches"
              className="inline-flex items-center gap-1 text-[12px] text-amber-400 hover:text-white mt-1.5 transition-colors"
            >
              Go to Batch Submissions <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="h-11 px-6 border border-white/10 text-white/50 hover:text-white rounded-xl text-[14px] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name || !form.price || !form.description}
            className="h-11 px-8 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-35 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-[14px] flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving…
              </>
            ) : mode === "create" ? (
              <>
                <Plus size={14} /> Save Product
              </>
            ) : (
              <>
                <CheckCircle size={14} /> Update Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────
export function ProductsManagementPage() {
  const [products, setProducts] = useState<ManagedProduct[]>(INITIAL_PRODUCTS);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [editTarget, setEditTarget] = useState<ManagedProduct | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "ALL">(
    "ALL",
  );
  //   const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<string | null>(null);

  // Derived
  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);
  const approvedCount = products.filter((p) => p.status === "APPROVED").length;
  const flaggedCount = products.filter((p) => p.status === "FLAGGED").length;

  function openCreate() {
    setFormMode("create");
    setEditTarget(null);
    setExpanded(null);
  }
  function openEdit(p: ManagedProduct) {
    setEditTarget(p);
    setFormMode("edit");
    setMenuOpen(null);
    setExpanded(null);
  }
  function cancelForm() {
    setFormMode(null);
    setEditTarget(null);
  }

  const { data: productsData, mutate: refetchProducts } = useProducerProducts();

  // Sync API data on load
  if (
    productsData?.products &&
    productsData.products.length > 0 &&
    JSON.stringify(products) === JSON.stringify(INITIAL_PRODUCTS)
  ) {
    // Cast the array explicitly here 🫵
    const rawProducts = productsData.products as unknown as ApiProductPayload[];

    const shaped = rawProducts.map((p) => ({
      id: String(p.id),
      name: p.name,
      category: p.category ?? "",
      type: p.meta?.productType ?? p.category ?? "",
      emoji: p.meta?.emoji ?? "🌿",
      price: p.meta?.price ?? 0,
      status: p.status,
      flagReason: p.flagReason ?? null,
      batches: p.batchSubmissions?.length ?? 0,
      approvedBatches: (p.batchSubmissions ?? []).filter(
        (b) => b.reviewStatus === "APPROVED",
      ).length,
      stock: p.meta?.stock ?? 0,
      sales: p.meta?.sales ?? 0,
      revenue: p.meta?.revenue ?? 0,
      createdAt: p.createdAt?.split?.("T")[0] ?? "",
      description: p.description ?? "",
      ingredients: p.meta?.ingredients ?? [],
      warnings: p.meta?.warnings ?? [],
      nafdacNo: p.meta?.nafdacNo ?? undefined,
      inStore: p.meta?.inStore ?? false,
    })) as ManagedProduct[];
    setProducts(shaped);
  }

  function handleSave(data: Partial<ManagedProduct>) {
    if (formMode === "create") {
      const newProd: ManagedProduct = {
        id: `p${Date.now()}`,
        name: data.name!,
        category: data.category!,
        type: data.type!,
        emoji: data.emoji!,
        price: data.price!,
        status: "DRAFT",
        batches: 0,
        approvedBatches: 0,
        stock: 0,
        sales: 0,
        revenue: 0,
        createdAt: new Date().toISOString().split("T")[0],
        description: data.description!,
        ingredients: data.ingredients ?? [],
        warnings: data.warnings ?? [],
        nafdacNo: data.nafdacNo,
        inStore: false,
      };
      setProducts((prev) => [newProd, ...prev]);
      setSaved(newProd.id);
      // Sync to API
      producerApi
        .createProduct(data)
        .then(() => refetchProducts())
        .catch(() => {});
    } else if (formMode === "edit" && editTarget) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editTarget.id ? { ...p, ...data } : p)),
      );
      setSaved(editTarget.id);
    }
    setFormMode(null);
    setEditTarget(null);
    setTimeout(() => setSaved(null), 4000);
  }

  function duplicateProduct(p: ManagedProduct) {
    const dup: ManagedProduct = {
      ...p,
      id: `p${Date.now()}`,
      name: `${p.name} (Copy)`,
      status: "DRAFT",
      batches: 0,
      approvedBatches: 0,
      stock: 0,
      sales: 0,
      revenue: 0,
      inStore: false,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setProducts((prev) => [dup, ...prev]);
    setMenuOpen(null);
  }

  function deleteProduct(id: string) {
    setDeleted(id);
    setTimeout(() => {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleted(null);
    }, 400);
    setMenuOpen(null);
  }

  function toggleStore(id: string) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStore: !p.inStore } : p)),
    );
    setMenuOpen(null);
  }

  return (
    <DashboardShell
      heading="My Products"
      subheading="Manage your product listings, track approval status, and control marketplace visibility."
    >
      {/* Saved toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-5 flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20"
          >
            <CheckCircle size={16} className="text-green-400" />
            <p className="text-[14px] text-white">
              Product saved successfully.
            </p>
            <button
              onClick={() => setSaved(null)}
              className="ml-auto text-white/30 hover:text-white"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {[
          {
            label: "Total Products",
            value: String(products.length),
            color: "text-white",
            bg: "bg-white/[0.04] border-white/[0.07]",
          },
          {
            label: "Live in Store",
            value: String(approvedCount),
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/15",
          },
          {
            label: "Needs Action",
            value: String(
              flaggedCount +
                products.filter((p) => p.status === "DRAFT").length,
            ),
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/15",
          },
          {
            label: "Total Revenue",
            value: fmt(totalRevenue),
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

      {/* Form (create / edit) */}
      <AnimatePresence>
        {formMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-6"
          >
            <ProductForm
              mode={formMode}
              initial={editTarget}
              onSave={handleSave}
              onCancel={cancelForm}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full h-10 pl-9 pr-4 bg-white/5 border border-white/8 rounded-xl text-[14px] text-white placeholder:text-white/30 outline-none focus:border-(--green-mid) transition-colors"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5 flex-wrap">
          {(
            [
              "ALL",
              "DRAFT",
              "PENDING_REVIEW",
              "APPROVED",
              "FLAGGED",
              "BANNED",
            ] as const
          ).map((s) => {
            const cfg = s !== "ALL" ? statusConfig[s] : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all border ${statusFilter === s ? "bg-(--green-mid) text-white border-(--green-mid)" : "bg-white/4 text-white/45 hover:text-white border-white/[0.07]"}`}
              >
                {cfg?.icon}
                {s === "ALL"
                  ? "All"
                  : s === "PENDING_REVIEW"
                    ? "Under Review"
                    : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>

        {!formMode && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-(--green-mid) hover:bg-(--green-light) text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors ml-auto"
          >
            <Plus size={15} /> Add Product
          </button>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center h-56 rounded-2xl border border-white/[0.07] bg-white/2">
          <Package size={36} className="text-white/20 mb-3" />
          <p className="text-white/40 text-[14px] mb-3">
            {search || statusFilter !== "ALL"
              ? "No products match your filter"
              : "No products yet"}
          </p>
          {!search && statusFilter === "ALL" && (
            <button
              onClick={openCreate}
              className="text-[13px] text-(--green-pale) hover:text-white flex items-center gap-1"
            >
              Add your first product <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* Product list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((product, i) => {
            const cfg = statusConfig[product.status];
            const isExpanded = expanded === product.id;
            const isDeleting = deleted === product.id;
            const isMenuOpen = menuOpen === product.id;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: isDeleting ? 0 : 1,
                  x: isDeleting ? 20 : 0,
                }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-2xl border overflow-hidden transition-all ${cfg.border} ${isExpanded ? cfg.bg : "bg-white/3"}`}
              >
                {/* Main row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Emoji + status dot */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.07] flex items-center justify-center text-[24px]">
                      {product.emoji}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0F1117] ${cfg.dot}`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-[14px] font-semibold text-white truncate">
                        {product.name}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}
                      >
                        {cfg.icon} {cfg.label}
                      </span>
                      {product.inStore && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-(--green-mid)/15 text-(--green-pale)">
                          <Eye size={10} /> In Store
                        </span>
                      )}
                      {product.nafdacNo && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                          <BadgeCheck size={10} /> NAFDAC
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-white/40 flex-wrap">
                      <span>{product.category}</span>
                      <span>₦{product.price.toLocaleString()}</span>
                      <span className="flex items-center gap-1">
                        <FlaskConical size={11} /> {product.batches} batch
                        {product.batches !== 1 ? "es" : ""}
                      </span>
                      {product.sales > 0 && (
                        <span>
                          {product.sales} sold · {fmt(product.revenue)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() =>
                        setExpanded(isExpanded ? null : product.id)
                      }
                      className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all"
                      title="Details"
                    >
                      {isExpanded ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => openEdit(product)}
                      className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>

                    {/* Overflow menu */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMenuOpen(isMenuOpen ? null : product.id)
                        }
                        className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all"
                      >
                        <MoreVertical size={14} />
                      </button>
                      <AnimatePresence>
                        {isMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-full mt-1 w-48 bg-[#1E2535] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden"
                          >
                            {product.status === "APPROVED" && (
                              <button
                                onClick={() => toggleStore(product.id)}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-white/70 hover:text-white hover:bg-white/6 transition-colors"
                              >
                                {product.inStore ? (
                                  <>
                                    <EyeOff size={13} /> Remove from Store
                                  </>
                                ) : (
                                  <>
                                    <Eye size={13} /> List in Store
                                  </>
                                )}
                              </button>
                            )}
                            <Link
                              href="/dashboard/producer/batches"
                              className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-white/70 hover:text-white hover:bg-white/6 transition-colors"
                              onClick={() => setMenuOpen(null)}
                            >
                              <FlaskConical size={13} /> Submit COA
                            </Link>
                            <button
                              onClick={() => duplicateProduct(product)}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-white/70 hover:text-white hover:bg-white/6 transition-colors"
                            >
                              <Copy size={13} /> Duplicate
                            </button>
                            {product.inStore && (
                              <Link
                                href={`/store/${product.id}`}
                                target="_blank"
                                className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-white/70 hover:text-white hover:bg-white/6 transition-colors"
                                onClick={() => setMenuOpen(null)}
                              >
                                <ExternalLink size={13} /> View in Store
                              </Link>
                            )}
                            <div className="border-t border-white/[0.07] my-1" />
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={13} /> Delete Product
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Flagged warning */}
                {product.status === "FLAGGED" && product.flagReason && (
                  <div className="mx-5 mb-3 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/8 border border-red-500/15">
                    <AlertTriangle
                      size={14}
                      className="text-red-400 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-[12px] font-semibold text-white mb-0.5">
                        Admin Flag Reason
                      </p>
                      <p className="text-[12px] text-white/55 leading-relaxed">
                        {product.flagReason}
                      </p>
                      <Link
                        href="/dashboard/producer/batches"
                        className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-white mt-1.5 transition-colors"
                      >
                        <Upload size={11} /> Submit remediated COA{" "}
                        <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-white/6 pt-4">
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div>
                            <p className="text-[11px] text-white/35 uppercase tracking-wider mb-2">
                              Description
                            </p>
                            <p className="text-[13px] text-white/60 leading-relaxed">
                              {product.description}
                            </p>

                            <p className="text-[11px] text-white/35 uppercase tracking-wider mt-4 mb-2">
                              Ingredients
                            </p>
                            <ul className="space-y-1">
                              {product.ingredients.map((ing) => (
                                <li
                                  key={ing}
                                  className="flex items-start gap-2 text-[12px] text-white/55"
                                >
                                  <span className="text-(--green-pale) mt-0.5">
                                    •
                                  </span>{" "}
                                  {ing}
                                </li>
                              ))}
                            </ul>

                            {product.warnings.length > 0 && (
                              <>
                                <p className="text-[11px] text-white/35 uppercase tracking-wider mt-4 mb-2">
                                  Safety Warnings
                                </p>
                                <ul className="space-y-1">
                                  {product.warnings.map((w) => (
                                    <li
                                      key={w}
                                      className="flex items-start gap-2 text-[12px] text-white/55"
                                    >
                                      <AlertTriangle
                                        size={11}
                                        className="text-amber-400 shrink-0 mt-0.5"
                                      />{" "}
                                      {w}
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>

                          <div>
                            <p className="text-[11px] text-white/35 uppercase tracking-wider mb-3">
                              Performance
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                {
                                  label: "Units Sold",
                                  value: String(product.sales),
                                },
                                {
                                  label: "Revenue",
                                  value: fmt(product.revenue),
                                },
                                {
                                  label: "Stock",
                                  value: `${product.stock} units`,
                                },
                                {
                                  label: "Batches",
                                  value: `${product.approvedBatches}/${product.batches} approved`,
                                },
                                {
                                  label: "NAFDAC No.",
                                  value: product.nafdacNo ?? "Not registered",
                                },
                                { label: "Listed", value: product.createdAt },
                              ].map((s) => (
                                <div
                                  key={s.label}
                                  className="bg-white/4 border border-white/6 rounded-xl p-3"
                                >
                                  <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5">
                                    {s.label}
                                  </p>
                                  <p className="text-[13px] font-medium text-white">
                                    {s.value}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                onClick={() => openEdit(product)}
                                className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-lg bg-white/[0.07] text-white/70 hover:text-white hover:bg-white/12 transition-colors"
                              >
                                <Edit3 size={12} /> Edit Product
                              </button>
                              <Link
                                href="/dashboard/producer/batches"
                                className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                              >
                                <FlaskConical size={12} /> Submit COA
                              </Link>
                              {product.status === "APPROVED" && (
                                <button
                                  onClick={() => toggleStore(product.id)}
                                  className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-lg transition-colors ${product.inStore ? "bg-white/6 text-white/55 hover:text-white" : "bg-(--green-mid)/15 text-(--green-pale) hover:bg-(--green-mid)/25"}`}
                                >
                                  {product.inStore ? (
                                    <>
                                      <EyeOff size={12} /> Remove from Store
                                    </>
                                  ) : (
                                    <>
                                      <Eye size={12} /> List in Store
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom add button when list is long */}
      {products.length >= 3 && !formMode && (
        <div className="mt-5">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white border border-white/[0.07] hover:border-white/20 px-4 py-2.5 rounded-xl transition-all"
          >
            <Plus size={14} /> Add another product
          </button>
        </div>
      )}
    </DashboardShell>
  );
}
