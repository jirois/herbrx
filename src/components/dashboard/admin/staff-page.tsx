"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Copy,
  Check,
  PenSquare,
  ClipboardCheck,
  X,
  Loader2,
  Mail,
  FileText,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useStaffAccounts, apiPost } from "@/hooks/dashboard-hooks";
import { EMAIL_RE } from "@/lib/vaildation";

type StaffRole = "WRITER" | "EDITOR";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: StaffRole;
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  createdAt: string;
  postCount: number;
}

interface NewCredentials {
  email: string;
  tempPassword: string;
}

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "WRITER" as StaffRole,
};

export function StaffPage() {
  const [tab, setTab] = useState<"ALL" | StaffRole>("ALL");
  const { data, loading, error, mutate } = useStaffAccounts(
    tab === "ALL" ? undefined : tab,
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newCreds, setNewCreds] = useState<NewCredentials | null>(null);

  const staff = (data?.staff ?? []) as unknown as StaffMember[];
  const writers = staff.filter((s) => s.role === "WRITER").length;
  const editors = staff.filter((s) => s.role === "EDITOR").length;

  async function handleCreate() {
    setFormError(null);
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError("First and last name are required.");
      return;
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      setFormError("Enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPost("/api/dashboard/admin/staff", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
      });
      setNewCreds(res.credentials);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await mutate();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Could not create the account",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardShell
      heading="Writers & Editors"
      subheading="Create staff accounts for the blog's editorial workflow. Writers and editors don't self-register — they're provisioned here."
    >
      {newCreds && (
        <CredentialsCard creds={newCreds} onDismiss={() => setNewCreds(null)} />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Writers"
          value={writers}
          icon={<PenSquare size={16} />}
        />
        <StatCard
          label="Editors"
          value={editors}
          icon={<ClipboardCheck size={16} />}
        />
        <StatCard
          label="Total Staff"
          value={staff.length}
          icon={<FileText size={16} />}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex gap-2">
          {(["ALL", "WRITER", "EDITOR"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[13px] px-3 py-1.5 rounded-full border transition-colors ${
                tab === t
                  ? "bg-white text-black border-white"
                  : "border-white/15 text-white/60 hover:text-white hover:border-white/30"
              }`}
            >
              {t === "ALL" ? "All" : t === "WRITER" ? "Writers" : "Editors"}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setFormError(null);
          }}
          className="flex items-center gap-2 text-[13px] font-medium bg-(--green-mid) hover:bg-(--green-deep) text-white px-4 py-2 rounded-xl transition-colors"
        >
          <UserPlus size={14} />
          Create Account
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-2xl border border-white/8 bg-white/3 p-5 mb-5 overflow-hidden"
        >
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input
              value={form.firstName}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
              placeholder="First name"
              className={inputCls}
            />
            <input
              value={form.lastName}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
              placeholder="Last name"
              className={inputCls}
            />
            <input
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="Email address"
              type="email"
              className={inputCls}
            />
            <input
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="Phone (optional)"
              className={inputCls}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-white/50">
              Role
            </span>
            {(["WRITER", "EDITOR"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setForm((f) => ({ ...f, role: r }))}
                className={`text-[13px] px-3 py-1.5 rounded-full border transition-colors ${
                  form.role === r
                    ? "bg-white text-black border-white"
                    : "border-white/15 text-white/60 hover:text-white hover:border-white/30"
                }`}
              >
                {r === "WRITER" ? "Writer" : "Editor"}
              </button>
            ))}
          </div>

          {formError && (
            <p className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3">
              {formError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="flex items-center gap-2 text-[13px] font-medium bg-(--green-mid) hover:bg-(--green-deep) text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UserPlus size={14} />
              )}
              Create {form.role === "WRITER" ? "Writer" : "Editor"} Account
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-[13px] px-4 py-2 rounded-xl border border-white/15 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {loading && <p className="text-white/50 text-[14px]">Loading…</p>}
      {error && <p className="text-red-400 text-[14px]">{error}</p>}

      {!loading && staff.length === 0 && (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-10 text-center">
          <UserPlus className="mx-auto mb-3 text-white/30" size={28} />
          <p className="text-white/60 text-[14px]">
            No {tab === "ALL" ? "staff" : tab.toLowerCase()} accounts yet.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {staff.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-white/8 bg-white/3 p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[12px] font-bold shrink-0">
                {s.firstName[0]}
                {s.lastName[0]}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-[14px] truncate">
                  {s.firstName} {s.lastName}
                </p>
                <p className="flex items-center gap-1 text-[12px] text-white/40 truncate">
                  <Mail size={11} />
                  {s.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  s.role === "WRITER"
                    ? "bg-purple-500/15 text-purple-300"
                    : "bg-teal-500/15 text-teal-300"
                }`}
              >
                {s.role === "WRITER" ? "Writer" : "Editor"}
              </span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  s.status === "ACTIVE"
                    ? "bg-green-500/15 text-green-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {s.status === "ACTIVE"
                  ? "Active"
                  : s.status === "SUSPENDED"
                    ? "Suspended"
                    : "Banned"}
              </span>
              <span className="text-[12px] text-white/40 w-24 text-right">
                {s.postCount} {s.role === "WRITER" ? "post" : "review"}
                {s.postCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
      <div className="flex items-center gap-2 text-white/50 text-[12px] mb-2">
        {icon}
        {label}
      </div>
      <div className="text-[24px] font-semibold">{value}</div>
    </div>
  );
}

function CredentialsCard({
  creds,
  onDismiss,
}: {
  creds: NewCredentials;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(
      `Email: ${creds.email}\nTemporary password: ${creds.tempPassword}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 mb-6"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[13px] font-semibold text-amber-300 mb-1">
            Account created
          </p>
          <p className="text-[12px] text-amber-200/80">
            Share this password with them directly — it won&apos;t be shown
            again.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-amber-300/60 hover:text-amber-200 shrink-0"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3 bg-black/20 rounded-xl px-4 py-3 font-mono text-[13px]">
        <span className="text-white/80">{creds.email}</span>
        <span className="text-white/30">·</span>
        <span className="text-amber-200">{creds.tempPassword}</span>
        <button
          onClick={copy}
          className="ml-auto flex items-center gap-1.5 text-[12px] text-amber-200 hover:text-white transition-colors"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </motion.div>
  );
}

const inputCls =
  "w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-(--green-mid) transition-colors";
