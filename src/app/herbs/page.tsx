"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
// import { SectionTitle } from '@/components/ui/section-title'
import { Button } from "@/components/ui/button";
import { Newsletter } from "@/components/sections/newsletter";
import { Footer } from "@/components/sections/footer";
import {
  Search,
  Shield,
  AlertTriangle,
  XCircle,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useHerbs } from "@/hooks/dashboard-hooks";

type SafetyRating = "SAFE" | "CAUTION" | "DANGER" | "INSUFFICIENT_DATA";
type HerbCategory =
  | "Digestive"
  | "Immune"
  | "Anti-inflammatory"
  | "Antimicrobial"
  | "Cardiovascular"
  | "Metabolic"
  | "Adaptogen"
  | "Topical";

interface Herb {
  id: string;
  slug: string;
  name: string;
  localNames: string[];
  scientificName: string;
  emoji: string;
  category: HerbCategory;
  safetyRating: SafetyRating;
  summary: string;
  keyBenefits: string[];
  warnings: string[];
  interactions: string[];
  reviewedAt: string;
  languages: string[];
}

const HERBS: Herb[] = [
  {
    id: "h1",
    slug: "moringa-oleifera",
    emoji: "🌿",
    name: "Moringa",
    scientificName: "Moringa oleifera",
    localNames: ["Zogale (Hausa)", "Ewe Ile (Yoruba)", "Odudu Oyibo (Igbo)"],
    category: "Immune",
    safetyRating: "CAUTION",
    summary:
      "Nutritionally dense tree leaf widely used in Northern Nigeria for general wellness, anaemia, and malnutrition support. Good evidence for nutritional value; limited evidence for therapeutic claims.",
    keyBenefits: [
      "Rich source of iron, calcium, and vitamins A & C",
      "Supports nutritional status in malnourished patients",
      "Antioxidant activity well-documented",
    ],
    warnings: [
      "May mildly lower blood glucose — caution in diabetics on medication",
      "High Vitamin K content — avoid with warfarin",
      "Root and bark preparations are UNSAFE — only use leaf",
    ],
    interactions: [
      "Warfarin (High Risk)",
      "Metformin (Moderate)",
      "Levothyroxine (Moderate)",
    ],
    reviewedAt: "June 2025",
    languages: ["English", "Hausa", "Igbo", "Pidgin"],
  },
  {
    id: "h2",
    slug: "vernonia-amygdalina",
    emoji: "🍃",
    name: "Bitter Leaf",
    scientificName: "Vernonia amygdalina",
    localNames: ["Ewuro (Yoruba)", "Onugbu (Igbo)", "Shiwaka (Hausa)"],
    category: "Metabolic",
    safetyRating: "CAUTION",
    summary:
      "One of the most widely used medicinal plants in Nigeria, primarily for blood sugar management, malaria, and digestive support. Significant drug interactions with antidiabetics require careful monitoring.",
    keyBenefits: [
      "Clinically studied for hypoglycaemic effects",
      "Traditional use for malaria management with some evidence",
      "Anti-inflammatory and antioxidant properties documented",
    ],
    warnings: [
      "Additive hypoglycaemia risk with metformin and glibenclamide",
      "Avoid in first trimester of pregnancy",
      "High doses may cause nausea and vomiting",
    ],
    interactions: [
      "Metformin (High Risk)",
      "Glibenclamide (High Risk)",
      "Insulin (Moderate)",
      "Antihypertensives (Moderate)",
    ],
    reviewedAt: "June 2025",
    languages: ["English", "Yoruba", "Igbo", "Hausa", "Pidgin"],
  },
  {
    id: "h3",
    slug: "hibiscus-sabdariffa",
    emoji: "🫐",
    name: "Zobo / Hibiscus",
    scientificName: "Hibiscus sabdariffa",
    localNames: [
      "Zobo (Hausa/nationwide)",
      "Isapa (Yoruba)",
      "Oha Bekee (Igbo)",
    ],
    category: "Cardiovascular",
    safetyRating: "CAUTION",
    summary:
      "The calyx of Hibiscus sabdariffa is widely consumed as Zobo drink in Nigeria and increasingly marketed as a supplement for blood pressure management. Good evidence for antihypertensive effects; significant medication interactions.",
    keyBenefits: [
      "Clinically significant reduction in systolic blood pressure",
      "Rich in anthocyanins with antioxidant activity",
      "Evidence for lipid-lowering effects at higher doses",
    ],
    warnings: [
      "May dangerously lower blood pressure when combined with antihypertensives",
      "Avoid in pregnancy — may stimulate uterine contractions",
      "Not suitable for people with low blood pressure",
    ],
    interactions: [
      "Amlodipine (Moderate)",
      "Hydrochlorothiazide (High Risk)",
      "Lisinopril (Moderate)",
      "Chloroquine (reduces absorption)",
    ],
    reviewedAt: "May 2025",
    languages: ["English", "Hausa", "Yoruba"],
  },
  {
    id: "h4",
    slug: "azadirachta-indica",
    emoji: "🌳",
    name: "Neem",
    scientificName: "Azadirachta indica",
    localNames: ["Dogonyaro (Hausa)", "Eedu (Yoruba)", "Ogwu Akom (Igbo)"],
    category: "Antimicrobial",
    safetyRating: "DANGER",
    summary:
      "Neem has a long history of traditional use across Nigeria but carries serious safety risks, particularly in children and pregnant women. Internal use of neem oil is associated with severe toxic reactions and death in children.",
    keyBenefits: [
      "Topical antimicrobial properties well-established",
      "Effective in topical treatment of fungal skin infections",
      "Pesticide and environmental applications are well-studied",
    ],
    warnings: [
      "NEVER give neem oil internally to children — multiple fatalities documented",
      "AVOID in pregnancy — may cause miscarriage",
      "Internal use of leaf extract should be supervised by a health professional",
    ],
    interactions: [
      "Immunosuppressants (may reduce efficacy)",
      "Lithium (increases levels)",
    ],
    reviewedAt: "April 2025",
    languages: ["English", "Hausa", "Yoruba", "Igbo"],
  },
  {
    id: "h5",
    slug: "ocimum-gratissimum",
    emoji: "🌱",
    name: "African Basil (Scent Leaf)",
    scientificName: "Ocimum gratissimum",
    localNames: ["Efirin (Yoruba)", "Nchuanwu (Igbo)", "Daidoya (Hausa)"],
    category: "Antimicrobial",
    safetyRating: "SAFE",
    summary:
      "Scent Leaf (Efirin) is one of Nigeria's most widely used culinary and medicinal herbs. When used in culinary quantities, it is generally safe. Concentrated extracts require caution.",
    keyBenefits: [
      "Strong antimicrobial activity against common pathogens",
      "Traditional use for malaria, diarrhoea, and fever with supporting evidence",
      "Anti-inflammatory effects documented in vitro",
    ],
    warnings: [
      "High-dose concentrated extracts may lower blood sugar",
      "May have mild uterine-stimulating effects at very high doses",
    ],
    interactions: ["Anticoagulants (mild, low risk at culinary doses)"],
    reviewedAt: "March 2025",
    languages: ["English", "Yoruba", "Igbo", "Pidgin"],
  },
  {
    id: "h6",
    slug: "vitellaria-paradoxa",
    emoji: "🧴",
    name: "Shea Butter",
    scientificName: "Vitellaria paradoxa",
    localNames: ["Ori (Yoruba)", "Okwuma (Igbo)", "Kadanya (Hausa)"],
    category: "Topical",
    safetyRating: "SAFE",
    summary:
      "Raw unrefined Shea butter from the Vitellaria paradoxa tree is one of Nigeria's most valuable natural skincare ingredients. When pure and unrefined, it has an excellent safety profile for topical use.",
    keyBenefits: [
      "Excellent emollient with high fatty acid content",
      "Anti-inflammatory triterpenes support wound healing",
      "UV filtering properties offer mild sun protection",
    ],
    warnings: [
      "Nut allergy sufferers should patch-test first",
      "Adulterated commercial products may contain harmful additives — buy from verified sources",
    ],
    interactions: [
      "No clinically significant drug interactions at topical doses",
    ],
    reviewedAt: "February 2025",
    languages: ["English", "Yoruba", "Hausa"],
  },
  {
    id: "h7",
    slug: "zingiber-officinale",
    emoji: "🫚",
    name: "Ginger",
    scientificName: "Zingiber officinale",
    localNames: ["Jinja (Hausa)", "Atale (Yoruba)", "Ji Ose (Igbo)"],
    category: "Digestive",
    safetyRating: "CAUTION",
    summary:
      "Ginger is widely used across Nigeria as a culinary spice and medicinal herb for nausea, digestion, and pain. Generally safe at culinary doses, but concentrated supplements carry anticoagulant risks.",
    keyBenefits: [
      "Strong evidence for reducing nausea and vomiting, including chemotherapy-induced",
      "Anti-inflammatory effects comparable to ibuprofen at high doses",
      "Traditional use for colds, flu, and respiratory conditions well-supported",
    ],
    warnings: [
      "May enhance anticoagulant effects of warfarin and aspirin",
      "High doses may cause heartburn and gastric irritation",
      "Avoid concentrated supplements in first trimester of pregnancy",
    ],
    interactions: [
      "Warfarin (Moderate)",
      "Aspirin / NSAIDs (Moderate)",
      "Antidiabetics (Low risk)",
    ],
    reviewedAt: "January 2025",
    languages: ["English", "Hausa", "Yoruba", "Igbo", "Pidgin"],
  },
  {
    id: "h8",
    slug: "aloe-vera",
    emoji: "🪴",
    name: "Aloe Vera",
    scientificName: "Aloe barbadensis miller",
    localNames: ["Eti Erin (Yoruba)", "Ahun (Igbo)"],
    category: "Topical",
    safetyRating: "CAUTION",
    summary:
      "Aloe vera gel has a strong safety record for topical use in wound healing and skin conditions. However, aloe latex (the yellow sap) is a potent laxative with serious safety concerns for internal use.",
    keyBenefits: [
      "Excellent evidence for wound healing and burn management (topical gel)",
      "Mild evidence for blood glucose reduction with the inner leaf gel",
      "Anti-inflammatory effects well-documented for topical application",
    ],
    warnings: [
      "Aloe latex is a STRONG laxative — avoid internal use, especially in children and pregnant women",
      "Prolonged internal use of aloe latex may cause electrolyte imbalances",
      "Avoid topical use on deep wounds",
    ],
    interactions: [
      "Digoxin (aloe latex increases toxicity risk)",
      "Antidiabetics (may have additive effect)",
      "Diuretics (aloe latex + diuretics increases hypokalaemia risk)",
    ],
    reviewedAt: "January 2025",
    languages: ["English", "Yoruba", "Pidgin"],
  },
];

const safetyConfig: Record<
  SafetyRating,
  {
    badge: string;
    border: string;
    bg: string;
    icon: React.ReactNode;
    label: string;
    dot: string;
  }
> = {
  SAFE: {
    badge: "bg-green-100 text-green-700 border-green-200",
    border: "border-green-200",
    bg: "bg-green-50",
    icon: <Shield size={13} />,
    label: "Generally Safe",
    dot: "bg-green-500",
  },
  CAUTION: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    border: "border-amber-200",
    bg: "bg-amber-50",
    icon: <AlertTriangle size={13} />,
    label: "Use with Caution",
    dot: "bg-amber-500",
  },
  DANGER: {
    badge: "bg-red-100 text-red-700 border-red-200",
    border: "border-red-200",
    bg: "bg-red-50",
    icon: <XCircle size={13} />,
    label: "High Risk",
    dot: "bg-red-500",
  },
  INSUFFICIENT_DATA: {
    badge: "bg-gray-100 text-gray-600 border-gray-200",
    border: "border-gray-200",
    bg: "bg-gray-50",
    icon: <BookOpen size={13} />,
    label: "Data Pending",
    dot: "bg-gray-400",
  },
};

const CATEGORIES: HerbCategory[] = [
  "Digestive",
  "Immune",
  "Anti-inflammatory",
  "Antimicrobial",
  "Cardiovascular",
  "Metabolic",
  "Adaptogen",
  "Topical",
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

export default function HerbsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<HerbCategory | "ALL">("ALL");
  const [rating, setRating] = useState<SafetyRating | "ALL">("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data } = useHerbs();
  const HERBS_DATA = (data?.herbs ?? HERBS) as Herb[];

  const filtered = HERBS_DATA.filter((h) => {
    const matchSearch =
      !search ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.scientificName.toLowerCase().includes(search.toLowerCase()) ||
      h.localNames.some((n) => n.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = category === "ALL" || h.category === category;
    const matchRating = rating === "ALL" || h.safetyRating === rating;
    return matchSearch && matchCategory && matchRating;
  });

  return (
    <>
      {/* Hero */}
      <section className="relative bg-(--green-deep) overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border-70 border-white/4 pointer-events-none" />
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 relative z-10 text-center">
          <motion.span
            {...fadeUp(0)}
            className="inline-block text-[11px] font-medium tracking-[0.15em] uppercase rounded-full px-3.5 py-1 mb-4 bg-white/10 text-(--gold-light)"
          >
            Herb Directory
          </motion.span>
          <motion.h1
            {...fadeUp(0.08)}
            className="font-serif font-medium text-white text-[clamp(34px,5vw,58px)] leading-[1.1] mb-5 max-w-3xl mx-auto"
          >
            The HerbRx{" "}
            <em className="not-italic text-(--gold-light)">Herb Directory</em>
          </motion.h1>
          <motion.p
            {...fadeUp(0.15)}
            className="text-white/60 text-[17px] font-light max-w-xl mx-auto mb-6"
          >
            Science-backed safety profiles for Nigerian medicinal plants —
            covering benefits, risks, drug interactions, and local names in your
            language.
          </motion.p>
          <motion.div
            {...fadeUp(0.2)}
            className="flex flex-wrap gap-3 justify-center"
          >
            {[
              {
                icon: <Shield size={14} />,
                label: `${HERBS.filter((h) => h.safetyRating === "SAFE").length} Generally Safe`,
                cls: "bg-green-500/15 text-green-300",
              },
              {
                icon: <AlertTriangle size={14} />,
                label: `${HERBS.filter((h) => h.safetyRating === "CAUTION").length} Use with Caution`,
                cls: "bg-amber-500/15 text-amber-300",
              },
              {
                icon: <XCircle size={14} />,
                label: `${HERBS.filter((h) => h.safetyRating === "DANGER").length} High Risk`,
                cls: "bg-red-500/15 text-red-300",
              },
            ].map((s) => (
              <span
                key={s.label}
                className={`inline-flex items-center gap-1.5 text-[13px] px-3.5 py-1.5 rounded-full ${s.cls}`}
              >
                {s.icon} {s.label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Safety legend */}
      <div className="bg-(--cream-dark) border-b border-(--cream-dark)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 py-4 flex flex-wrap gap-4 items-center">
          <span className="text-[12px] font-semibold text-(--text-muted) uppercase tracking-wider">
            Safety Ratings:
          </span>
          {Object.entries(safetyConfig).map(([key, cfg]) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full border ${cfg.badge}`}
            >
              {cfg.icon} {cfg.label}
            </span>
          ))}
        </div>
      </div>

      {/* Directory */}
      <section className="py-16 lg:py-20 bg-[(--cream)]">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          {/* Filters */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="relative max-w-md">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search herbs by name, local name, or scientific name…"
                className="w-full h-11 pl-10 pr-4 bg-white border border-(--cream-dark) rounded-xl text-[14px] text-(--text-dark) placeholder:text-(--text-muted) outline-none focus:border-(--green-mid) focus:ring-2 focus:ring-(--green-pale) transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["ALL", "SAFE", "CAUTION", "DANGER"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRating(r)}
                  className={`text-[12px] font-medium px-3.5 py-2 rounded-lg border transition-all ${rating === r ? "bg-(--green-deep) text-white border-(--green-deep)" : "bg-white text-(--text-muted) border-(--cream-dark) hover:border-(--green-mid)"}`}
                >
                  {r === "ALL" ? "All Ratings" : (safetyConfig[r]?.label ?? r)}
                </button>
              ))}
              <div className="w-px bg-(--cream-dark)" />
              <button
                onClick={() => setCategory("ALL")}
                className={`text-[12px] font-medium px-3.5 py-2 rounded-lg border transition-all ${category === "ALL" ? "bg-(--green-deep) text-white border-(--green-deep)" : "bg-white text-(--text-muted) border-(--cream-dark) hover:border-(--green-mid)"}`}
              >
                All Categories
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-[12px] font-medium px-3.5 py-2 rounded-lg border transition-all ${category === c ? "bg-(--green-deep) text-white border-(--green-deep)" : "bg-white text-(--text-muted) border-(--cream-dark) hover:border-(--green-mid)"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[13px] text-(--text-muted) mb-6">
            {filtered.length} herb{filtered.length !== 1 ? "s" : ""} found
          </p>

          {/* Herb cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.length === 0 && (
              <div className="col-span-2 text-center py-16 text-(--text-muted)">
                No herbs match your filter.
              </div>
            )}
            {filtered.map((herb, i) => {
              const cfg = safetyConfig[herb.safetyRating];
              const isOpen = expanded === herb.id;

              return (
                <motion.div
                  key={herb.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-(--cream-dark) rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card header */}
                  <button
                    className="w-full text-left p-6"
                    onClick={() => setExpanded(isOpen ? null : herb.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-[36px] shrink-0">{herb.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-serif text-[19px] font-semibold text-(--green-deep)">
                            {herb.name}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}
                          >
                            {cfg.icon} {cfg.label}
                          </span>
                        </div>
                        <p className="text-[12px] text-(--text-muted) italic mb-1">
                          {herb.scientificName}
                        </p>
                        <p className="text-[12px] text-(--text-muted)">
                          {herb.localNames.join(" · ")}
                        </p>
                      </div>
                      <span className="text-(--text-muted) text-[20px] shrink-0">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>
                    <p className="text-[13px] text-(--text-body) leading-relaxed mt-3 font-light">
                      {herb.summary}
                    </p>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="border-t border-(--cream-dark) px-6 pb-6 pt-5">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-[11px] text-(--text-muted) uppercase tracking-wider font-semibold mb-2">
                            Key Benefits
                          </p>
                          <ul className="space-y-1.5">
                            {herb.keyBenefits.map((b) => (
                              <li
                                key={b}
                                className="flex items-start gap-2 text-[13px] text-(--text-body)"
                              >
                                <span className="text-(--green-mid) mt-0.5 shrink-0">
                                  ✓
                                </span>{" "}
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[11px] text-(--text-muted) uppercase tracking-wider font-semibold mb-2">
                            Safety Warnings
                          </p>
                          <ul className="space-y-1.5">
                            {herb.warnings.map((w) => (
                              <li
                                key={w}
                                className="flex items-start gap-2 text-[13px] text-(--text-body)"
                              >
                                <AlertTriangle
                                  size={12}
                                  className="text-amber-500 mt-0.5 shrink-0"
                                />{" "}
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {herb.interactions.length > 0 && (
                        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100">
                          <p className="text-[11px] text-red-700 uppercase tracking-wider font-semibold mb-2">
                            Drug Interactions
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {herb.interactions.map((int) => {
                              const isHigh = int.includes("High Risk");
                              return (
                                <span
                                  key={int}
                                  className={`text-[12px] font-medium px-2.5 py-1 rounded-lg border ${isHigh ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                                >
                                  {int}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-5">
                        <p className="text-[11px] text-(--text-muted)">
                          Reviewed {herb.reviewedAt} · Available in{" "}
                          {herb.languages.join(", ")}
                        </p>
                        <div className="flex gap-2">
                          <Link
                            href={`/herbs/${herb.slug}`}
                            className="text-[12px] font-semibold text-(--green-mid) hover:text-(--green-deep) transition-colors flex items-center gap-1"
                          >
                            Full Profile <ChevronRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Submit a herb */}
      <section className="py-16 bg-(--green-deep)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 text-center">
          <motion.div {...fadeUp(0)}>
            <div className="text-[40px] mb-4">🌱</div>
            <h2 className="font-serif text-[clamp(22px,3vw,34px)] font-medium text-white mb-4">
              Know a herb we haven&apos;t covered?
            </h2>
            <p className="text-white/55 font-light text-[15px] mb-7 max-w-md mx-auto">
              Our pharmacists review suggestions from the community. Submit a
              herb for evaluation and we&apos;ll publish a safety profile within
              30 days.
            </p>
            <Button
              variant="secondary"
              size="lg"
              href="/contact?topic=Herb+Submission"
            >
              Suggest a Herb
            </Button>
          </motion.div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </>
  );
}
