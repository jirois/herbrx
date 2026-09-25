"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  source: string;
}

/**
 * A compact version of the homepage newsletter form, for sidebars (e.g.
 * the blog post page). Posts to the same /api/newsletter/subscribe
 * endpoint — previously this markup had a "Join" button with no handler
 * at all, so nothing happened when it was clicked.
 */
export function NewsletterMini({ source }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error");
      setMessage("Enter a valid email.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data?.error ?? "Something went wrong.");
        return;
      }
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error — try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-[13px] text-white">
        <Check size={14} className="text-(--green-pale) shrink-0" />
        You&apos;re subscribed!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          placeholder="Your email"
          disabled={status === "loading"}
          className="flex-1 bg-white/10 border border-white/20 rounded-full px-3 py-2 text-[13px] text-white placeholder:text-white/40 outline-none focus:border-white/50 min-w-0 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex items-center gap-1.5 bg-(--gold) text-white text-[12px] font-medium px-4 py-2 rounded-full hover:bg-(--gold-light) transition-colors whitespace-nowrap shrink-0 disabled:opacity-70"
        >
          {status === "loading" && (
            <Loader2 size={12} className="animate-spin" />
          )}
          Join
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-300 text-[12px] mt-2">{message}</p>
      )}
    </form>
  );
}
