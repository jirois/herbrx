"use client";

import { useState } from "react";
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
  Eye,
  EyeOff,
  Check,
  Loader2,
  ExternalLink,
  Webhook,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "profile" | "payout" | "paystack" | "notifications" | "security";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Business Profile", icon: <User size={15} /> },
  { id: "payout", label: "Payout Account", icon: <Banknote size={15} /> },
  { id: "paystack", label: "Paystack & API", icon: <Key size={15} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={15} /> },
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

// ── Profile Tab ───────────────────────────────────────────────────────────
type ProfileUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

function ProfileTab({ user }: { user: ProfileUser }) {
  const { success } = useToast();
  const [form, setForm] = useState({
    businessName: "HerbRx Nigeria",
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    website: "https://herbrx.ng",
    address: "Lagos, Nigeria",
    description:
      "Premium NAFDAC-compliant herbal wellness products for Nigerians.",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    success("Business profile updated");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="font-serif text-[18px] font-semibold text-white mb-1">
          Business Profile
        </h3>
        <p className="text-[13px] text-white/40 font-light">
          This information appears on your invoices and receipts.
        </p>
      </div>

      <Field
        label="Business Name"
        id="bizName"
        value={form.businessName}
        onChange={(v) => setForm((p) => ({ ...p, businessName: v }))}
      />

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
      <Field
        label="Website"
        id="website"
        value={form.website}
        onChange={(v) => setForm((p) => ({ ...p, website: v }))}
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

      <SaveButton loading={loading} />
    </form>
  );
}

// ── Payout Tab ───────
function PayoutTab() {
  const { success } = useToast();
  const [form, setForm] = useState({
    bankName: "First Bank Nigeria",
    accountNumber: "1234567890",
    accountName: "HerbRx Nigeria Ltd",
    bvn: "12345678901",
  });
  const [loading, setLoading] = useState(false);
  const [verified] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100));
    setLoading(false);
    success(
      "Payout account updated. Changes will take effect on your next settlement.",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="font-serif text-[18px] font-semibold text-white mb-1">
          Payout Account
        </h3>
        <p className="text-[13px] text-white/40 font-light">
          Your settlement funds will be sent here. Processing typically takes
          T+1 business days.
        </p>
      </div>

      {verified && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-[13px] text-green-400">
          <Check size={15} /> Account verified — settlements active
        </div>
      )}

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
        disabled
        hint="Auto-filled after account number verification"
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
          day&apos;s transactions.
        </p>
        <SaveButton loading={loading} label="Update Payout Account" />
      </div>
    </form>
  );
}

// ── Paystack & API Tab ────
function PaystackTab() {
  const { success } = useToast();
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [webhook, setWebhook] = useState(
    "https://herbrx.ng/api/paystack/webhook",
  );

  const pubKey =
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_••••••••••••••••";
  const secKey = "sk_test_••••••••••••••••••••••••••••••••";

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  async function saveWebhook(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    success(
      "Webhook URL saved. Configure the same URL in your Paystack dashboard.",
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-[18px] font-semibold text-white mb-1">
          Paystack Integration
        </h3>
        <p className="text-[13px] text-white/40 font-light">
          Your API keys and webhook configuration.
        </p>
      </div>

      {/* API Keys */}
      <div className="space-y-4">
        <p className="text-[12px] uppercase tracking-widest text-white/30 font-medium">
          API Keys
        </p>

        {/* Public key */}
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
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:border-white/2 transition-all shrink-0"
            >
              {copied === "pub" ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>

        {/* Secret key */}
        <div>
          <label className="block text-[12px] font-medium text-white/50 mb-1.5 uppercase tracking-wide">
            Secret Key
          </label>
          <div className="flex items-center gap-2">
            <input
              type={showSecret ? "text" : "password"}
              readOnly
              value={secKey}
              className="flex-1 px-4 py-3 rounded-xl border border-white/8 bg-white/5 text-[13px] text-white/60 font-mono outline-none"
            />
            <button
              type="button"
              onClick={() => setShowSecret((v) => !v)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white transition-all shrink-0"
            >
              {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(secKey, "sec")}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all shrink-0"
            >
              {copied === "sec" ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
          <p className="text-[11px] text-red-400/60 mt-1">
            Never expose your secret key publicly. Keep it in .env.local only.
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

      {/* Webhook */}
      <div className="border-t border-white/[0.07] pt-6">
        <p className="text-[12px] uppercase tracking-widest text-white/30 font-medium mb-4">
          Webhook
        </p>
        <form onSubmit={saveWebhook} className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-white/50 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <Webhook size={12} /> Webhook URL
            </label>
            <input
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/8 bg-white/5 text-[13px] text-white font-mono outline-none focus:border-(--green-mid)"
            />
            <p className="text-[11px] text-white/30 mt-1">
              Add this URL in your Paystack Dashboard → Settings → API Keys &
              Webhooks → Webhook URL. HerbRx will automatically verify the
              HMAC-SHA512 signature on every event.
            </p>
          </div>

          <div className="bg-white/3 border border-white/6 rounded-xl p-4 text-[12px] text-white/40">
            <p className="font-medium text-white/60 mb-2">Events handled:</p>
            {[
              "charge.success → marks order as paid",
              "charge.failed → marks order as cancelled",
              "transfer.success → payout confirmed",
            ].map((e) => (
              <p key={e} className="flex items-center gap-2 mt-1">
                <span className="text-green-500">✓</span>
                {e}
              </p>
            ))}
          </div>

          <SaveButton loading={loading} label="Save Webhook URL" />
        </form>
      </div>

      {/* Test mode toggle */}
      <div className="border-t border-white/[0.07] pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-medium text-white">Test Mode</p>
            <p className="text-[12px] text-white/40 font-light mt-0.5">
              Enable to use test keys. No real payments processed.
            </p>
          </div>
          <div className="w-12 h-6 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center px-1 cursor-pointer">
            <div className="w-4 h-4 bg-amber-400 rounded-full ml-auto transition-all" />
          </div>
        </div>
        <p className="text-[11px] text-amber-400/60 mt-2">
          Currently using test keys (pk_test_…). Switch to live keys in
          .env.local for production.
        </p>
      </div>
    </div>
  );
}

// ── Notifications Tab ─────────
function NotificationsTab() {
  const { success } = useToast();
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    newOrder: true,
    paymentFailed: true,
    disputeOpened: true,
    settlementPaid: true,
    lowStock: true,
    emailDigest: false,
    slackWebhook: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    success("Notification preferences saved");
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
      desc: "When a chargeback is raised",
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

      <SaveButton loading={loading} />
    </form>
  );
}

// ── Security Tab ───
function SecurityTab() {
  const { success } = useToast();
  const [loading, setLoading] = useState(false);
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [conf, setConf] = useState("");
  const [show, setShow] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nw !== conf) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setCur("");
    setNw("");
    setConf("");
    success("Password changed successfully");
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

      {/* Change password */}
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

      {/* 2FA */}
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
              Use Google Authenticator or Authy
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-(--green-mid)/20 text-(--green-pale) text-[13px] font-medium hover:bg-(--green-mid)/30 transition-colors"
          >
            Enable 2FA
          </button>
        </div>
      </div>

      {/* Active sessions */}
      <div className="border-t border-white/[0.07] pt-6">
        <p className="text-[12px] uppercase tracking-widest text-white/30 font-medium mb-4">
          Active Sessions
        </p>
        {[
          {
            device: "Chrome on macOS",
            location: "Lagos, NG",
            current: true,
            time: "Now",
          },
          {
            device: "Safari on iPhone",
            location: "Lagos, NG",
            current: false,
            time: "2 hours ago",
          },
          {
            device: "Firefox on Windows",
            location: "Abuja, NG",
            current: false,
            time: "3 days ago",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
          >
            <div>
              <p className="text-[13px] font-medium text-white flex items-center gap-2">
                {s.device}
                {s.current && (
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </p>
              <p className="text-[11px] text-white/35 mt-0.5">
                {s.location} · {s.time}
              </p>
            </div>
            {!s.current && (
              <button className="text-[12px] text-red-400/60 hover:text-red-400 transition-colors">
                Revoke
              </button>
            )}
          </div>
        ))}
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
  };
}

export function DashboardSettings({ user }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <DashboardShell
      heading="Settings"
      subheading="Configure your business, payments, and account preferences"
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
          {activeTab === "profile" && <ProfileTab user={user} />}
          {activeTab === "payout" && <PayoutTab />}
          {activeTab === "paystack" && <PaystackTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "security" && <SecurityTab />}
        </motion.div>
      </div>
    </DashboardShell>
  );
}
