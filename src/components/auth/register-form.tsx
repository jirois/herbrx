"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  ShoppingBag,
  Package,
  ChevronRight,
} from "lucide-react";
import { useT } from "@/context/locale-context";
import { AuthField, AuthDivider, GoogleButton } from "./auth-form";
import { Logo } from "@/components/layout/logo";
import { signIn } from "next-auth/react";

type Role = "CUSTOMER" | "PRODUCER";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
  // Producer-only
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  rcNumber: string;
}
interface Errors {
  [k: string]: string;
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const t = useT();

  const [role, setRole] = useState<Role | null>(null);
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    rcNumber: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [serverErr, setServerErr] = useState("");

  function set(field: keyof FormState, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field])
      setErrors((e) => {
        const n = { ...e };
        delete n[field];
        return n;
      });
    setServerErr("");
  }

  function validate(f: FormState): Errors {
    const e: Errors = {};
    if (!f.firstName.trim()) e.firstName = "Required";
    if (!f.lastName.trim()) e.lastName = "Required";
    if (!f.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = "Valid email required";
    if (f.phone && !f.phone.match(/^(\+234|0)[789][01]\d{8}$/))
      e.phone = "Valid Nigerian number";
    if (f.password.length < 8) e.password = "At least 8 characters";
    if (f.password !== f.confirm) e.confirm = "Passwords do not match";
    if (role === "PRODUCER" && !f.businessName.trim())
      e.businessName = "Business name is required";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerErr("");
    if (!role) {
      setServerErr("Please select an account type to continue.");
      return;
    }
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
          role,
          // Producer fields
          ...(role === "PRODUCER" && {
            businessName: form.businessName.trim(),
            businessEmail: form.businessEmail.trim() || form.email.trim(),
            businessPhone:
              form.businessPhone.trim() || form.phone.trim() || undefined,
            rcNumber: form.rcNumber.trim() || undefined,
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerErr(data.error ?? "Registration failed.");
        setLoading(false);
        return;
      }

      if (data.needsVerification) {
        const query = new URLSearchParams({
          userId: data.userId,
          email: form.email.trim(),
          callbackUrl,
          password: form.password,
        });
        router.push(`/verify-email?${query.toString()}`);
        return;
      }
      router.push("/login");
    } catch {
      setServerErr("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoad(true);
    await signIn("google", { callbackUrl });
  }

  // ── Step indicator ──────
  const currentStep = !role ? 0 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-120 mx-auto"
    >
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="font-serif text-[28px] font-semibold text-(--green-deep) mb-1">
          Create your HerbRx account
        </h1>
        <p className="text-[14px] text-(--text-muted) font-light">
          Join 2,000+ Nigerians using safe herbal health
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-7 px-1">
        {[
          { n: 1, label: "Account Type" },
          { n: 2, label: "Your Details" },
          { n: 3, label: "Verify Email" },
        ].map((step, i) => (
          <div key={step.n} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  (step.n === 1 && currentStep >= 0) ||
                  (step.n === 2 && currentStep >= 1)
                    ? "bg-(--green-deep) text-white"
                    : "bg-(--cream-dark) text-(--text-muted)"
                }`}
              >
                {step.n}
              </div>
              <span
                className={`text-[11px] hidden sm:block ${step.n <= currentStep + 1 ? "text-(--green-deep) font-medium" : "text-(--text-muted)"}`}
              >
                {step.label}
              </span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-(--cream-dark) ml-1" />}
          </div>
        ))}
      </div>

      {serverErr && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-xl mb-5 flex items-center gap-2"
        >
          <span>⚠</span> {serverErr}
        </motion.div>
      )}

      {/* ── Step 0: Role selector ── */}
      {!role && (
        <motion.div
          key="role-select"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <p className="text-[14px] text-(--text-muted) text-center mb-6 font-light">
            Which best describes you?
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Customer */}
            <button
              type="button"
              onClick={() => setRole("CUSTOMER")}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-(--cream-dark) bg-white hover:border-(--green-mid) hover:shadow-md transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-(--green-pale)/40 group-hover:bg-(--green-pale)/70 flex items-center justify-center transition-colors">
                <ShoppingBag size={26} className="text-(--green-mid)" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-(--green-deep) text-[15px]">
                  Customer
                </p>
                <p className="text-[12px] text-(--text-muted) mt-0.5 font-light leading-snug">
                  I want to buy herbal products & get consultations
                </p>
              </div>
              <ChevronRight
                size={16}
                className="text-(--green-mid) opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>

            {/* Producer */}
            <button
              type="button"
              onClick={() => setRole("PRODUCER")}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-(--cream-dark) bg-white hover:border-(--gold) hover:shadow-md transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                <Package size={26} className="text-(--gold)" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-(--green-deep) text-[15px]">
                  Producer
                </p>
                <p className="text-[12px] text-(--text-muted) mt-0.5 font-light leading-snug">
                  I make or sell herbal products & want to get verified
                </p>
              </div>
              <ChevronRight
                size={16}
                className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          </div>

          <p className="text-[12px] text-(--text-muted) text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-(--green-mid) font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      )}

      {/* ── Step 1: Form ── */}
      {role && (
        <motion.div
          key="form"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Role pill + change */}
          <div className="flex items-center justify-between mb-5 px-1">
            <div
              className={`inline-flex items-center gap-2 text-[13px] font-medium px-3 py-1.5 rounded-full ${role === "PRODUCER" ? "bg-amber-100 text-amber-700" : "bg-(--green-pale)/50 text-(--green-deep)"}`}
            >
              {role === "PRODUCER" ? (
                <Package size={13} />
              ) : (
                <ShoppingBag size={13} />
              )}
              {role === "PRODUCER" ? "Producer Account" : "Customer Account"}
            </div>
            <button
              type="button"
              onClick={() => setRole(null)}
              className="text-[12px] text-(--text-muted) hover:text-(--green-mid) transition-colors"
            >
              Change →
            </button>
          </div>

          <GoogleButton
            loading={googleLoad}
            onClick={handleGoogle}
            label="Continue with Google"
          />
          <AuthDivider />

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <AuthField
                id="firstName"
                label="First Name"
                placeholder="Chukwuemeka"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                error={errors.firstName}
                autoComplete="given-name"
                required
              />
              <AuthField
                id="lastName"
                label="Last Name"
                placeholder="Okafor"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                error={errors.lastName}
                autoComplete="family-name"
                required
              />
            </div>

            <AuthField
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              error={errors.email}
              autoComplete="email"
              required
            />

            <AuthField
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="08012345678"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              error={errors.phone}
              autoComplete="tel"
              hint="Used for order updates and WhatsApp alerts"
            />

            {/* Producer-specific fields */}
            <AnimatePresence>
              {role === "PRODUCER" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Package size={15} className="text-amber-600" />
                      <p className="text-[13px] font-semibold text-amber-800">
                        Business Details
                      </p>
                    </div>
                    <AuthField
                      id="businessName"
                      label="Registered Business Name"
                      placeholder="GreenHealth Nigeria Ltd"
                      value={form.businessName}
                      onChange={(e) => set("businessName", e.target.value)}
                      error={errors.businessName}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <AuthField
                        id="businessEmail"
                        label="Business Email"
                        type="email"
                        placeholder="hello@yourbusiness.ng"
                        value={form.businessEmail}
                        onChange={(e) => set("businessEmail", e.target.value)}
                        error={errors.businessEmail}
                        hint="Defaults to your email"
                      />
                      <AuthField
                        id="rcNumber"
                        label="CAC RC Number"
                        placeholder="RC-1234567"
                        value={form.rcNumber}
                        onChange={(e) => set("rcNumber", e.target.value)}
                        error={errors.rcNumber}
                        hint="Optional at sign-up"
                      />
                    </div>
                    <p className="text-[11px] text-amber-700 font-light leading-relaxed">
                      You can complete additional verification details from your
                      producer dashboard after sign-up.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-(--text-body) mb-1.5"
              >
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-[14px] bg-white text-(--text-dark) placeholder:text-(--text-muted) outline-none transition-all focus:ring-2 ${errors.password ? "border-red-400 focus:ring-red-200" : "border-(--cream-dark) focus:border-(--green-mid) focus:ring-(--green-pale)"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-dark)"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[12px] text-red-500 mt-1">
                  ⚠ {errors.password}
                </p>
              )}
            </div>

            <AuthField
              id="confirm"
              label="Confirm Password"
              type={showPw ? "text" : "password"}
              placeholder="Repeat password"
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
              error={errors.confirm}
              autoComplete="new-password"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-(--green-deep) hover:bg-(--green-mid) text-white py-3.5 rounded-full font-medium text-[15px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" /> Creating
                  account…
                </>
              ) : (
                <>
                  <UserPlus size={17} /> Create Account & Send Code
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[12px] text-(--text-muted) mt-4">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline hover:text-(--green-mid)">
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline hover:text-(--green-mid)"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-center text-[13px] text-(--text-muted) mt-3">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-(--green-mid) font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
