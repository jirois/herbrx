"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  useAdminConsultants,
  consultantAdminApi,
} from "@/hooks/dashboard-hooks";
import { EMAIL_RE } from "@/lib/vaildation";
import {
  Stethoscope,
  Plus,
  X,
  Search,
  CheckCircle2,
  ShieldOff,
  ShieldCheck,
  Star,
  Wallet,
  Users,
  Copy,
  Check,
  Loader2,
  Pencil,
} from "lucide-react";

const SPECIALIZATIONS = [
  { value: "HERBALIST", label: "Herbalist" },
  { value: "NATUROPATH", label: "Naturopath" },
  { value: "TOXICOLOGIST", label: "Toxicologist" },
  { value: "PHARMACIST", label: "Pharmacist" },
];

const inputCls =
  "w-full h-10 px-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[var(--green-mid)] transition-all";
const naira = (kobo?: number | null) =>
  kobo == null
    ? "—"
    : `₦${(kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

type Consultant = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  specialization: "HERBALIST" | "NATUROPATH" | "TOXICOLOGIST" | "PHARMACIST";
  bio?: string | null;
  licenseNumber?: string | null;
  yearsExperience?: number | null;
  status: "ACTIVE" | "INACTIVE";
  completedConsultations: number;
  avgRating?: number | null;
  totalEarningsKobo?: number | null;
};

// ── Create consultant modal ────────
function CreateConsultantModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "HERBALIST",
    bio: "",
    licenseNumber: "",
    yearsExperience: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{
    email: string;
    tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!EMAIL_RE.test(form.email.trim()))
      e.email = "Enter a valid email address.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await consultantAdminApi.create({
        ...form,
        yearsExperience: form.yearsExperience
          ? Number(form.yearsExperience)
          : undefined,
      });
      setResult(res.credentials);
      onCreated();
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err : new Error("Failed to create consultant.");
      setErrors({ form: error.message ?? "Failed to create consultant." });
    } finally {
      setSaving(false);
    }
  }

  function copyCreds() {
    if (!result) return;
    navigator.clipboard.writeText(
      `Email: ${result.email}\nTemporary password: ${result.tempPassword}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !result) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="bg-[#1A2030] border border-white/10 rounded-2xl w-full max-w-lg my-4 overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h3 className="text-[15px] font-semibold text-white">
            {result ? "Consultant Created" : "Add New Consultant"}
          </h3>
          <button onClick={onClose} className="text-white/30 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {result ? (
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle2
                size={16}
                className="text-green-400 shrink-0 mt-0.5"
              />
              <p className="text-[12px] text-green-300">
                Account created. Share these credentials with the consultant
                directly - they won&apos;t be shown again.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/4 border border-white/8 space-y-2">
              <div>
                <p className="text-[11px] text-white/35 uppercase tracking-wider">
                  Email
                </p>
                <p className="text-[13px] text-white font-mono">
                  {result.email}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-white/35 uppercase tracking-wider">
                  Temporary Password
                </p>
                <p className="text-[13px] text-white font-mono">
                  {result.tempPassword}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyCreds}
                className="flex-1 h-10 border border-white/1 text-white/70 hover:text-white rounded-xl text-[13px] transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check size={13} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copy Credentials
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="flex-1 h-10 bg-(--green-mid) hover:bg-(--green-light) text-white font-semibold rounded-xl text-[13px] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {errors.form && (
              <p className="text-[12px] text-red-400">{errors.form}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
                  First Name
                </p>
                <input
                  className={inputCls}
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                />
                {errors.firstName && (
                  <p className="text-[11px] text-red-400 mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
                  Last Name
                </p>
                <input
                  className={inputCls}
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                />
                {errors.lastName && (
                  <p className="text-[11px] text-red-400 mt-1">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
                Email
              </p>
              <input
                className={inputCls}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="consultant@herbrx.ng"
              />
              {errors.email && (
                <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
                Phone (optional)
              </p>
              <input
                className={inputCls}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="0803 123 4567"
              />
            </div>
            <div>
              <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
                Specialization
              </p>
              <select
                className={inputCls}
                value={form.specialization}
                onChange={(e) => set("specialization", e.target.value)}
              >
                {SPECIALIZATIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
                  License No. (optional)
                </p>
                <input
                  className={inputCls}
                  value={form.licenseNumber}
                  onChange={(e) => set("licenseNumber", e.target.value)}
                />
              </div>
              <div>
                <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
                  Years Experience
                </p>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.yearsExperience}
                  onChange={(e) => set("yearsExperience", e.target.value)}
                />
              </div>
            </div>
            <div>
              <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
                Bio (optional)
              </p>
              <textarea
                rows={3}
                className={`${inputCls} h-auto py-3 resize-none`}
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
              />
            </div>
            <button
              onClick={submit}
              disabled={saving}
              className="w-full h-11 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Creating…
                </>
              ) : (
                "Create Consultant Account"
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Edit consultant modal ───────
function EditConsultantModal({
  consultant,
  onClose,
  onSaved,
}: {
  consultant: Consultant;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    specialization: consultant.specialization,
    bio: consultant.bio ?? "",
    licenseNumber: consultant.licenseNumber ?? "",
    yearsExperience: consultant.yearsExperience?.toString() ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await consultantAdminApi.update({
        consultantId: consultant.id,
        ...form,
        yearsExperience: form.yearsExperience
          ? Number(form.yearsExperience)
          : null,
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

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
        exit={{ opacity: 0 }}
        className="bg-[#1A2030] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h3 className="text-[15px] font-semibold text-white">
            Edit {consultant.firstName} {consultant.lastName}
          </h3>
          <button onClick={onClose} className="text-white/30 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
              Specialization
            </p>
            <select
              className={inputCls}
              value={form.specialization}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  specialization: e.target
                    .value as Consultant["specialization"],
                }))
              }
            >
              {SPECIALIZATIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
                License No.
              </p>
              <input
                className={inputCls}
                value={form.licenseNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, licenseNumber: e.target.value }))
                }
              />
            </div>
            <div>
              <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
                Years Experience
              </p>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.yearsExperience}
                onChange={(e) =>
                  setForm((f) => ({ ...f, yearsExperience: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
              Bio
            </p>
            <textarea
              rows={3}
              className={`${inputCls} h-auto py-3 resize-none`}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="w-full h-11 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Deactivate confirm modal ──────────────
function DeactivateModal({
  consultant,
  onClose,
  onConfirmed,
}: {
  consultant: Consultant;
  onClose: () => void;
  onConfirmed: () => void;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function confirm() {
    setSaving(true);
    try {
      await consultantAdminApi.deactivate(
        consultant.id,
        note.trim() || undefined,
      );
      onConfirmed();
      onClose();
    } finally {
      setSaving(false);
    }
  }

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
        exit={{ opacity: 0 }}
        className="bg-[#1A2030] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h3 className="text-[15px] font-semibold text-white">
            Deactivate Consultant
          </h3>
          <button onClick={onClose} className="text-white/30 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-[13px] text-white/50">
            {consultant.firstName} {consultant.lastName} won&apos;t be able to
            sign in or take new bookings until reactivated.
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason (optional, for internal audit log)…"
            rows={2}
            className={`${inputCls} h-auto py-3 resize-none`}
          />
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-10 border border-white/10 text-white/50 hover:text-white rounded-xl text-[13px] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirm}
              disabled={saving}
              className="flex-1 h-10 bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-red-400 hover:text-white font-semibold rounded-xl text-[13px] transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                "Deactivate"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main page ───────
export function ConsultantsPage() {
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [search, setSearch] = useState("");
  const { data, loading, mutate } = useAdminConsultants(statusFilter, search);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Consultant | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Consultant | null>(
    null,
  );

  const consultants = (data?.consultants ?? []) as Consultant[];
  const activeCount = consultants.filter((c) => c.status === "ACTIVE").length;
  const totalEarnings = consultants.reduce<number>(
    (s, c) => s + (c.totalEarningsKobo ?? 0),
    0,
  );
  const avgRating = consultants.filter((c) => c.avgRating).length
    ? consultants.reduce<number>((s, c) => s + (c.avgRating ?? 0), 0) /
      consultants.filter((c) => c.avgRating).length
    : null;

  return (
    <DashboardShell
      heading="Consultants"
      subheading="Manage Pharmacist, Toxicologist, Herbalist, and Naturopath accounts."
    >
      <AnimatePresence>
        {createOpen && (
          <CreateConsultantModal
            onClose={() => setCreateOpen(false)}
            onCreated={mutate}
          />
        )}
        {editTarget && (
          <EditConsultantModal
            consultant={editTarget}
            onClose={() => setEditTarget(null)}
            onSaved={mutate}
          />
        )}
        {deactivateTarget && (
          <DeactivateModal
            consultant={deactivateTarget}
            onClose={() => setDeactivateTarget(null)}
            onConfirmed={mutate}
          />
        )}
      </AnimatePresence>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Total Consultants",
            value: String(consultants.length),
            icon: <Stethoscope size={16} />,
            color: "text-white",
            bg: "bg-white/[0.04] border-white/[0.07]",
          },
          {
            label: "Active",
            value: String(activeCount),
            icon: <ShieldCheck size={16} />,
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/15",
          },
          {
            label: "Total Payouts",
            value: naira(totalEarnings),
            icon: <Wallet size={16} />,
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/15",
          },
          {
            label: "Avg. Rating",
            value: avgRating ? avgRating.toFixed(1) : "—",
            icon: <Star size={16} />,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10 border-yellow-500/15",
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl border p-5 ${k.bg}`}
          >
            <div className={`mb-2 ${k.color}`}>{k.icon}</div>
            <div className={`text-[26px] font-serif font-semibold ${k.color}`}>
              {k.value}
            </div>
            <div className="text-[12px] text-white/40 mt-0.5">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-50">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search consultants…"
            className="w-full h-10 pl-9 pr-3.5 bg-white/6 border border-white/10 rounded-xl text-[13px] text-white placeholder:text-white/25 outline-none focus:border-(--green-mid) transition-all"
          />
        </div>
        <div className="flex gap-1.5">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-10 px-3.5 rounded-xl text-[12px] font-medium transition-colors ${statusFilter === s ? "bg-(--green-mid) text-white" : "bg-white/5 text-white/50 hover:text-white"}`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="h-10 px-4 bg-(--green-mid) hover:bg-(--green-light) text-white font-semibold rounded-xl text-[13px] transition-colors flex items-center gap-2"
        >
          <Plus size={14} /> Add Consultant
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading && consultants.length === 0 ? (
          <div className="p-5 rounded-2xl border border-white/8 bg-white/3 text-[13px] text-white/40 text-center">
            Loading consultants…
          </div>
        ) : consultants.length === 0 ? (
          <div className="p-8 rounded-2xl border border-white/8 bg-white/3 text-[13px] text-white/40 text-center">
            No consultants yet. Add your first Pharmacist, Herbalist,
            Naturopath, or Toxicologist.
          </div>
        ) : (
          consultants.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-wrap items-center gap-4 p-5 rounded-2xl border border-white/8 bg-white/3"
            >
              <div className="w-11 h-11 rounded-xl bg-(--green-mid)/20 border border-(--green-mid)/30 flex items-center justify-center text-[14px] font-semibold text-(--green-pale) shrink-0">
                {c.firstName[0]}
                {c.lastName[0]}
              </div>
              <div className="flex-1 min-w-45">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[14px] font-semibold text-white">
                    {c.firstName} {c.lastName}
                  </p>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/6 text-white/60">
                    {SPECIALIZATIONS.find((s) => s.value === c.specialization)
                      ?.label ?? c.specialization}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${c.status === "ACTIVE" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}
                  >
                    {c.status === "ACTIVE" ? (
                      <CheckCircle2 size={11} />
                    ) : (
                      <ShieldOff size={11} />
                    )}
                    {c.status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-[12px] text-white/40 mt-0.5">
                  {c.email}
                  {c.phone ? ` · ${c.phone}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-5 text-[12px] text-white/50 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-white/30" />{" "}
                  {c.completedConsultations}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={13} className="text-white/30" />{" "}
                  {c.avgRating ? c.avgRating.toFixed(1) : "—"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Wallet size={13} className="text-white/30" />{" "}
                  {naira(c.totalEarningsKobo)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditTarget(c)}
                  className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all"
                >
                  <Pencil size={13} />
                </button>
                {c.status === "ACTIVE" ? (
                  <button
                    onClick={() => setDeactivateTarget(c)}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <ShieldOff size={12} /> Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      consultantAdminApi.activate(c.id).then(mutate)
                    }
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                  >
                    <ShieldCheck size={12} /> Activate
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </DashboardShell>
  );
}
