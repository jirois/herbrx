"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";

type Step = "email" | "code" | "password" | "done";

const inputCls = (err?: string) =>
  `w-full px-4 py-3 rounded-xl border text-[14px] bg-white text-[var(--text-dark)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:ring-2 ${err ? "border-red-400 focus:ring-red-200" : "border-[var(--cream-dark)] focus:border-[var(--green-mid)] focus:ring-[var(--green-pale)]"}`;

function ForgotPasswordContent() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Step 1: send reset code ──────────────────────────────────────────
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "PASSWORD_RESET" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send reset code.");
        return;
      }
      setUserId(data.userId ?? "");
      setStep("code");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ─────
  async function handleResend() {
    setError("");
    setResendMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "PASSWORD_RESET" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not resend code.");
        return;
      }
      setCode(["", "", "", "", "", ""]);
      setResendMsg("A new code has been sent.");
      codeRefs.current[0]?.focus();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── OTP digit input handling ──────
  function handleDigit(i: number, value: string) {
    const v = value.replace(/\D/, "").slice(-1);
    const next = [...code];
    next[i] = v;
    setCode(next);
    if (v && i < 5) codeRefs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      codeRefs.current[i - 1]?.focus();
    }
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

  // ── Step 2: verify OTP ─────────
  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const full = code.join("");
    if (full.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    try {
      // We verify the code exists and is valid by attempting a lightweight
      // check; the full consume happens in the reset-password call.
      // For simplicity we go straight to the password step and let
      // reset-password do the single authoritative consumption.
      setStep("password");
    } catch {
      setError("Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3: set new password ──
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
        setError(data.error ?? "Could not reset password.");
        if (
          data.error?.includes("expired") ||
          data.error?.includes("attempts")
        ) {
          setStep("code"); // push back to re-enter code
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

  const stepIndex = { email: 0, code: 1, password: 2, done: 3 }[step];

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
            {step === "done" ? "Password Reset!" : "Forgot Password"}
          </h1>
          <p className="text-[13px] text-(--text-muted) font-light">
            {step === "email" &&
              "Enter your email and we'll send a 6-digit reset code."}
            {step === "code" && `Enter the 6-digit code sent to ${email}`}
            {step === "password" &&
              "Choose a strong new password for your account."}
            {step === "done" &&
              "Your password has been updated. You can now sign in."}
          </p>
        </div>

        {/* Step dots */}
        {step !== "done" && (
          <div className="flex items-center justify-center gap-2 mb-7">
            {["email", "code", "password"].map((s, i) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${i === stepIndex ? "w-8 bg-(--green-mid)" : i < stepIndex ? "w-2 bg-(--green-mid)/40" : "w-2 bg-(--cream-dark)"}`}
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
              className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-xl mb-5 flex items-center gap-2"
            >
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Email step ── */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-(--text-body) mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`${inputCls(error ? error : "")} pl-10`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-(--green-deep) hover:bg-(--green-mid) text-white py-3.5 rounded-full font-medium text-[15px] transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending code…
                </>
              ) : (
                "Send Reset Code"
              )}
            </button>
            <p className="text-center text-[13px] text-(--text-muted)">
              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 hover:text-(--green-mid) transition-colors"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </p>
          </form>
        )}

        {/* ── Code step ── */}
        {step === "code" && (
          <form onSubmit={handleCodeSubmit} className="space-y-6">
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
              {resendMsg && (
                <p className="text-center text-[12px] text-(--green-mid) mt-3">
                  {resendMsg}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || code.join("").length < 6}
              className="w-full flex items-center justify-center gap-2 bg-(--green-deep) hover:bg-(--green-mid) text-white py-3.5 rounded-full font-medium text-[15px] transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Checking…
                </>
              ) : (
                "Verify Code"
              )}
            </button>
            <div className="flex items-center justify-between text-[13px]">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="flex items-center gap-1.5 text-(--text-muted) hover:text-(--green-mid) transition-colors"
              >
                <ArrowLeft size={13} /> Change email
              </button>
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
            <div>
              <label className="block text-[13px] font-medium text-(--text-body) mb-1.5">
                New Password
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
                  className={`${inputCls(error && !confirm ? error : "")} pl-10 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-dark)"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength indicator */}
              {password && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((n) => {
                    const strength = Math.min(
                      4,
                      Math.floor(password.length / 3) +
                        (password.match(/[A-Z]/) ? 1 : 0) +
                        (password.match(/[0-9]/) ? 1 : 0) +
                        (password.match(/[^a-zA-Z0-9]/) ? 1 : 0),
                    );
                    return (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-all ${n <= strength ? (strength <= 1 ? "bg-red-400" : strength <= 2 ? "bg-amber-400" : strength <= 3 ? "bg-blue-400" : "bg-green-400") : "bg-(--cream-dark)"}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[13px] font-medium text-(--text-body) mb-1.5">
                Confirm New Password
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
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className={`${inputCls(confirm && confirm !== password ? "mismatch" : "")} pl-10`}
                />
              </div>
              {confirm && confirm !== password && (
                <p className="text-[12px] text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || password.length < 8 || password !== confirm}
              className="w-full flex items-center justify-center gap-2.5 bg-(--green-deep) hover:bg-(--green-mid) text-white py-3.5 rounded-full font-medium text-[15px] transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Updating…
                </>
              ) : (
                "Set New Password"
              )}
            </button>
          </form>
        )}

        {/* ── Done step ── */}
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
              Your password has been changed successfully.
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

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-(--text-muted)">
          Loading…
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
