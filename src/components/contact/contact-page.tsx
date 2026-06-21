"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/sections/footer";

const contactChannels = [
  {
    icon: "📧",
    label: "Email",
    value: "hello@herbrx.ng",
    href: "mailto:hello@herbrx.ng",
    note: "We respond within 24 hours",
  },
  {
    icon: "📞",
    label: "Phone",
    value: "+234 800 HERBRX",
    href: "tel:+2348004372793",
    note: "Mon – Fri, 9 AM – 5 PM WAT",
  },
  {
    icon: "📍",
    label: "Office",
    value: "Lagos, Nigeria",
    href: "#",
    note: "Visit by appointment only",
  },
  {
    icon: "💬",
    label: "WhatsApp",
    value: "Chat with us",
    href: "https://wa.me/2348004372793",
    note: "Fastest response channel",
  },
];

const topics = [
  "General Enquiry",
  "Book a Consultation",
  "Safety Review Request",
  "Producer / Brand Consultancy",
  "Product Submission",
  "Media & Press",
  "Technical Support",
  "Other",
];

type FormState = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

const inputCls =
  "w-full h-11 px-4 rounded-xl border border-[var(--cream-dark)] bg-white text-[var(--text-dark)] text-[14px] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--green-mid)] focus:ring-2 focus:ring-[var(--green-pale)] transition-all";

export function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    topic: topics[0],
    message: "",
  });
  const [status, setStatus] = useState<SubmitStatus>("idle");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("submitting");
    // Simulate async send — wire to your API route or Resend/Nodemailer
    await new Promise((r) => setTimeout(r, 1400));
    setStatus("success");
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-(--green-deep) overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border-70 border-white/4 pointer-events-none" />
        <div className="absolute -left-16 bottom-0 w-64 h-64 rounded-full border-50 border-white/4 pointer-events-none" />

        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 relative z-10 text-center">
          <motion.span
            {...fadeUp(0)}
            className="inline-block text-[11px] font-medium tracking-[0.15em] uppercase rounded-full px-3.5 py-1 mb-4 bg-white/10 text-(--gold-light)"
          >
            Get in Touch
          </motion.span>
          <motion.h1
            {...fadeUp(0.08)}
            className="font-serif font-medium text-white text-[clamp(34px,5vw,62px)] leading-[1.1] mb-6 max-w-2xl mx-auto"
          >
            We&apos;d love to{" "}
            <em className="not-italic text-(--gold-light)">hear from you</em>
          </motion.h1>
          <motion.p
            {...fadeUp(0.16)}
            className="text-white/60 text-[17px] font-light leading-relaxed max-w-xl mx-auto"
          >
            Whether you have a question, need a consultation, or want to partner
            with us — our team is ready to help.
          </motion.p>
        </div>
      </section>

      {/* ── Contact channels ── */}
      <section className="py-16 bg-(--cream-dark)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactChannels.map((ch, i) => (
              <motion.a
                key={ch.label}
                href={ch.href}
                target={ch.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                {...fadeUp(i * 0.08)}
                className="bg-white border border-(--cream-dark) rounded-2xl p-6 flex flex-col gap-1.5 hover:border-(--green-mid) hover:shadow-md transition-all duration-200 group"
              >
                <div className="text-[28px] mb-1">{ch.icon}</div>
                <div className="text-[12px] font-semibold text-(--text-muted) uppercase tracking-wide">
                  {ch.label}
                </div>
                <div className="text-[15px] font-medium text-(--green-deep) group-hover:text-(--green-mid) transition-colors">
                  {ch.value}
                </div>
                <div className="text-[12px] text-(--text-muted) font-light">
                  {ch.note}
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form + info ── */}
      <section className="py-20 lg:py-28 bg-(--cream)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-16 items-start">
            {/* Left info */}
            <motion.div {...fadeUp(0)}>
              <SectionTitle
                tag="Contact Us"
                title="Send us a message"
                subtitle="Fill in the form and one of our team members will get back to you within one business day."
              />

              <div className="space-y-5">
                <div className="bg-(--green-pale)/30 border border-(--green-pale) rounded-2xl p-6">
                  <div className="text-[22px] mb-2">🌿</div>
                  <h4 className="font-serif text-[17px] font-semibold text-(--green-deep) mb-1">
                    Prefer a consultation?
                  </h4>
                  <p className="text-[13px] text-(--text-muted) leading-relaxed mb-4 font-light">
                    Book directly with one of our herbal pharmacists for a
                    personalised 60-minute session.
                  </p>
                  <Button variant="primary" size="sm" href="/booking">
                    Book a Session
                  </Button>
                </div>

                <div className="bg-[#FFF8EC] border border-(--gold-light)/30 rounded-2xl p-6">
                  <div className="text-[22px] mb-2">📋</div>
                  <h4 className="font-serif text-[17px] font-semibold text-(--green-deep) mb-1">
                    Have a product to review?
                  </h4>
                  <p className="text-[13px] text-(--text-muted) leading-relaxed mb-4 font-light">
                    Submit your herbal product and receive a detailed
                    independent safety and efficacy report.
                  </p>
                  <Button variant="outline" size="sm" href="/submit">
                    Submit a Product
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Right: form */}
            <motion.div {...fadeUp(0.1)}>
              {status === "success" ? (
                <div className="bg-white border border-(--cream-dark) rounded-2xl p-10 text-center">
                  <div className="text-[48px] mb-4">🌿</div>
                  <h3 className="font-serif text-[24px] font-semibold text-(--green-deep) mb-2">
                    Message received!
                  </h3>
                  <p className="text-(--text-muted) text-[15px] font-light mb-6">
                    Thank you, {form.name}. We&apos;ll get back to you at{" "}
                    {form.email} within one business day.
                  </p>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setStatus("idle");
                      setForm({
                        name: "",
                        email: "",
                        topic: topics[0],
                        message: "",
                      });
                    }}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white border border-(--cream-dark) rounded-2xl p-8 space-y-5"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-(--text-body) mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-(--text-body) mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-(--text-body) mb-1.5">
                      Topic
                    </label>
                    <select
                      name="topic"
                      value={form.topic}
                      onChange={handleChange}
                      className={inputCls}
                    >
                      {topics.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-(--text-body) mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help…"
                      required
                      rows={5}
                      className={`${inputCls} h-auto py-3 resize-none`}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? "Sending…" : "Send Message →"}
                  </Button>

                  <p className="text-[12px] text-(--text-muted) text-center font-light">
                    We respond within 24 hours on business days. Your data is
                    kept private and never sold.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
