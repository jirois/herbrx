"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { Newsletter } from "@/components/sections/newsletter";
import { Footer } from "@/components/sections/footer";
import { useSafetyReviews } from "@/hooks/dashboard-hooks";
import { ProductImage } from "@/components/ui/product-image";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  FlaskConical,
  Package,
  Clock,
  FileText,
  Download,
} from "lucide-react";

type ReviewVerdict = "APPROVED" | "REJECTED" | "CAUTION" | "PENDING";

interface ProductReview {
  id: string;
  productName: string;
  producer: string;
  category: string;
  emoji: string;
  imageUrl?: string | null;
  verdict: ReviewVerdict;
  overallScore: number; // out of 10
  reviewDate: string;
  batchNo: string;
  labName: string;
  parameters: {
    name: string;
    result: string;
    limit: string;
    pass: boolean;
  }[];
  summary: string;
  recommendation: string;
  nafdacNo?: string;
  verifiedBadge: boolean;
}

const REVIEWS: ProductReview[] = [
  {
    id: "r1",
    emoji: "🌿",
    productName: "Moringa Gold Capsules 500mg",
    producer: "GreenHealth Nigeria",
    category: "Capsules",
    verdict: "APPROVED",
    overallScore: 9.1,
    reviewDate: "June 2025",
    batchNo: "B2024-07",
    labName: "Spectralab NG (NAFDAC Accredited)",
    nafdacNo: "A7-1234",
    verifiedBadge: true,
    parameters: [
      {
        name: "Lead (Pb)",
        result: "0.8 mg/kg",
        limit: "< 2 mg/kg",
        pass: true,
      },
      {
        name: "Mercury (Hg)",
        result: "0.02 mg/kg",
        limit: "< 0.1 mg/kg",
        pass: true,
      },
      {
        name: "Arsenic (As)",
        result: "0.15 mg/kg",
        limit: "< 1 mg/kg",
        pass: true,
      },
      {
        name: "Total Plate Count",
        result: "2.1×10² CFU/g",
        limit: "< 1×10⁴",
        pass: true,
      },
      { name: "E. coli", result: "Not detected", limit: "Absent", pass: true },
      {
        name: "Salmonella",
        result: "Not detected",
        limit: "Absent",
        pass: true,
      },
      { name: "Moisture Content", result: "4.2%", limit: "< 8%", pass: true },
      {
        name: "Active Marker ID",
        result: "Confirmed: Glucosinolates",
        limit: "Present",
        pass: true,
      },
    ],
    summary:
      "Moringa Gold Capsules from GreenHealth Nigeria achieved the highest safety rating in this category. All heavy metals, microbial, and active compound parameters passed with significant margin. Label claims are consistent with COA findings.",
    recommendation:
      "Safe to use as directed on label. Standard drug interaction caveats apply — see Moringa profile in Herb Directory for details.",
  },
  {
    id: "r2",
    emoji: "🫐",
    productName: "Zobo Immune Blend Powder",
    producer: "ZoboFresh Ltd",
    category: "Powder",
    verdict: "REJECTED",
    overallScore: 3.4,
    reviewDate: "May 2025",
    batchNo: "B2024-11",
    labName: "NaijaLab",
    verifiedBadge: false,
    parameters: [
      {
        name: "Lead (Pb)",
        result: "0.5 mg/kg",
        limit: "< 2 mg/kg",
        pass: true,
      },
      {
        name: "Mercury (Hg)",
        result: "0.03 mg/kg",
        limit: "< 0.1 mg/kg",
        pass: true,
      },
      {
        name: "Total Plate Count",
        result: "8.2×10⁴ CFU/g",
        limit: "< 1×10⁴",
        pass: false,
      },
      {
        name: "Yeast & Mould",
        result: "6.8×10³ CFU/g",
        limit: "< 1×10²",
        pass: false,
      },
      { name: "E. coli", result: "Not detected", limit: "Absent", pass: true },
      { name: "Moisture Content", result: "9.4%", limit: "< 8%", pass: false },
      {
        name: "Active Marker ID",
        result: "Confirmed: Anthocyanins",
        limit: "Present",
        pass: true,
      },
    ],
    summary:
      "Batch B2024-11 failed on microbial count and moisture content. Total plate count was 8× over the acceptable limit, and moisture content indicates inadequate drying — likely contributing to the elevated microbial load. The product poses a real infection risk to immunocompromised consumers.",
    recommendation:
      "Do not purchase or consume Batch B2024-11. The producer has been notified and must resubmit with a clean COA after remediation. Earlier batches are not covered by this review.",
  },
  {
    id: "r3",
    emoji: "🍃",
    productName: "Bitter Leaf Tonic 250ml",
    producer: "HerbalNaija",
    category: "Tonic",
    verdict: "CAUTION",
    overallScore: 6.8,
    reviewDate: "April 2025",
    batchNo: "B2024-10",
    labName: "PharmAnalytics Ltd",
    verifiedBadge: false,
    parameters: [
      {
        name: "Lead (Pb)",
        result: "1.4 mg/kg",
        limit: "< 2 mg/kg",
        pass: true,
      },
      {
        name: "Mercury (Hg)",
        result: "0.05 mg/kg",
        limit: "< 0.1 mg/kg",
        pass: true,
      },
      {
        name: "Total Plate Count",
        result: "4.8×10³ CFU/g",
        limit: "< 1×10⁴",
        pass: true,
      },
      {
        name: "Yeast & Mould",
        result: "1.2×10² CFU/g",
        limit: "< 1×10²",
        pass: false,
      },
      {
        name: "Active Marker ID",
        result: "Confirmed: Sesquiterpene lactones",
        limit: "Present",
        pass: true,
      },
      {
        name: "Label Accuracy",
        result: "Dose claim unsubstantiated",
        limit: "Accurate",
        pass: false,
      },
    ],
    summary:
      'The product passed most safety parameters with good margins. However, yeast and mould count marginally exceeds acceptable limits, and the label\'s therapeutic dose claim of "500mg active extract per 5ml" could not be confirmed by independent testing. The actual measured concentration was lower.',
    recommendation:
      "Use with caution. The product is unlikely to cause direct harm at normal use, but the label dose inaccuracy means clinical outcomes may differ from expectations. Diabetic patients in particular should be aware that the actual effect may be weaker than advertised.",
  },
  {
    id: "r4",
    emoji: "🧴",
    productName: "PureShea Unrefined Body Butter 200g",
    producer: "NaturaBlend Ltd",
    category: "Topical",
    verdict: "APPROVED",
    overallScore: 8.7,
    reviewDate: "March 2025",
    batchNo: "B2024-06",
    labName: "Spectralab NG",
    verifiedBadge: true,
    nafdacNo: "A9-5678",
    parameters: [
      {
        name: "Lead (Pb)",
        result: "0.1 mg/kg",
        limit: "< 5 mg/kg",
        pass: true,
      },
      {
        name: "Mercury (Hg)",
        result: "Not detected",
        limit: "< 0.1 mg/kg",
        pass: true,
      },
      {
        name: "Microbial Count",
        result: "< 1×10¹ CFU/g",
        limit: "< 1×10²",
        pass: true,
      },
      {
        name: "Additive Screening",
        result: "None detected",
        limit: "No adulterants",
        pass: true,
      },
      {
        name: "Fatty Acid Profile",
        result: "Confirmed: Stearic, Oleic acids",
        limit: "Present",
        pass: true,
      },
      {
        name: "Label Accuracy",
        result: "Accurate",
        limit: "Accurate",
        pass: true,
      },
    ],
    summary:
      "PureShea Unrefined Body Butter is a genuinely high-quality product. Heavy metals were negligible, no adulterants or additives were detected, and fatty acid profiling confirmed the product is authentic unrefined Shea butter. The label is accurate.",
    recommendation:
      "Safe for topical use as directed. Persons with nut allergies should perform a patch test before full use.",
  },
];

const verdictConfig: Record<
  ReviewVerdict,
  {
    badge: string;
    border: string;
    bg: string;
    icon: React.ReactNode;
    label: string;
    dot: string;
  }
> = {
  APPROVED: {
    badge: "bg-green-100 text-green-700 border-green-200",
    border: "border-green-200",
    bg: "bg-green-50",
    icon: <CheckCircle size={14} />,
    label: "Approved",
    dot: "bg-green-500",
  },
  REJECTED: {
    badge: "bg-red-100 text-red-700 border-red-200",
    border: "border-red-200",
    bg: "bg-red-50",
    icon: <XCircle size={14} />,
    label: "Rejected",
    dot: "bg-red-500",
  },
  CAUTION: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    border: "border-amber-200",
    bg: "bg-amber-50",
    icon: <AlertTriangle size={14} />,
    label: "Caution",
    dot: "bg-amber-500",
  },
  PENDING: {
    badge: "bg-gray-100 text-gray-600 border-gray-200",
    border: "border-gray-200",
    bg: "bg-gray-50",
    icon: <Clock size={14} />,
    label: "Pending",
    dot: "bg-gray-400",
  },
};

const scoreColor = (s: number) =>
  s >= 8 ? "text-green-600" : s >= 6 ? "text-amber-600" : "text-red-600";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

export default function SafetyReviewsPage() {
  const { data } = useSafetyReviews();
  const [search, setSearch] = useState("");
  const [verdict, setVerdict] = useState<ReviewVerdict | "ALL">("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const REVIEWS_DATA = (data?.reviews ?? REVIEWS) as ProductReview[];

  const filtered = REVIEWS_DATA.filter((r) => {
    const matchSearch =
      !search ||
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.producer.toLowerCase().includes(search.toLowerCase());
    const matchVerdict = verdict === "ALL" || r.verdict === verdict;
    return matchSearch && matchVerdict;
  });

  return (
    <>
      {/* Hero */}
      <section className="relative bg-(--green-deep) overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border-70 border-white/4 pointer-events-none" />
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-12">
            <div className="flex-1">
              <motion.span
                {...fadeUp(0)}
                className="inline-block text-[11px] font-medium tracking-[0.15em] uppercase rounded-full px-3.5 py-1 mb-4 bg-white/10 text-(--gold-light)"
              >
                Safety Reviews
              </motion.span>
              <motion.h1
                {...fadeUp(0.08)}
                className="font-serif font-medium text-white text-[clamp(34px,5vw,58px)] leading-[1.1] mb-5 max-w-2xl"
              >
                Independent Product{" "}
                <em className="not-italic text-(--gold-light)">
                  Safety Reviews
                </em>
              </motion.h1>
              <motion.p
                {...fadeUp(0.15)}
                className="text-white/60 text-[17px] font-light max-w-xl mb-8"
              >
                We independently test and review Nigerian herbal products so you
                can trust what you&apos;re buying. No sponsorships. No conflicts
                of interest. Just the science.
              </motion.p>
              <motion.div {...fadeUp(0.2)} className="flex flex-wrap gap-3">
                <Button variant="secondary" size="md" href="#reviews">
                  Browse Reviews
                </Button>
                <Button
                  variant="outline-light"
                  size="md"
                  href="/register?role=producer&reason=submit-product"
                >
                  Submit a Product
                </Button>
              </motion.div>
            </div>
            {/* Stats */}
            <motion.div
              {...fadeUp(0.25)}
              className="grid grid-cols-2 gap-3 lg:w-72"
            >
              {[
                {
                  value: `${REVIEWS.filter((r) => r.verdict === "APPROVED").length}`,
                  label: "Products Approved",
                  color: "text-green-300",
                },
                {
                  value: `${REVIEWS.filter((r) => r.verdict === "REJECTED").length}`,
                  label: "Products Rejected",
                  color: "text-red-300",
                },
                {
                  value: `${REVIEWS.filter((r) => r.verdict === "CAUTION").length}`,
                  label: "Caution Issued",
                  color: "text-amber-300",
                },
                {
                  value: "100%",
                  label: "Sponsor-Free",
                  color: "text-[var(--gold-light)]",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/6 border border-white/10 rounded-2xl p-5 text-center"
                >
                  <div
                    className={`font-serif text-[28px] font-semibold ${s.color}`}
                  >
                    {s.value}
                  </div>
                  <div className="text-[12px] text-white/45 mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-(--cream-dark)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <SectionTitle
            tag="Our Process"
            title="How We Review Products"
            subtitle="Every HerbRx safety review follows the same four-stage process."
            align="center"
            className="max-w-lg mx-auto"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: "01",
                icon: FileText,
                title: "Document Review",
                desc: "We verify the Certificate of Analysis from an accredited laboratory and check producer registration documents.",
              },
              {
                step: "02",
                icon: FlaskConical,
                title: "Lab Parameter Check",
                desc: "We audit each COA parameter: heavy metals, microbial counts, active compounds, moisture content, and pH.",
              },
              {
                step: "03",
                icon: Package,
                title: "Label Accuracy Check",
                desc: "We compare the product label's ingredients, dosage claims, and warnings against the actual COA findings.",
              },
              {
                step: "04",
                icon: Shield,
                title: "Safety Rating Issued",
                desc: "Based on findings, we issue Approved, Caution, or Rejected. Results are published openly — we never suppress negatives.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                {...fadeUp(i * 0.08)}
                className="bg-white border border-(--cream-dark) rounded-2xl p-7"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-(--green-pale)/40 flex items-center justify-center">
                    <s.icon size={18} className="text-(--green-mid)" />
                  </div>
                  <span className="font-mono text-[13px] text-(--text-muted)">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-serif text-[17px] font-semibold text-(--green-deep) mb-2">
                  {s.title}
                </h3>
                <p className="text-[13px] text-(--text-muted) leading-relaxed font-light">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-16 lg:py-20 bg-(--cream)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <SectionTitle
            tag="Published Reviews"
            title="Product Safety Reviews"
          />

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products or producers…"
                className="w-full h-11 pl-10 pr-4 bg-white border border-(--cream-dark) rounded-xl text-[14px] text-(--text-dark) placeholder:text-(--text-muted) outline-none focus:border-(--green-mid) focus:ring-2 focus:ring-(--green-pale) transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["ALL", "APPROVED", "CAUTION", "REJECTED"] as const).map(
                (v) => (
                  <button
                    key={v}
                    onClick={() => setVerdict(v)}
                    className={`text-[12px] font-medium px-4 py-2 rounded-lg border transition-all ${verdict === v ? "bg-(--green-deep) text-white border-(--green-deep)" : "bg-white text-(--text-muted) border-(--cream-dark) hover:border-(--green-mid)"}`}
                  >
                    {v === "ALL"
                      ? "All Verdicts"
                      : v.charAt(0) + v.slice(1).toLowerCase()}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Review cards */}
          <div className="space-y-5">
            {filtered.length === 0 && (
              <div className="text-center py-16 text-(--text-muted)">
                No reviews match your filter.
              </div>
            )}
            {filtered.map((review, i) => {
              const cfg = verdictConfig[review.verdict];
              const isOpen = expanded === review.id;
              const failCount = review.parameters.filter((p) => !p.pass).length;

              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-md ${isOpen ? cfg.border : "border-(--cream-dark)"}`}
                >
                  {/* Header */}
                  <button
                    className="w-full text-left p-6"
                    onClick={() => setExpanded(isOpen ? null : review.id)}
                  >
                    <div className="flex items-start gap-4">
                      <ProductImage
                        src={review.imageUrl ?? null}
                        emoji={review.emoji}
                        size="w-14 h-14"
                        theme="light"
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}
                          >
                            {cfg.icon} {cfg.label}
                          </span>
                          {review.verifiedBadge && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                              ✓ HerbRx Verified
                            </span>
                          )}
                          {review.nafdacNo && (
                            <span className="text-[11px] text-(--text-muted) bg-(--cream-dark) px-2.5 py-0.5 rounded-full border border-(--cream-dark)">
                              NAFDAC: {review.nafdacNo}
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-[20px] font-semibold text-(--green-deep)">
                          {review.productName}
                        </h3>
                        <div className="flex items-center gap-3 text-[13px] text-(--text-muted) mt-1 flex-wrap">
                          <span>{review.producer}</span>
                          <span>·</span>
                          <span>{review.category}</span>
                          <span>·</span>
                          <span>Batch {review.batchNo}</span>
                          <span>·</span>
                          <span>Reviewed {review.reviewDate}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className={`font-serif text-[28px] font-semibold ${scoreColor(review.overallScore)}`}
                        >
                          {review.overallScore}
                          <span className="text-[14px] text-(--text-muted) font-normal">
                            /10
                          </span>
                        </div>
                        <div className="text-[11px] text-(--text-muted) mt-0.5">
                          {failCount > 0
                            ? `${failCount} param${failCount > 1 ? "s" : ""} failed`
                            : "All params passed"}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded */}
                  {isOpen && (
                    <div className="border-t border-(--cream-dark) px-6 pb-6 pt-5">
                      {/* Summary */}
                      <div
                        className={`p-4 rounded-xl ${cfg.bg} border ${cfg.border} mb-5`}
                      >
                        <p className="text-[13px] font-semibold text-(--green-deep) mb-1">
                          Review Summary
                        </p>
                        <p className="text-[14px] text-(--text-body) leading-relaxed">
                          {review.summary}
                        </p>
                      </div>

                      {/* Parameters table */}
                      <p className="text-[11px] text-(--text-muted) uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                        <FlaskConical size={13} /> COA Parameters —{" "}
                        {review.labName}
                      </p>
                      <div className="rounded-xl border border-(--cream-dark) overflow-hidden mb-5">
                        <div className="grid grid-cols-[1fr_auto_auto_auto] text-[10px] text-(--text-muted) uppercase tracking-wider px-4 py-2.5 bg-(--cream-dark) gap-4">
                          <span>Parameter</span>
                          <span>Result</span>
                          <span>Limit</span>
                          <span>Pass</span>
                        </div>
                        {review.parameters.map((p) => (
                          <div
                            key={p.name}
                            className={`grid grid-cols-[1fr_auto_auto_auto] px-4 py-3 text-[13px] border-t border(--cream-dark) gap-4 ${!p.pass ? "bg-red-50" : ""}`}
                          >
                            <span className="text-(--text-body) font-medium">
                              {p.name}
                            </span>
                            <span
                              className={
                                p.pass
                                  ? "text-(--text-body)"
                                  : "text-red-600 font-semibold"
                              }
                            >
                              {p.result}
                            </span>
                            <span className="text-(--text-muted)">
                              {p.limit}
                            </span>
                            <span>
                              {p.pass ? (
                                <CheckCircle
                                  size={14}
                                  className="text-green-500"
                                />
                              ) : (
                                <XCircle size={14} className="text-red-500" />
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Recommendation */}
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-(--cream-dark) mb-5">
                        <Shield
                          size={15}
                          className="text-(--green-mid) shrink-0 mt-0.5"
                        />
                        <div>
                          <p className="text-[12px] font-semibold text-(--green-deep) uppercase tracking-wider mb-1">
                            Our Recommendation
                          </p>
                          <p className="text-[14px] text-(--text-body) leading-relaxed">
                            {review.recommendation}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          href="#"
                          className="flex items-center gap-1.5"
                        >
                          <Download size={12} /> Download Full Report (PDF)
                        </Button>
                        <Button variant="ghost" size="sm" href="/booking">
                          Speak to a Pharmacist →
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Submit CTA */}
      <section className="py-16 bg-(--green-deep)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp(0)}>
              <SectionTitle
                tag="Get Reviewed"
                title={"Have a product you want\nindependently reviewed?"}
                subtitle="Submit your herbal product for a full safety and efficacy report. Used for consumer assurance, NAFDAC applications, or internal quality control."
                light
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  href="/register?role=producer&reason=submit-product"
                >
                  Submit a Product
                </Button>
                <Button
                  variant="outline-light"
                  size="lg"
                  href="/dashboard/producer/batches"
                >
                  Producer Portal →
                </Button>
              </div>
            </motion.div>
            <motion.div {...fadeUp(0.1)} className="space-y-4">
              {[
                { label: "Report turnaround", value: "10 business days" },
                {
                  label: "Parameters covered",
                  value: "Heavy metals, microbials, actives, label",
                },
                {
                  label: "Lab accreditation",
                  value: "NAFDAC-recognised labs only",
                },
                {
                  label: "Confidentiality",
                  value: "Guaranteed — results published only with consent",
                },
                { label: "Cost", value: "Contact us for current pricing" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between px-5 py-4 bg-white/6 border border-white/10 rounded-xl"
                >
                  <span className="text-[13px] text-white/50">{f.label}</span>
                  <span className="text-[13px] font-medium text-white text-right max-w-[60%]">
                    {f.value}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </>
  );
}
