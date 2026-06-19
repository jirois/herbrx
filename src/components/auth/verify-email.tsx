"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { CheckCircle, RefreshCw, ArrowLeft, Loader2, Mail } from "lucide-react";
import { Logo } from "@/components/layout/logo";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds
const AUTO_SUBMIT_MS = 400; // ms after last digit to auto-submit

export function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get("userId") ?? "";
  const emailHint = params.get("email") ?? "";
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const autoPass = params.get("password") ?? ""; // for auto-login after verify

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const submit = useCallback(
    async (code: string) => {
      if (code.length < CODE_LENGTH || status === "loading") return;
      setStatus("loading");
      setMessage("");

      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, code }),
        });
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error ?? "Verification failed. Please try again.");
          setDigits(Array(CODE_LENGTH).fill(""));
          inputRefs.current[0]?.focus();
          return;
        }

        setStatus("success");
        setMessage(data.message);

        // Auto sign-in if we have credentials
        if (autoPass && emailHint) {
          const result = await signIn("credentials", {
            email: emailHint,
            password: autoPass,
            redirect: false,
            callbackUrl,
          });
          if (result?.url) {
            router.push(callbackUrl);
            return;
          }
        }

        // Otherwise redirect to login
        setTimeout(() => router.push("/login?verified=1"), 1800);
      } catch {
        setStatus("error");
        setMessage("Network error. Please check your connection.");
        setDigits(Array(CODE_LENGTH).fill(""));
      }
    },
    [userId, status, autoPass, emailHint, callbackUrl, router],
  );

  function handleChange(index: number, value: string) {
    // Handle paste of full code
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
      const next = [...Array(CODE_LENGTH).fill("")];
      pasted.split("").forEach((c, i) => {
        next[i] = c;
      });
      setDigits(next);
      const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();
      if (pasted.length === CODE_LENGTH) {
        if (autoTimer.current) clearTimeout(autoTimer.current);
        autoTimer.current = setTimeout(() => submit(pasted), AUTO_SUBMIT_MS);
      }
      return;
    }

    const char = value.replace(/\D/g, "");
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setStatus("idle");
    setMessage("");

    if (char && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();

    const full = next.join("");
    if (full.length === CODE_LENGTH) {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      autoTimer.current = setTimeout(() => submit(full), AUTO_SUBMIT_MS);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setMessage("");
    setStatus("idle");
    setDigits(Array(CODE_LENGTH).fill(""));
    inputRefs.current[0]?.focus();

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, purpose: "EMAIL_VERIFICATION" }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("A new code has been sent to your email.");
        setCooldown(RESEND_COOLDOWN);
      } else {
        setMessage(data.error ?? "Failed to resend. Please wait a moment.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  const maskedEmail = emailHint
    ? emailHint.replace(
        /(.{2})(.*)(@.*)/,
        (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c,
      )
    : "your email";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-105"
    >
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Logo />
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-(--cream-dark) p-8 shadow-[0_8px_40px_rgba(26,58,42,0.08)]">
        {status === "success" ? (
          /* Success state */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
              className="w-20 h-20 bg-(--green-pale) rounded-full flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle size={40} className="text-(--green-mid)" />
            </motion.div>
            <h2 className="font-serif text-[24px] font-semibold text-(--green-deep) mb-2">
              Email Verified!
            </h2>
            <p className="text-[14px] text-(--text-muted) font-light leading-relaxed">
              {message || "Your email has been verified. Redirecting you now…"}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-4 text-[13px] text-(--text-muted)">
              <Loader2 size={14} className="animate-spin" /> Signing you in…
            </div>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-7">
              <div className="w-14 h-14 bg-(--green-pale) rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail size={26} className="text-(--green-mid)" />
              </div>
              <h1 className="font-serif text-[24px] font-semibold text-(--green-deep) mb-1.5">
                Check your email
              </h1>
              <p className="text-[14px] text-(--text-muted) font-light leading-relaxed">
                We sent a 6-digit code to{" "}
                <strong className="text-(--text-dark) font-medium">
                  {maskedEmail}
                </strong>
                . Enter it below to verify your account.
              </p>
            </div>

            {/* OTP Inputs */}
            <div className="flex items-center justify-center gap-2.5 mb-5">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                  disabled={status === "loading"}
                  aria-label={`Digit ${i + 1}`}
                  className={`
                    w-12 h-14 text-center font-serif text-[22px] font-semibold rounded-xl border-2
                    outline-none transition-all duration-150 caret-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      digit
                        ? "border-(--green-mid) bg-(--green-pale)/20 text-(--green-deep)"
                        : "border-(--cream-dark) bg-white text-(--text-dark)"
                    }
                    focus:border-(--green-mid) focus:ring-2 focus:ring-(--green-pale)
                    ${status === "error" ? "border-red-400 bg-red-50 animate-shake" : ""}
                  `}
                />
              ))}
            </div>

            {/* Error / info message */}
            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-[13px] text-center mb-4 ${
                    status === "error" ? "text-red-500" : "text-(--green-mid)"
                  }`}
                >
                  {status === "error" ? "⚠ " : "✓ "}
                  {message}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              onClick={() => submit(digits.join(""))}
              disabled={
                digits.join("").length < CODE_LENGTH || status === "loading"
              }
              className="w-full flex items-center justify-center gap-2.5 bg-(--green-deep) hover:bg-(--green-mid) text-white py-3.5 rounded-full font-medium text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-5"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={17} className="animate-spin" /> Verifying…
                </>
              ) : (
                "Verify Email"
              )}
            </button>

            {/* Resend */}
            <div className="text-center">
              <p className="text-[13px] text-(--text-muted) mb-2">
                Didn&apos;t receive a code?
              </p>
              <button
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-(--green-mid) hover:text-(--green-deep) disabled:text-(--text-muted) disabled:cursor-not-allowed transition-colors"
              >
                {resending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Sending…
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <RefreshCw size={13} /> Resend in {cooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw size={13} /> Resend code
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Back to login */}
      <div className="text-center mt-5">
        <button
          onClick={() => router.push("/login")}
          className="inline-flex items-center gap-1.5 text-[13px] text-(--text-muted) hover:text-(--green-mid) transition-colors"
        >
          <ArrowLeft size={13} /> Back to Sign In
        </button>
      </div>
    </motion.div>
  );
}
