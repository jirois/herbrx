"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  Bell,
  Shield,
  Trash2,
} from "lucide-react";
import { useToast } from "@/context/toast-context";
import { cn } from "@/lib/utils";

interface Props {
  user: {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    phone?: string;
    image?: string;
  };
}

type Tab = "profile" | "security" | "notifications";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "profile",
    label: "Profile",
    icon: <span className="text-[16px]">👤</span>,
  },
  { id: "security", label: "Security", icon: <Shield size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
];

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  hint,
  error,
  disabled,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-(--text-body) mb-1.5"
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
          "w-full px-4 py-3 rounded-xl border text-[14px] bg-white",
          "text-(--text-dark) placeholder:text-(--text-muted)",
          "outline-none transition-all duration-200",
          "disabled:opacity-55 disabled:cursor-not-allowed disabled:bg-(--cream)",
          error
            ? "border-red-400 focus:ring-2 focus:ring-red-200"
            : "border-(--cream-dark) focus:border-(--green-mid) focus:ring-2 focus:ring-(--green-pale)",
        )}
      />
      {hint && !error && (
        <p className="text-[11px] text-(--text-muted) mt-1">{hint}</p>
      )}
      {error && <p className="text-[12px] text-red-500 mt-1">⚠ {error}</p>}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────
function ProfileTab({ user }: Props) {
  const { success } = useToast();
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSave() {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "Required";
    if (!lastName.trim()) errs.lastName = "Required";
    if (phone && !phone.match(/^(\+234|0)[789][01]\d{8}$/))
      errs.phone = "Enter a valid Nigerian number";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    // In production: PATCH /api/user/profile
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    success("Profile updated successfully");
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-[19px] font-semibold text-(--green-deep) mb-1">
          Personal Information
        </h3>
        <p className="text-[13px] text-(--text-muted) font-light">
          Update your name and contact details.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-(--green-deep) flex items-center justify-center font-serif text-[22px] font-semibold text-white shrink-0">
          {(firstName[0] ?? "").toUpperCase()}
          {(lastName[0] ?? "").toUpperCase()}
        </div>
        <div>
          <p className="text-[13px] font-medium text-(--text-dark)">
            Profile Photo
          </p>
          <p className="text-[12px] text-(--text-muted) font-light mt-0.5">
            Photo uploads coming soon. Sign in with Google to use your Google
            photo.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="First Name"
          id="firstName"
          value={firstName}
          onChange={setFirstName}
          placeholder="Chukwuemeka"
          error={errors.firstName}
        />
        <Field
          label="Last Name"
          id="lastName"
          value={lastName}
          onChange={setLastName}
          placeholder="Okafor"
          error={errors.lastName}
        />
      </div>

      <Field
        label="Email Address"
        id="email"
        type="email"
        value={user.email}
        disabled
        hint="Email cannot be changed. Contact support if you need to update it."
      />

      <Field
        label="Phone Number"
        id="phone"
        type="tel"
        value={phone}
        onChange={setPhone}
        placeholder="08012345678"
        error={errors.phone}
        hint="Used for delivery updates and order notifications"
      />

      <button
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-2 bg-(--green-deep) hover:bg-(--green-mid) text-white px-6 py-3 rounded-full text-[14px] font-medium transition-all disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        {loading ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

// ── Security Tab ──────────────────────────────────────────────
function SecurityTab() {
  const { success } = useToast();
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handlePasswordChange() {
    const errs: Record<string, string> = {};
    if (!current) errs.current = "Enter your current password";
    if (newPw.length < 8) errs.newPw = "At least 8 characters";
    if (newPw !== confirm) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    // In production: PATCH /api/user/password with bcrypt comparison
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setCurrent("");
    setNewPw("");
    setConfirm("");
    success("Password updated successfully");
  }

  const pwType = showPw ? "text" : "password";

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-[19px] font-semibold text-(--green-deep) mb-1">
          Change Password
        </h3>
        <p className="text-[13px] text-(--text-muted) font-light">
          Use a strong password with letters, numbers, and symbols.
        </p>
      </div>

      <div className="space-y-4 max-w-md">
        <Field
          label="Current Password"
          id="current"
          type={pwType}
          value={current}
          onChange={setCurrent}
          placeholder="••••••••"
          error={errors.current}
        />
        <Field
          label="New Password"
          id="newPw"
          type={pwType}
          value={newPw}
          onChange={setNewPw}
          placeholder="Min. 8 characters"
          error={errors.newPw}
        />
        <Field
          label="Confirm New Password"
          id="confirm"
          type={pwType}
          value={confirm}
          onChange={setConfirm}
          placeholder="Repeat password"
          error={errors.confirm}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showPw"
            checked={showPw}
            onChange={(e) => setShowPw(e.target.checked)}
            className="w-4 h-4 accent-(--green-mid) cursor-pointer"
          />
          <label
            htmlFor="showPw"
            className="text-[13px] text-(--text-muted) cursor-pointer select-none"
          >
            Show passwords
          </label>
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={loading}
          className="flex items-center gap-2 bg-(--green-deep) hover:bg-(--green-mid) text-white px-6 py-3 rounded-full text-[14px] font-medium transition-all disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Shield size={16} />
          )}
          {loading ? "Updating…" : "Update Password"}
        </button>
      </div>

      {/* Connected accounts */}
      <div className="pt-6 border-t border-(--cream-dark)">
        <h4 className="font-medium text-[15px] text-(--text-dark) mb-4">
          Connected Accounts
        </h4>
        <div className="flex items-center justify-between p-4 border border-(--cream-dark) rounded-xl max-w-md">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <div>
              <p className="text-[13px] font-medium text-(--text-dark)">
                Google
              </p>
              <p className="text-[11px] text-(--text-muted)">
                Connect to sign in with Google
              </p>
            </div>
          </div>
          <button className="text-[12px] text-(--green-mid) font-medium hover:underline">
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Notifications Tab ─────────────────────────────────────────
function NotificationsTab() {
  const { success } = useToast();
  const [prefs, setPrefs] = useState({
    orderUpdates: true,
    safetyAlerts: true,
    newsletter: false,
    productUpdates: false,
    smsUpdates: true,
  });
  const [loading, setLoading] = useState(false);

  const items = [
    {
      id: "orderUpdates",
      label: "Order Updates",
      desc: "Shipping and delivery notifications",
    },
    {
      id: "safetyAlerts",
      label: "Safety Alerts",
      desc: "Alerts about unsafe or recalled products",
    },
    {
      id: "newsletter",
      label: "Newsletter",
      desc: "Weekly herbal health guides and tips",
    },
    {
      id: "productUpdates",
      label: "Product Updates",
      desc: "New products and restocks",
    },
    {
      id: "smsUpdates",
      label: "SMS Notifications",
      desc: "Text messages for order status",
    },
  ] as const;

  async function handleSave() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    success("Notification preferences saved");
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-[19px] font-semibold text-(--green-deep) mb-1">
          Notification Preferences
        </h3>
        <p className="text-[13px] text-(--text-muted) font-light">
          Choose what updates you want to receive by email and SMS.
        </p>
      </div>

      <div className="space-y-3 max-w-lg">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center justify-between p-4 bg-(--cream) border border-(--cream-dark) rounded-xl cursor-pointer hover:border-(--green-pale) transition-colors"
          >
            <div>
              <p className="text-[14px] font-medium text-(--text-dark)">
                {item.label}
              </p>
              <p className="text-[12px] text-(--text-muted) font-light">
                {item.desc}
              </p>
            </div>
            <div
              onClick={() =>
                setPrefs((p) => ({ ...p, [item.id]: !p[item.id] }))
              }
              className={cn(
                "relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0",
                prefs[item.id] ? "bg-(--green-mid)" : "bg-(--cream-dark)",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                  prefs[item.id] ? "translate-x-4" : "translate-x-0",
                )}
              />
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-2 bg-(--green-deep) hover:bg-(--green-mid) text-white px-6 py-3 rounded-full text-[14px] font-medium transition-all disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <CheckCircle size={16} />
        )}
        {loading ? "Saving…" : "Save Preferences"}
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function AccountSettings({ user }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="min-h-screen bg-(--cream)">
      {/* Header */}
      <div className="bg-(--green-deep) py-12">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-[13px] mb-4 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Account
          </Link>
          <h1 className="font-serif text-[32px] font-medium text-white">
            Account Settings
          </h1>
          <p className="text-white/55 text-[14px] font-light mt-1">
            {user.email}
          </p>
        </div>
      </div>

      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 py-10">
        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          {/* Sidebar tabs */}
          <nav className="space-y-1 lg:sticky lg:top-24 h-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all text-left",
                  activeTab === tab.id
                    ? "bg-(--green-deep) text-white"
                    : "text-(--text-body) hover:bg-(--green-pale)/40 hover:text-(--green-deep)",
                )}
              >
                <span
                  className={
                    activeTab === tab.id
                      ? "text-(--gold-light)"
                      : "text-(--text-muted)"
                  }
                >
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}

            {/* Danger zone */}
            <div className="pt-4 mt-4 border-t border-(--cream-dark)">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-red-600 hover:bg-red-50 transition-all text-left">
                <Trash2 size={15} />
                Delete Account
              </button>
            </div>
          </nav>

          {/* Tab content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl border border-(--cream-dark) p-8"
          >
            {activeTab === "profile" && <ProfileTab user={user} />}
            {activeTab === "security" && <SecurityTab />}
            {activeTab === "notifications" && <NotificationsTab />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
