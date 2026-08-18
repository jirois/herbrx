"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "./dashboard-shell";
import { useToast } from "@/context/toast-context";
import {
  User,
  Banknote,
  Key,
  Bell,
  Shield,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Webhook,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "profile" | "payout" | "paystack" | "notifications" | "security";
type Role = "ADMIN" | "PRODUCER" | "CUSTOMER" | "CONSULTANT" | string;

const ALL_TABS: {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  producerOnly?: boolean;
}[] = [
  { id: "profile", label: "Business Profile", icon: <User size={15} /> },
  {
    id: "payout",
    label: "Payout Account",
    icon: <Banknote size={15} />,
    producerOnly: true,
  },
  {
    id: "paystack",
    label: "Paystack & API",
    icon: <Key size={15} />,
    producerOnly: true,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell size={15} />,
    producerOnly: true,
  },
  { id: "security", label: "Security", icon: <Shield size={15} /> },
];

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  hint,
  disabled,
  mono,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[12px] font-medium text-white/50 mb-1.5 uppercase tracking-wide"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 rounded-xl border text-[14px] outline-none transition-all duration-200",
          "bg-white/5 border-white/8 text-white placeholder:text-white/20",
          "focus:border-(--green-mid) focus:ring-1 focus:ring-(--green-mid)/30",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          mono && "font-mono text-[13px]",
        )}
      />
      {hint && (
        <p className="text-[11px] text-white/30 mt-1 font-light">{hint}</p>
      )}
    </div>
  );
}

function SaveButton({
  loading,
  label = "Save Changes",
}: {
  loading: boolean;
  label?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 bg-(--green-mid) hover:bg-(--green-light) text-white px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Check size={14} />
      )}
      {loading ? "Saving…" : label}
    </button>
  );
}

function TabSkeleton() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={22} className="animate-spin text-(--green-pale)" />
    </div>
  );
}

// ── Profile Tab ───────
type ProfileUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

function ProfileTab({ user, role }: { user: ProfileUser; role: Role }) {
  const { success, error: toastError } = useToast();
  const isProducer = role === "PRODUCER";
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    website: "",
    address: "",
    description: "",
  });

  useEffect(() => {
    fetch("/api/dashboard/settings/profile")
      .then((r) => r.json())
      .then((d) =>
        setForm((p) => ({
          ...p,
          firstName: d.firstName ?? p.firstName,
          lastName: d.lastName ?? p.lastName,
          email: d.email ?? p.email,
          phone: d.phone ?? "",
          businessName: d.businessName ?? "",
          website: d.website ?? "",
          address: d.address ?? "",
          description: d.description ?? "",
        })),
      )
      .catch(() => toastError("Couldn't load your profile"))
      .finally(() => setLoadingData(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      success(isProducer ? "Business profile updated" : "Profile updated");
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Failed to save profile");
    }
    setSaving(false);
  }

  if (loadingData) return <TabSkeleton />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="font-serif text-[18px] font-semibold text-white mb-1">
          {isProducer ? "Business Profile" : "Profile"}
        </h3>
        <p className="text-[13px] text-white/40 font-light">
          {isProducer
            ? "This information appears on your invoices and receipts."
            : "Your personal account details."}
        </p>
      </div>

      {isProducer && (
        <Field
          label="Business Name"
          id="bizName"
          value={form.businessName}
          onChange={(v) => setForm((p) => ({ ...p, businessName: v }))}
        />
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="First Name"
          id="firstName"
          value={form.firstName}
          onChange={(v) => setForm((p) => ({ ...p, firstName: v }))}
        />
        <Field
          label="Last Name"
          id="lastName"
          value={form.lastName}
          onChange={(v) => setForm((p) => ({ ...p, lastName: v }))}
        />
      </div>

      <Field
        label="Email Address"
        id="email"
        type="email"
        value={form.email}
        disabled
        hint="Email cannot be changed here"
      />
      <Field
        label="Phone Number"
        id="phone"
        type="tel"
        value={form.phone}
        onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
        placeholder="08012345678"
      />

      {isProducer && (
        <>
          <Field
            label="Website"
            id="website"
            value={form.website}
            onChange={(v) => setForm((p) => ({ ...p, website: v }))}
            placeholder="https://yourbusiness.ng"
          />
          <Field
            label="Business Address"
            id="address"
            value={form.address}
            onChange={(v) => setForm((p) => ({ ...p, address: v }))}
          />
          <div>
            <label className="block text-[12px] font-medium text-white/50 mb-1.5 uppercase tracking-wide">
              Business Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-white/8 bg-white/5 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-(--green-mid) resize-none"
            />
          </div>
        </>
      )}

      <SaveButton loading={saving} />
    </form>
  );
}

// ── Payout Tab ───────
function PayoutTab() {
  const { success, error: toastError } = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verified, setVerified] = useState(false);
  const [form, setForm] = useState({
    bankName: "First Bank Nigeria",
    accountNumber: "",
    accountName: "",
    bvn: "",
  });

  useEffect(() => {
    fetch("/api/dashboard/producer/settings/payout")
      .then((r) => r.json())
      .then((d) => {
        setForm((p) => ({
          bankName: d.bankName || p.bankName,
          accountNumber: d.accountNumber ?? "",
          accountName: d.accountName ?? "",
          bvn: d.bvn ?? "",
        }));
        setVerified(Boolean(d.payoutVerified));
      })
      .catch(() => toastError("Couldn't load your payout details"))
      .finally(() => setLoadingData(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/producer/settings/payout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setVerified(Boolean(data.payoutVerified));
      success(
        "Payout account saved. Our team verifies new bank details before your next settlement.",
      );
    } catch (e) {
      toastError(
        e instanceof Error ? e.message : "Failed to save payout account",
      );
    }
    setSaving(false);
  }

  if (loadingData) return <TabSkeleton />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="font-serif text-[18px] font-semibold text-white mb-1">
          Payout Account
        </h3>
        <p className="text-[13px] text-white/40 font-light">
          Your settlement funds will be sent here.
        </p>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-3 text-[13px] border",
          verified
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-amber-500/10 border-amber-500/20 text-amber-400",
        )}
      >
        {verified ? (
          <>
            <Check size={15} /> Account verified — settlements active
          </>
        ) : (
          <>
            <Clock size={15} /> Awaiting verification — settlements are held
            until this account is confirmed
          </>
        )}
      </div>

      <div>
        <label className="block text-[12px] font-medium text-white/50 mb-1.5 uppercase tracking-wide">
          Bank Name
        </label>
        <select
          value={form.bankName}
          onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl border border-white/8 bg-white/5 text-[14px] text-white outline-none focus:border-(--green-mid) cursor-pointer"
        >
          {[
            "First Bank Nigeria",
            "GTBank",
            "Access Bank",
            "Zenith Bank",
            "UBA",
            "Sterling Bank",
            "Kuda Bank",
            "OPay",
            "PalmPay",
          ].map((b) => (
            <option key={b} value={b} className="bg-[#1E2535]">
              {b}
            </option>
          ))}
        </select>
      </div>

      <Field
        label="Account Number"
        id="accNum"
        value={form.accountNumber}
        mono
        onChange={(v) => setForm((p) => ({ ...p, accountNumber: v }))}
        placeholder="0123456789"
        hint="10-digit NUBAN account number"
      />
      <Field
        label="Account Name"
        id="accName"
        value={form.accountName}
        onChange={(v) => setForm((p) => ({ ...p, accountName: v }))}
        placeholder="As it appears on your bank account"
        hint="Must match your registered business or personal name"
      />
      <Field
        label="BVN"
        id="bvn"
        value={form.bvn}
        mono
        onChange={(v) => setForm((p) => ({ ...p, bvn: v }))}
        placeholder="12345678901"
        hint="Required for regulatory compliance"
      />

      <div className="border-t border-white/[0.07] pt-5">
        <p className="text-[12px] text-white/30 mb-4">
          Settlement schedule: every weekday (Mon–Fri) for the previous
          day&apos;s transactions, once your account is verified.
        </p>
        <SaveButton loading={saving} label="Update Payout Account" />
      </div>
    </form>
  );
}

// ── Paystack & API Tab (read-only reference — platform-level integration) ──
function PaystackTab() {
  const [copied, setCopied] = useState<string | null>(null);

  const pubKey =
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "Not configured";
  const isLive = pubKey.startsWith("pk_live_");
  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/paystack/webhook`
      : "/api/paystack/webhook";

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-[18px] font-semibold text-white mb-1">
          Paystack Integration
        </h3>
        <p className="text-[13px] text-white/40 font-light">
          HerbRx checkout runs on a single, platform-wide Paystack integration —
          these values are for reference, not per-account configuration.
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-[12px] uppercase tracking-widest text-white/30 font-medium">
          API Keys
        </p>

        <div>
          <label className="block text-[12px] font-medium text-white/50 mb-1.5 uppercase tracking-wide">
            Public Key
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={pubKey}
              className="flex-1 px-4 py-3 rounded-xl border border-white/8 bg-white/5 text-[13px] text-white/60 font-mono outline-none"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(pubKey, "pub")}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all shrink-0"
            >
              {copied === "pub" ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-white/50 mb-1.5 uppercase tracking-wide">
            Secret Key
          </label>
          <input
            type="password"
            readOnly
            value="••••••••••••••••••••••••••••••••"
            className="w-full px-4 py-3 rounded-xl border border-white/8 bg-white/5 text-[13px] text-white/40 font-mono outline-none"
          />
          <p className="text-[11px] text-white/30 mt-1">
            The secret key lives only in the server environment
            (PAYSTACK_SECRET_KEY) — it&apos;s never sent to the browser, so
            there&apos;s nothing to reveal here.
          </p>
        </div>

        <a
          href="https://dashboard.paystack.com/#/settings/developer"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] text-(--green-pale) hover:text-white transition-colors"
        >
          <ExternalLink size={12} /> Manage keys on Paystack Dashboard
        </a>
      </div>

      <div className="border-t border-white/[0.07] pt-6">
        <p className="text-[12px] uppercase tracking-widest text-white/30 font-medium mb-4">
          Webhook
        </p>
        <div>
          <label className="text-[12px] font-medium text-white/50 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
            <Webhook size={12} /> Webhook URL
          </label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={webhookUrl}
              className="flex-1 px-4 py-3 rounded-xl border border-white/8 bg-white/5 text-[13px] text-white/60 font-mono outline-none"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(webhookUrl, "hook")}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all shrink-0"
            >
              {copied === "hook" ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
          <p className="text-[11px] text-white/30 mt-1">
            This is fixed by the app&apos;s deployment — add it once in your
            Paystack Dashboard → Settings → API Keys & Webhooks.
          </p>
        </div>

        <div className="bg-white/3 border border-white/6 rounded-xl p-4 text-[12px] text-white/40 mt-4">
          <p className="font-medium text-white/60 mb-2">Events handled:</p>
          {[
            "charge.success → marks order as paid",
            "charge.failed → marks order as cancelled",
          ].map((e) => (
            <p key={e} className="flex items-center gap-2 mt-1">
              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
              {e}
            </p>
          ))}
        </div>
      </div>

      <div className="border-t border-white/[0.07] pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-medium text-white">Environment</p>
            <p className="text-[12px] text-white/40 font-light mt-0.5">
              Determined by which Paystack key is configured — switch keys in
              the server&apos;s environment variables, not here.
            </p>
          </div>
          <span
            className={cn(
              "text-[11px] font-medium px-3 py-1.5 rounded-full",
              isLive
                ? "bg-green-500/15 text-green-400"
                : "bg-amber-500/15 text-amber-400",
            )}
          >
            {isLive ? "Live" : "Test Mode"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Notifications Tab ─────
function NotificationsTab() {
  const { success, error: toastError } = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    newOrder: true,
    paymentFailed: true,
    disputeOpened: true,
    settlementPaid: true,
    lowStock: true,
    emailDigest: false,
  });

  useEffect(() => {
    fetch("/api/dashboard/producer/settings/notifications")
      .then((r) => r.json())
      .then((d) => setPrefs((p) => ({ ...p, ...d })))
      .catch(() => toastError("Couldn't load your notification preferences"))
      .finally(() => setLoadingData(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        "/api/dashboard/producer/settings/notifications",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prefs),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      success("Notification preferences saved");
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Failed to save preferences");
    }
    setSaving(false);
  }

  const items = [
    {
      id: "newOrder" as const,
      label: "New Order",
      desc: "When a customer places an order",
    },
    {
      id: "paymentFailed" as const,
      label: "Payment Failed",
      desc: "When a payment attempt fails",
    },
    {
      id: "disputeOpened" as const,
      label: "Dispute Opened",
      desc: "When a dispute is raised",
    },
    {
      id: "settlementPaid" as const,
      label: "Settlement Paid",
      desc: "When a payout lands in your account",
    },
    {
      id: "lowStock" as const,
      label: "Low Stock Alert",
      desc: "When a product has fewer than 20 units",
    },
    {
      id: "emailDigest" as const,
      label: "Daily Email Digest",
      desc: "Summary of yesterday's activity",
    },
  ];

  if (loadingData) return <TabSkeleton />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="font-serif text-[18px] font-semibold text-white mb-1">
          Notification Preferences
        </h3>
        <p className="text-[13px] text-white/40 font-light">
          Choose which events trigger email notifications.
        </p>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/6 hover:border-white/10 cursor-pointer transition-colors"
          >
            <div>
              <p className="text-[14px] font-medium text-white">{item.label}</p>
              <p className="text-[12px] text-white/40 font-light">
                {item.desc}
              </p>
            </div>
            <div
              onClick={() =>
                setPrefs((p) => ({ ...p, [item.id]: !p[item.id] }))
              }
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
                prefs[item.id] ? "bg-(--green-mid)" : "bg-white/10",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
                  prefs[item.id] && "translate-x-5",
                )}
              />
            </div>
          </label>
        ))}
      </div>

      <SaveButton loading={saving} />
    </form>
  );
}

// ── Security Tab ───
function SecurityTab() {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [conf, setConf] = useState("");
  const [show, setShow] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nw !== conf) {
      toastError("New password and confirmation don't match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: cur, newPassword: nw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to change password");
      setCur("");
      setNw("");
      setConf("");
      success("Password changed successfully");
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Failed to change password");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-[18px] font-semibold text-white mb-1">
          Security
        </h3>
        <p className="text-[13px] text-white/40 font-light">
          Manage your password and account security settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <p className="text-[12px] uppercase tracking-widest text-white/30 font-medium">
          Change Password
        </p>
        {[
          { id: "cur", label: "Current Password", val: cur, set: setCur },
          { id: "nw", label: "New Password", val: nw, set: setNw },
          { id: "conf", label: "Confirm New", val: conf, set: setConf },
        ].map((f) => (
          <div key={f.id} className="relative">
            <label className="block text-[12px] font-medium text-white/50 mb-1.5 uppercase tracking-wide">
              {f.label}
            </label>
            <input
              type={show ? "text" : "password"}
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-10 rounded-xl border border-white/8 bg-white/5 text-[14px] text-white outline-none focus:border-(--green-mid)"
            />
          </div>
        ))}
        <label className="flex items-center gap-2 text-[13px] text-white/40 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={show}
            onChange={(e) => setShow(e.target.checked)}
            className="w-4 h-4 accent-(--green-mid) cursor-pointer"
          />
          Show passwords
        </label>
        <SaveButton loading={loading} label="Change Password" />
      </form>

      {/* 2FA — not yet available, said honestly rather than faking a toggle */}
      <div className="border-t border-white/[0.07] pt-6">
        <p className="text-[12px] uppercase tracking-widest text-white/30 font-medium mb-4">
          Two-Factor Authentication
        </p>
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/6">
          <div>
            <p className="text-[14px] font-medium text-white">
              Authenticator App (TOTP)
            </p>
            <p className="text-[12px] text-white/40 font-light mt-0.5">
              Not available yet — this is on the roadmap.
            </p>
          </div>
          <span className="px-4 py-2 rounded-xl bg-white/5 text-white/30 text-[13px] font-medium">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────
interface Props {
  user: {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: Role;
  };
}

export function DashboardSettings({ user }: Props) {
  const role = user.role ?? "CUSTOMER";
  const tabs = ALL_TABS.filter((t) => !t.producerOnly || role === "PRODUCER");
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <DashboardShell
      heading="Settings"
      subheading="Configure your account and preferences"
    >
      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        {/* Sidebar */}
        <nav className="space-y-1 lg:sticky lg:top-24 h-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left",
                activeTab === tab.id
                  ? "bg-(--green-mid)/20 text-(--green-pale) border border-(--green-mid)/30"
                  : "text-white/40 hover:text-white hover:bg-white/5",
              )}
            >
              <span
                className={
                  activeTab === tab.id ? "text-(--green-pale)" : "text-white/25"
                }
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="bg-[#161B27] border border-white/[0.07] rounded-2xl p-7"
        >
          {activeTab === "profile" && <ProfileTab user={user} role={role} />}
          {activeTab === "payout" && role === "PRODUCER" && <PayoutTab />}
          {activeTab === "paystack" && role === "PRODUCER" && <PaystackTab />}
          {activeTab === "notifications" && role === "PRODUCER" && (
            <NotificationsTab />
          )}
          {activeTab === "security" && <SecurityTab />}
        </motion.div>
      </div>
    </DashboardShell>
  );
}
