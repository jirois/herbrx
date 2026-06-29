"use client";

import { useState } from "react";
import { motion } from "framer-motion";
// import Link from "next/link";
import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { Newsletter } from "@/components/sections/newsletter";
import { Footer } from "@/components/sections/footer";
import { AlertTriangle, Search, Package, Hash } from "lucide-react";
import { alertsApi } from "@/hooks/dashboard-hooks";

type Severity = "DANGER" | "WARNING" | "INFO";
type Status = "ACTIVE" | "RESOLVED";

interface Alert {
  id: string;
  title: string;
  body: string;
  severity: Severity;
  status: Status;
  productName?: string;
  batchNo?: string;
  publishedAt: string;
  affectedArea?: string;
}

const ALERTS: Alert[] = [
  {
    id: "a1",
    severity: "DANGER",
    status: "ACTIVE",
    title: "Counterfeit Moringa Capsules Detected in Lagos Markets",
    body: 'Multiple batches of counterfeit "SuperGreen Moringa 500mg" have been identified in Lagos Island and Alaba markets. Independent lab analysis reveals lead levels of 12.4 mg/kg — over 6× the safe limit of 2 mg/kg — along with undisclosed chalk fillers. Do not consume any capsules matching this description. Dispose of immediately.',
    productName: "SuperGreen Moringa 500mg",
    batchNo: "B2024-FAKE-01",
    publishedAt: "20 June 2025",
    affectedArea: "Lagos Island, Alaba Market",
  },
  {
    id: "a2",
    severity: "WARNING",
    status: "ACTIVE",
    title: "Drug Interaction Advisory: St. John's Wort + SSRI Antidepressants",
    body: "Multiple user reports and clinical evidence confirm a significant risk of serotonin syndrome when combining St. John's Wort (Hypericum perforatum) with SSRI antidepressants including sertraline, fluoxetine, and citalopram. Symptoms of serotonin syndrome include confusion, rapid heart rate, high blood pressure, and fever. Patients taking SSRIs must discontinue St. John's Wort immediately and consult their physician.",
    productName: "St. John's Wort Extract",
    batchNo: undefined,
    publishedAt: "19 June 2025",
    affectedArea: "Nationwide",
  },
  {
    id: "a3",
    severity: "WARNING",
    status: "ACTIVE",
    title: "High-Dose Bitter Leaf — Risk of Hypoglycaemia in Diabetic Patients",
    body: "New evidence indicates that high-dose aqueous Bitter Leaf (Vernonia amygdalina) preparations exceeding 500mg/day may produce additive blood glucose-lowering effects when combined with metformin, glibenclamide, or insulin. Diabetic patients using Bitter Leaf preparations should monitor blood glucose closely and discuss with their physician before continuing use.",
    productName: undefined,
    batchNo: undefined,
    publishedAt: "14 June 2025",
    affectedArea: "Nationwide",
  },
  {
    id: "a4",
    severity: "DANGER",
    status: "RESOLVED",
    title: "Shea Butter Adulteration — Kano Batch B2024-11 Recalled",
    body: 'Batch B2024-11 of "PureShea Body Butter" by ZoboFresh Ltd was found to contain undisclosed industrial additives and failed microbial count screening (TPC: 8.2×10⁴ CFU/g vs limit of 1×10⁴ CFU/g). All units have been recalled from distribution. The producer has been suspended from the HerbRx marketplace pending a full compliance review.',
    productName: "PureShea Body Butter",
    batchNo: "B2024-11",
    publishedAt: "15 May 2025",
    affectedArea: "Kano, Kaduna",
  },
  {
    id: "a5",
    severity: "INFO",
    status: "RESOLVED",
    title: "Updated Safety Guidelines: Bitter Leaf (Vernonia amygdalina)",
    body: "HerbRx has published updated safety guidelines for all Bitter Leaf preparations, incorporating new pharmacological research from the University of Lagos and Ahmadu Bello University. Revised recommended dosages, interaction warnings, and contraindications are now available on our Safety Reviews page and in the Herb Directory.",
    productName: undefined,
    batchNo: undefined,
    publishedAt: "10 April 2025",
    affectedArea: "Nationwide",
  },
];

const severityConfig: Record<
  Severity,
  {
    bg: string;
    border: string;
    badge: string;
    icon: string;
    label: string;
    dot: string;
  }
> = {
  DANGER: {
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700 border-red-200",
    icon: "🚨",
    label: "Danger",
    dot: "bg-red-500",
  },
  WARNING: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    icon: "⚠️",
    label: "Warning",
    dot: "bg-amber-500",
  },
  INFO: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "ℹ️",
    label: "Info",
    dot: "bg-blue-500",
  },
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

export default function AlertsPage() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ACTIVE");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = ALERTS.filter((a) => {
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.productName?.toLowerCase().includes(search.toLowerCase());
    const matchSeverity =
      severityFilter === "ALL" || a.severity === severityFilter;
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });

  const activeCount = ALERTS.filter((a) => a.status === "ACTIVE").length;
  const dangerCount = ALERTS.filter(
    (a) => a.severity === "DANGER" && a.status === "ACTIVE",
  ).length;

  return (
    <>
      {/* Hero */}
      <section className="relative bg-(--green-deep) overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border-70 border-white/4 pointer-events-none" />
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-10">
            <div className="flex-1">
              <motion.span
                {...fadeUp(0)}
                className="inline-block text-[11px] font-medium tracking-[0.15em] uppercase rounded-full px-3.5 py-1 mb-4 bg-white/10 text-(--gold-light)"
              >
                Safety Alerts
              </motion.span>
              <motion.h1
                {...fadeUp(0.08)}
                className="font-serif font-medium text-white text-[clamp(34px,5vw,58px)] leading-[1.1] mb-4"
              >
                Platform-Wide
                <br />
                <em className="not-italic text-(--gold-light)">
                  Safety Alerts
                </em>
              </motion.h1>
              <motion.p
                {...fadeUp(0.15)}
                className="text-white/60 text-[17px] font-light leading-relaxed max-w-lg mb-8"
              >
                Real-time warnings about adulterated, counterfeit, or dangerous
                herbal products circulating in Nigeria. Updated as new threats
                are identified.
              </motion.p>
              <motion.div {...fadeUp(0.2)} className="flex flex-wrap gap-3">
                <Button variant="secondary" size="md" href="#alerts">
                  View Active Alerts
                </Button>
                <Button variant="outline-light" size="md" href="#subscribe">
                  Subscribe to Alerts
                </Button>
              </motion.div>
            </div>
            {/* Live stats */}
            <motion.div
              {...fadeUp(0.25)}
              className="lg:w-64 flex flex-col gap-3"
            >
              {[
                {
                  label: "Active Alerts",
                  value: String(activeCount),
                  color: "text-red-300",
                },
                {
                  label: "Danger Level",
                  value: String(dangerCount),
                  color: "text-orange-300",
                },
                {
                  label: "Herbs Monitored",
                  value: "150+",
                  color: "text-[var(--green-pale)]",
                },
                {
                  label: "Last Updated",
                  value: "Today",
                  color: "text-white/80",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/6 border border-white/8"
                >
                  <span className="text-[13px] text-white/50">{s.label}</span>
                  <span className={`text-[15px] font-semibold ${s.color}`}>
                    {s.value}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Alert disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 py-3 flex items-center gap-3 text-[13px] text-amber-800">
          <AlertTriangle size={15} className="shrink-0" />
          <p>
            These alerts are independently published by HerbRx. We are not
            affiliated with NAFDAC or any government agency. Always verify with
            your pharmacist before consuming any herbal product.
          </p>
        </div>
      </div>

      {/* Alerts section */}
      <section id="alerts" className="py-16 lg:py-20 bg-(--cream)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search alerts or products…"
                className="w-full h-11 pl-10 pr-4 bg-white border border-(--cream-dark) rounded-xl text-[14px] text-(--text-dark) placeholder:text-(--text-muted) outline-none focus:border-(--green-mid) focus:ring-2 focus:ring-(--green-pale) transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["ALL", "ACTIVE", "RESOLVED"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-[12px] font-medium px-4 py-2 rounded-lg border transition-all ${statusFilter === s ? "bg-(--green-deep) text-white border-(--green-deep)" : "bg-white text-(--text-muted) border-(--cream-dark) hover:border-(--green-mid)"}`}
                >
                  {s === "ALL"
                    ? "All Status"
                    : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
              <div className="w-px bg-(--cream-dark)" />
              {(["ALL", "DANGER", "WARNING", "INFO"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  className={`text-[12px] font-medium px-4 py-2 rounded-lg border transition-all ${severityFilter === s ? "bg-(--green-deep) text-white border-(--green-deep)" : "bg-white text-(--text-muted) border-(--cream-dark) hover:border-(--green-mid)"}`}
                >
                  {s === "ALL"
                    ? "All Severity"
                    : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Alert cards */}
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="text-center py-16 text-(--text-muted)">
                No alerts match your filter.
              </div>
            )}
            {filtered.map((alert, i) => {
              const cfg = severityConfig[alert.severity];
              const isExpanded = expanded === alert.id;
              const isResolved = alert.status === "RESOLVED";

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border overflow-hidden transition-all ${isResolved ? "bg-white border-(--cream-dark) opacity-70" : `${cfg.bg} ${cfg.border}`}`}
                >
                  <button
                    className="w-full text-left p-6"
                    onClick={() => setExpanded(isExpanded ? null : alert.id)}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-[24px] shrink-0 mt-0.5">
                        {cfg.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}
                          >
                            {cfg.label}
                          </span>
                          <span
                            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${isResolved ? "bg-(--cream-dark) text-(--text-muted) border-(--cream-dark)" : "bg-green-100 text-green-700 border-green-200"}`}
                          >
                            {isResolved ? "✓ Resolved" : "● Active"}
                          </span>
                          {alert.affectedArea && (
                            <span className="text-[11px] text-(--text-muted)">
                              📍 {alert.affectedArea}
                            </span>
                          )}
                        </div>
                        <h3
                          className={`font-serif text-[18px] font-semibold mb-1 ${isResolved ? "text-(--text-muted) line-through" : "text-(--green-deep)"}`}
                        >
                          {alert.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[12px] text-(--text-muted) flex-wrap">
                          <span>Published {alert.publishedAt}</span>
                          {alert.productName && (
                            <span className="flex items-center gap-1">
                              <Package size={11} /> {alert.productName}
                            </span>
                          )}
                          {alert.batchNo && (
                            <span className="flex items-center gap-1">
                              <Hash size={11} /> {alert.batchNo}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-(--text-muted) text-[12px] shrink-0 mt-1">
                        {isExpanded ? "▲ Less" : "▼ More"}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-black/6 pt-4">
                      <p className="text-[15px] text-(--text-body) leading-relaxed mb-4">
                        {alert.body}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" href="/booking">
                          Speak to a Pharmacist
                        </Button>
                        {alert.productName && (
                          <Button variant="ghost" size="sm" href={`/herbs`}>
                            Check Herb Directory →
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subscribe to alerts */}
      <section id="subscribe" className="py-16 bg-(--green-deep)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionTitle
                tag="Stay Protected"
                title={"Get alerts before\nyou buy or consume"}
                subtitle="Subscribe to receive safety alerts the moment they're published — by email or SMS, in your preferred language."
                light
              />
            </div>
            <div className="bg-white/[0.07] border border-white/10 rounded-2xl p-7">
              <p className="text-[15px] font-semibold text-white mb-5">
                Alert Subscription
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] text-white/50 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full h-11 px-4 bg-white/8 border border-white/15 rounded-xl text-[14px] text-white placeholder:text-white/30 outline-none focus:border-(--green-pale) transition-colors"
                  />
                </div>
                <div className="flex items-center gap-3 text-[13px] text-white/50">
                  <span className="flex-1 h-px bg-white/10" /> or{" "}
                  <span className="flex-1 h-px bg-white/10" />
                </div>
                <div>
                  <label className="block text-[12px] text-white/50 uppercase tracking-wider mb-1.5">
                    WhatsApp / Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    className="w-full h-11 px-4 bg-white/8 border border-white/15 rounded-xl text-[14px] text-white placeholder:text-white/30 outline-none focus:border-(--green-pale) transition-colors"
                  />
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={async () => {
                    const el =
                      document.querySelector<HTMLInputElement>(
                        "input[type=email]",
                      );
                    if (el?.value) {
                      await alertsApi.subscribe({
                        email: el.value,
                        channels: ["email"],
                      });
                      alert("Subscribed!");
                    }
                  }}
                >
                  Subscribe — It&apos;s Free
                </Button>
              </div>
              <p className="text-[11px] text-white/30 text-center mt-4">
                No spam. Unsubscribe any time. Alerts only.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </>
  );
}
