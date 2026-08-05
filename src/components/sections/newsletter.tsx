"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "homepage_newsletter" }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(
        data?.message ??
          "You're subscribed! Check your inbox for a welcome email.",
      );
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error — please check your connection and try again.");
    }
  }

  return (
    <section className="relative bg-(--green-deep) py-20 overflow-hidden">
      {/* Decorative ring */}
      <div className="absolute -left-24 -top-24 w-72 h-72 rounded-full border-50 border-white/4 pointer-events-none" />
      <div className="absolute -right-16 -bottom-16 w-52 h-52 rounded-full border-36 border-white/4 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-140 mx-auto px-6 text-center"
      >
        <span className="inline-block text-[11px] font-medium tracking-[0.15em] uppercase bg-white/10 text-(--gold-light) px-3.5 py-1 rounded-full mb-4">
          Stay Informed
        </span>

        <h2 className="font-serif text-[clamp(28px,4vw,42px)] font-medium text-white mb-4 leading-[1.15]">
          Stay Safe. Stay Informed.
        </h2>
        <p className="text-[15px] text-white/55 leading-relaxed mb-10 font-light">
          Get verified herbal wellness tips, safety alerts, and expert guidance
          delivered straight to your inbox — in plain language.
        </p>

        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-6 py-5"
          >
            <CheckCircle size={20} className="text-(--green-pale) shrink-0" />
            <p className="text-white/90 text-[15px]">{message}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex items-center bg-white rounded-full overflow-hidden pl-5 pr-1.5 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
              <Mail size={16} className="text-(--text-muted) shrink-0 mr-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus("idle");
                }}
                placeholder="Your email address"
                className="flex-1 border-none outline-none text-[14px] text-(--text-dark) bg-transparent min-w-0 placeholder:text-gray-400"
                disabled={status === "loading"}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-(--gold) hover:bg-(--gold-light) text-white text-[14px] font-medium px-6 py-3 rounded-full transition-colors duration-200 whitespace-nowrap flex items-center gap-2 disabled:opacity-70"
              >
                {status === "loading" && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Subscribe →
              </button>
            </div>

            {status === "error" && (
              <p className="text-red-400 text-[13px] mt-3">{message}</p>
            )}
          </form>
        )}

        <p className="text-white/30 text-[12px] mt-5">
          No spam. Unsubscribe anytime. We never share your data.
        </p>
      </motion.div>
    </section>
  );
}
