"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { useT } from "@/context/locale-context";
import { AuthField, AuthDivider, GoogleButton } from "./auth-form";
import { Logo } from "@/components/layout/logo";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const verified = params.get("verified");
  const t = useT();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      // Check if email is not verified
      if (result.error.includes("EMAIL_NOT_VERIFIED:")) {
        const userId = result.error.split(":")[1];
        const query = new URLSearchParams({
          userId,
          email: email.trim(),
          callbackUrl,
          password,
        });
        router.push(`/verify-email?${query.toString()}`);
        return;
      }
      setError("Invalid email or password. Please try again.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
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
      className="w-full max-w-105 mx-auto"
    >
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="font-serif text-[28px] font-semibold text-(--green-deep) mb-1">
          {t("auth_welcome_back")}
        </h1>
        <p className="text-[14px] text-(--text-muted) font-light">
          {t("auth_sign_in_sub")}
        </p>
      </div>

      {/* Email verified success banner */}
      {verified && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 text-[13px] px-4 py-3 rounded-xl mb-5 flex items-center gap-2"
        >
          ✅ Email verified! You can now sign in.
        </motion.div>
      )}

      {process.env.NODE_ENV === "development" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-[12px] text-amber-700">
          <strong>Dev:</strong> Run <code>npm run db:seed</code> to create a
          test account.
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-xl mb-5 flex items-center gap-2"
        >
          <span>⚠</span> {error}
        </motion.div>
      )}

      <GoogleButton
        loading={googleLoad}
        onClick={handleGoogle}
        label={t("auth_google")}
      />
      <AuthDivider />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField
          id="email"
          label={t("auth_email")}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="text-[13px] font-medium text-(--text-body)"
            >
              {t("auth_password")} <span className="text-red-400">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] text-(--green-mid) hover:underline"
            >
              {t("auth_forgot")}
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 pr-11 rounded-xl border border-(--cream-dark) bg-white text-[14px] text-(--text-dark) placeholder:text-(--text-muted) outline-none transition-all focus:border-(--green-mid) focus:ring-2 focus:ring-(--green-pale)"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-dark) transition-colors"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-(--green-deep) hover:bg-(--green-mid) text-white py-3.5 rounded-full font-medium text-[15px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" />{" "}
              {t("auth_signing_in")}
            </>
          ) : (
            <>
              <LogIn size={17} /> {t("auth_sign_in")}
            </>
          )}
        </button>
      </form>

      <p className="text-center text-[13px] text-(--text-muted) mt-6">
        {t("auth_no_account")}{" "}
        <Link
          href={`/register${callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="text-(--green-mid) font-medium hover:underline"
        >
          {t("auth_create_free")}
        </Link>
      </p>
    </motion.div>
  );
}
