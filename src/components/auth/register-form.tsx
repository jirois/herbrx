"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { useT } from "@/context/locale-context";
import { AuthField, AuthDivider, GoogleButton } from "./auth-form";
import { Logo } from "@/components/layout/logo";
import { signIn } from "next-auth/react";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
}
interface Errors {
  [k: string]: string;
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const t = useT();

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
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
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerErr("");
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
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerErr(data.error ?? "Registration failed.");
        setLoading(false);
        return;
      }

      if (data.needsVerification) {
        // Redirect to OTP verification page
        const query = new URLSearchParams({
          userId: data.userId,
          email: form.email.trim(),
          callbackUrl,
          // Pass encrypted password so we can auto-login after verify
          // In production use a short-lived signed token instead
          password: form.password,
        });
        router.push(`/verify-email?${query.toString()}`);
        return;
      }

      // Shouldn't happen but handle gracefully
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-115 mx-auto"
    >
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="font-serif text-[28px] font-semibold text-(--green-deep) mb-1">
          {t("auth_create_account")}
        </h1>
        <p className="text-[14px] text-(--text-muted) font-light">
          {t("auth_join_sub")}
        </p>
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

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6 px-1">
        {[
          { n: 1, label: "Your Details" },
          { n: 2, label: "Verify Email" },
          { n: 3, label: "Get Started" },
        ].map((step, i) => (
          <div key={step.n} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                  step.n === 1
                    ? "bg-(--green-deep) text-white"
                    : "bg-(--cream-dark) text-(--text-muted)"
                }`}
              >
                {step.n === 1 ? "1" : step.n === 2 ? "2" : "3"}
              </div>
              <span
                className={`text-[11px] hidden sm:block ${step.n === 1 ? "text-(--green-deep) font-medium" : "text-(--text-muted)"}`}
              >
                {step.label}
              </span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-(--cream-dark) ml-1" />}
          </div>
        ))}
      </div>

      <GoogleButton
        loading={googleLoad}
        onClick={handleGoogle}
        label={t("auth_google_signup")}
      />
      <AuthDivider />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <AuthField
            id="firstName"
            label={t("auth_first_name")}
            placeholder="Chukwuemeka"
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            error={errors.firstName}
            autoComplete="given-name"
            required
          />
          <AuthField
            id="lastName"
            label={t("auth_last_name")}
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
          label={t("auth_email")}
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
          label={t("auth_phone")}
          type="tel"
          placeholder="08012345678"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          error={errors.phone}
          autoComplete="tel"
          hint="Used for order delivery updates"
        />

        <div>
          <label
            htmlFor="password"
            className="block text-[13px] font-medium text-(--text-body) mb-1.5"
          >
            {t("auth_password")} <span className="text-red-400">*</span>
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
            <p className="text-[12px] text-red-500 mt-1">⚠ {errors.password}</p>
          )}
        </div>

        <AuthField
          id="confirm"
          label={t("auth_confirm_password")}
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
              <Loader2 size={17} className="animate-spin" /> Creating account…
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
        <Link href="/privacy" className="underline hover:text-(--green-mid)">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="text-center text-[13px] text-(--text-muted) mt-4">
        {t("auth_have_account")}{" "}
        <Link
          href="/login"
          className="text-(--green-mid) font-medium hover:underline"
        >
          {t("auth_sign_in_link")}
        </Link>
      </p>
    </motion.div>
  );
}
