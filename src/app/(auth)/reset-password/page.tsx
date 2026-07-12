"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";

// /reset-password?userId=xxx&code=yyy
// Arrived here from the email link. We pre-fill userId + code from
// the URL, skip the email/code entry steps, and go straight to the
// new-password form.
// Also handles the case where the user arrives manually (no params)
// and redirects them to /forgot-password.

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlUserId = searchParams.get("userId") ?? "";
  const urlCode = searchParams.get("code") ?? "";

  // If user has arrived with both params we skip to the password step.
  // Otherwise show the manual code-entry form (same UX as forgot-password step 2).
  const [step, setStep] = useState<"code" | "password" | "done">(
    urlUserId && urlCode ? "password" : "code",
  );
  const [userId] = useState(urlUserId);
  const [code, setCode] = useState(
    urlCode
      ? urlCode.slice(0, 6).split("").concat(Array(6).fill("")).slice(0, 6)
      : ["", "", "", "", "", ""],
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Strength score ────────
  function strength(pw: string): number {
    if (!pw) return 0;
    let s = Math.min(4, Math.floor(pw.length / 3));
    if (/[A-Z]/.test(pw)) s = Math.min(4, s + 1);
    if (/[0-9]/.test(pw)) s = Math.min(4, s + 1);
    if (/[^a-zA-Z0-9]/.test(pw)) s = Math.min(4, s + 1);
    return s;
  }
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-blue-400",
    "bg-green-400",
  ];
  const pw_strength = strength(password);

  // ── OTP digit inputs ──────
  function handleDigit(i: number, value: string) {
    const v = value.replace(/\D/, "").slice(-1);
    const next = [...code];
    next[i] = v;
    setCode(next);
    if (v && i < 5) codeRefs.current[i + 1]?.focus();
  }
  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[i] && i > 0)
      codeRefs.current[i - 1]?.focus();
  }
  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");
    const next = [...code];
    digits.forEach((d, i) => {
      next[i] = d;
    });
    setCode(next);
    codeRefs.current[Math.min(digits.length, 5)]?.focus();
  }

  // ── Step 1: advance from code → password ────
  function handleCodeContinue(e: React.FormEvent) {
    e.preventDefault();
    if (code.join("").length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError("");
    setStep("password");
  }

  // ── Resend code ───────
  async function handleResend() {
    if (!userId) {
      router.push("/forgot-password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, purpose: "PASSWORD_RESET" }),
      });
      setResent(true);
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => setResent(false), 5000);
    } catch {
      setError("Could not resend. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: submit new password ────────
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!userId) {
      setError(
        "Missing user ID. Please restart from the forgot-password page.",
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          code: code.join(""),
          newPassword: password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Password reset failed.");
        // If OTP expired, kick back to code entry
        if (
          data.error?.includes("expired") ||
          data.error?.includes("attempts")
        ) {
          setStep("code");
          setCode(["", "", "", "", "", ""]);
        }
        return;
      }
      setStep("done");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = (err = false) =>
    `w-full px-4 py-3 rounded-xl border text-[14px] bg-white text-[var(--text-dark)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:ring-2 ${err ? "border-red-400 focus:ring-red-200" : "border-[var(--cream-dark)] focus:border-[var(--green-mid)] focus:ring-[var(--green-pale)]"}`;

  return (
    <div className="min-h-screen bg-(--cream) flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-110"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1 className="font-serif text-[26px] font-semibold text-(--green-deep) mb-1">
            {step === "done" ? "Password Updated!" : "Reset Your Password"}
          </h1>
          <p className="text-[13px] text-(--text-muted) font-light">
            {step === "code" && "Enter the 6-digit code from your email"}
            {step === "password" &&
              "Choose a new secure password for your account"}
            {step === "done" && "Your password has been changed successfully"}
          </p>
        </div>

        {/* Step dots */}
        {step !== "done" && (
          <div className="flex items-center justify-center gap-2 mb-7">
            {["code", "password"].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${s === step ? "w-8 bg-(--green-mid)" : "w-2 bg-(--cream-dark)"}`}
              />
            ))}
          </div>
        )}

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-xl mb-5"
            >
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resent confirmation */}
        <AnimatePresence>
          {resent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-[13px] px-4 py-3 rounded-xl mb-5"
            >
              <CheckCircle size={14} /> A new code has been sent to your email.
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Code step ── */}
        {step === "code" && (
          <form onSubmit={handleCodeContinue} className="space-y-6">
            <div>
              <label className="block text-[13px] font-medium text-(--text-body) mb-4 text-center">
                6-digit reset code
              </label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {code.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      codeRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-11 h-14 text-center text-[20px] font-semibold rounded-xl border border-(--cream-dark) bg-white text-(--text-dark) outline-none focus:border-(--green-mid) focus:ring-2 focus:ring-(--green-pale) transition-all"
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={code.join("").length < 6}
              className="w-full flex items-center justify-center gap-2 bg-(--green-deep) hover:bg-(--green-mid) text-white py-3.5 rounded-full font-medium text-[15px] transition-all disabled:opacity-50"
            >
              Continue →
            </button>
            <div className="flex items-center justify-between text-[13px]">
              <Link
                href="/forgot-password"
                className="flex items-center gap-1.5 text-(--text-muted) hover:text-(--green-mid) transition-colors"
              >
                <ArrowLeft size={13} /> Start over
              </Link>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="flex items-center gap-1.5 text-(--green-mid) hover:text-(--green-deep) transition-colors disabled:opacity-50"
              >
                <RotateCcw size={13} /> Resend code
              </button>
            </div>
          </form>
        )}

        {/* ── New password step ── */}
        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* New password */}
            <div>
              <label className="block text-[13px] font-medium text-(--text-body) mb-1.5">
                New Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className={`${inputCls()} pl-10 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-dark)"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-all ${n <= pw_strength ? strengthColor[pw_strength] : "bg-(--cream-dark)"}`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-[11px] mt-1 ${pw_strength <= 1 ? "text-red-500" : pw_strength === 2 ? "text-amber-500" : pw_strength === 3 ? "text-blue-500" : "text-green-600"}`}
                  >
                    {strengthLabel[pw_strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-[13px] font-medium text-(--text-body) mb-1.5">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setError("");
                  }}
                  placeholder="Repeat your new password"
                  autoComplete="new-password"
                  className={`${inputCls()} pl-10`}
                />
              </div>
              {confirm && confirm !== password && (
                <p className="text-[12px] text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
              {confirm && confirm === password && password.length >= 8 && (
                <p className="text-[12px] text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle size={11} /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                password.length < 8 ||
                password !== confirm ||
                pw_strength < 2
              }
              className="w-full flex items-center justify-center gap-2.5 bg-(--green-deep) hover:bg-(--green-mid) text-white py-3.5 rounded-full font-medium text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Updating
                  password…
                </>
              ) : (
                "Set New Password"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("code");
                setError("");
              }}
              className="w-full flex items-center justify-center gap-1.5 text-[13px] text-(--text-muted) hover:text-(--green-mid) transition-colors mt-1"
            >
              <ArrowLeft size={13} /> Back to code entry
            </button>
          </form>
        )}

        {/* ── Done ── */}
        {step === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <p className="text-[14px] text-(--text-muted) mb-6 font-light">
              Your HerbRx password has been updated. You can now sign in with
              your new password.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-(--green-deep) hover:bg-(--green-mid) text-white py-3.5 rounded-full font-medium text-[15px] transition-all"
            >
              Sign In with New Password
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-(--text-muted)">
          <Loader2 size={24} className="animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
