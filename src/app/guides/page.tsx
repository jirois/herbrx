"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { Newsletter } from "@/components/sections/newsletter";
import { Footer } from "@/components/sections/footer";
import { Search, Download, Globe, Clock, ChevronRight } from "lucide-react";
import { useGuides } from "@/hooks/dashboard-hooks";

type Language = "English" | "Igbo" | "Yoruba" | "Hausa" | "Pidgin";
type Category =
  | "Drug Interactions"
  | "Herb Profiles"
  | "Safe Use"
  | "For Producers"
  | "Condition-Specific";

interface Guide {
  id: string;
  title: string;
  description: string;
  category: Category;
  languages: Language[];
  readTime: string;
  downloadable: boolean;
  featured?: boolean;
  emoji: string;
  slug: string;
}

const GUIDES: Guide[] = [
  {
    id: "g1",
    slug: "herb-drug-interactions-nigeria",
    emoji: "💊",
    title: "The Complete Guide to Herb-Drug Interactions in Nigeria",
    description:
      "A comprehensive reference covering the most common drug-herb interactions encountered in Nigerian clinical practice, including warfarin, metformin, SSRIs, and antihypertensives.",
    category: "Drug Interactions",
    languages: ["English", "Igbo", "Yoruba"],
    readTime: "18 min",
    downloadable: true,
    featured: true,
  },
  {
    id: "g2",
    slug: "moringa-safety-guide",
    emoji: "🌿",
    title: "Moringa (Moringa oleifera) — Safe Use Guide",
    description:
      "Everything you need to know about using Moringa safely: proven benefits, contraindications, drug interactions, safe dosage ranges, and how to spot adulterated products.",
    category: "Herb Profiles",
    languages: ["English", "Hausa", "Pidgin"],
    readTime: "12 min",
    downloadable: true,
    featured: true,
  },
  {
    id: "g3",
    slug: "bitter-leaf-guide",
    emoji: "🍃",
    title: "Bitter Leaf (Vernonia amygdalina) — Safety & Interactions",
    description:
      "Critical safety information for diabetic patients and anyone taking blood pressure medication. Includes updated dosage guidance from the 2025 Pharmacognosy Review.",
    category: "Drug Interactions",
    languages: ["English", "Igbo", "Yoruba", "Hausa", "Pidgin"],
    readTime: "10 min",
    downloadable: true,
    featured: true,
  },
  {
    id: "g4",
    slug: "self-medication-safety",
    emoji: "🛡️",
    title: "Safe Herbal Self-Medication — A Guide for Everyday Nigerians",
    description:
      "Practical guidance on how to evaluate herbal products before buying, what questions to ask sellers, how to read labels, and when to see a professional.",
    category: "Safe Use",
    languages: ["English", "Pidgin"],
    readTime: "8 min",
    downloadable: true,
  },
  {
    id: "g5",
    slug: "pregnancy-herbs-nigeria",
    emoji: "🤰",
    title: "Herbs to Avoid During Pregnancy — Nigerian Edition",
    description:
      "A clear reference for expectant mothers on which traditional Nigerian herbs carry documented pregnancy risks, including emmenagogues, uterine stimulants, and hepatotoxic species.",
    category: "Condition-Specific",
    languages: ["English", "Igbo", "Yoruba", "Hausa"],
    readTime: "14 min",
    downloadable: true,
  },
  {
    id: "g6",
    slug: "coa-guide-producers",
    emoji: "🏭",
    title: "Understanding Certificates of Analysis (COA) — Producer Guide",
    description:
      "A step-by-step guide for Nigerian herbal producers on what a valid COA must include, which parameters are tested, how to choose accredited labs, and how HerbRx reviews submissions.",
    category: "For Producers",
    languages: ["English"],
    readTime: "15 min",
    downloadable: true,
  },
  {
    id: "g7",
    slug: "zobo-hibiscus-guide",
    emoji: "🫐",
    title: "Zobo (Hibiscus sabdariffa) — Safety Profile",
    description:
      "Safety assessment of Hibiscus sabdariffa preparations, with special attention to blood pressure interactions, pregnancy risks, and the growing market for concentrated zobo supplements.",
    category: "Herb Profiles",
    languages: ["English", "Hausa", "Yoruba"],
    readTime: "9 min",
    downloadable: false,
  },
  {
    id: "g8",
    slug: "diabetes-herbs",
    emoji: "🩺",
    title: "Managing Diabetes with Herbs — What the Evidence Says",
    description:
      "An evidence-based review of herbs commonly used for blood sugar management in Nigeria, including bitter leaf, bitter melon, moringa, and fenugreek — with honest assessments of the evidence.",
    category: "Condition-Specific",
    languages: ["English", "Hausa"],
    readTime: "16 min",
    downloadable: true,
  },
  {
    id: "g9",
    slug: "reading-herbal-labels",
    emoji: "🏷️",
    title: "How to Read a Herbal Product Label in Nigeria",
    description:
      'A plain-language guide to decoding herbal product labels: what a NAFDAC number means, what "standardised extract" implies, how to spot red-flag claims, and what\'s missing from most labels.',
    category: "Safe Use",
    languages: ["English", "Pidgin", "Yoruba"],
    readTime: "7 min",
    downloadable: true,
  },
];

const CATEGORIES: Category[] = [
  "Drug Interactions",
  "Herb Profiles",
  "Safe Use",
  "For Producers",
  "Condition-Specific",
];
const LANGUAGES: Language[] = ["English", "Igbo", "Yoruba", "Hausa", "Pidgin"];

const langFlag: Record<Language, string> = {
  English: "🇬🇧",
  Igbo: "🟢",
  Yoruba: "🟡",
  Hausa: "🔵",
  Pidgin: "🇳🇬",
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

export default function GuidesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "ALL">("ALL");
  const [language, setLanguage] = useState<Language | "ALL">("ALL");

  const { data } = useGuides();
  const GUIDES_DATA = (data?.guides ?? GUIDES) as Guide[];
  const featured = GUIDES_DATA.filter((g) => g.featured);
  const filtered = GUIDES_DATA.filter((g) => {
    const matchSearch =
      !search ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "ALL" || g.category === category;
    const matchLanguage =
      language === "ALL" || g.languages.includes(language as Language);
    return matchSearch && matchCategory && matchLanguage;
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
            Safety Guides
          </motion.span>
          <motion.h1
            {...fadeUp(0.08)}
            className="font-serif font-medium text-white text-[clamp(34px,5vw,58px)] leading-[1.1] mb-5 max-w-3xl mx-auto"
          >
            Free Guides to{" "}
            <em className="not-italic text-(--gold-light)">Safe Herbal Use</em>
          </motion.h1>
          <motion.p
            {...fadeUp(0.15)}
            className="text-white/60 text-[17px] font-light max-w-xl mx-auto mb-8"
          >
            Evidence-based safety guides in 5 Nigerian languages — free to read,
            download, and share. No sign-up required.
          </motion.p>
          <motion.div
            {...fadeUp(0.2)}
            className="flex flex-wrap gap-4 justify-center"
          >
            {(
              ["English", "Igbo", "Yoruba", "Hausa", "Pidgin"] as Language[]
            ).map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center gap-1.5 text-[13px] text-white/60 bg-white/8 px-3.5 py-1.5 rounded-full"
              >
                {langFlag[lang]} {lang}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured guides */}
      <section className="py-16 lg:py-20 bg-(--cream-dark)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <SectionTitle
            tag="Start Here"
            title="Most Important Guides"
            subtitle="The three guides our pharmacists recommend to every new user."
          />
          <div className="grid sm:grid-cols-3 gap-5">
            {featured.map((guide, i) => (
              <motion.div
                key={guide.id}
                {...fadeUp(i * 0.08)}
                className="bg-white border border-(--cream-dark)] rounded-2xl p-7 hover:shadow-lg hover:border-(--green-pale)transition-all group"
              >
                <div className="text-[36px] mb-4">{guide.emoji}</div>
                <span className="text-[11px] font-semibold text-(--green-mid) uppercase tracking-wider bg-(--green-pale)/40 px-2.5 py-1 rounded-full">
                  {guide.category}
                </span>
                <h3 className="font-serif text-[18px] font-semibold text-(--green-deep) mt-3 mb-2 leading-snug group-hover:text-(--green-mid) transition-colors">
                  {guide.title}
                </h3>
                <p className="text-[13px] text-(--text-muted) leading-relaxed mb-5 font-light">
                  {guide.description}
                </p>
                <div className="flex items-center gap-3 text-[12px] text-(--text-muted)] mb-5">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {guide.readTime} read
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe size={12} /> {guide.languages.length} languages
                  </span>
                  {guide.downloadable && (
                    <span className="flex items-center gap-1">
                      <Download size={12} /> PDF
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap mb-4">
                  {guide.languages.map((lang) => (
                    <span
                      key={lang}
                      className="text-[11px] text-(--text-muted) bg-(--cream-dark) px-2 py-0.5 rounded-lg"
                    >
                      {langFlag[lang]} {lang}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-(--green-mid) hover:text-(--green-deep) transition-colors"
                >
                  Read Guide <ChevronRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All guides */}
      <section className="py-16 lg:py-20 bg-(--cream)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <SectionTitle tag="All Guides" title="Full Resource Library" />

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
                placeholder="Search guides…"
                className="w-full h-11 pl-10 pr-4 bg-white border border-(--cream-dark) rounded-xl text-[14px] text-(--text-dark) placeholder:text-(--text-muted) outline-none focus:border-(--green-mid) focus:ring-2 focus:ring-(--green-pale) transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCategory("ALL")}
                className={`text-[12px] font-medium px-3 py-2 rounded-lg border transition-all ${category === "ALL" ? "bg-(--green-deep) text-white border-(--green-deep)" : "bg-white text-(--text-muted) border-(--cream-dark)"}`}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-[12px] font-medium px-3 py-2 rounded-lg border transition-all ${category === c ? "bg-(--green-deep) text-white border-(--green-deep)" : "bg-white text-(--text-muted) border-(--cream-dark)"}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setLanguage("ALL")}
                className={`text-[12px] font-medium px-3 py-2 rounded-lg border transition-all ${language === "ALL" ? "bg-(--green-mid) text-white border-(--green-mid)" : "bg-white text-(--text-muted) border-(--cream-dark)"}`}
              >
                All Languages
              </button>
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`text-[12px] font-medium px-3 py-2 rounded-lg border transition-all ${language === l ? "bg-(--green-mid) text-white border-(--green-mid)" : "bg-white text-(--text-muted) border-(--cream-dark)"}`}
                >
                  {langFlag[l]} {l}
                </button>
              ))}
            </div>
          </div>

          {/* Guide list */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-16 text-(--text-muted)">
                No guides match your filter.
              </div>
            )}
            {filtered.map((guide, i) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white border border-(--cream-dark) rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-(--green-pale) hover:shadow-sm transition-all group"
              >
                <span className="text-[28px] shrink-0">{guide.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-semibold text-(--green-mid) uppercase tracking-wider">
                      {guide.category}
                    </span>
                    <span className="text-(--text-muted)">·</span>
                    <span className="text-[12px] text-(--text-muted) flex items-center gap-1">
                      <Clock size={11} /> {guide.readTime}
                    </span>
                  </div>
                  <h3 className="font-semibold text-(--green-deep) text-[15px] mb-1 group-hover:text-(--green-mid) transition-colors">
                    {guide.title}
                  </h3>
                  <div className="flex gap-1.5 flex-wrap">
                    {guide.languages.map((lang) => (
                      <span
                        key={lang}
                        className="text-[11px] text-(--text-muted) bg-(--cream-dark) px-2 py-0.5 rounded-lg"
                      >
                        {langFlag[lang]} {lang}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {guide.downloadable && (
                    <button className="h-9 px-4 text-[12px] font-medium border border-(--cream-dark) rounded-xl text-(--text-muted) hover:border-(--green-mid) hover:text-(--green-mid) transition-all flex items-center gap-1.5">
                      <Download size={12} /> PDF
                    </button>
                  )}
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="h-9 px-4 text-[12px] font-semibold rounded-xl bg-(--green-deep) text-white hover:bg-(--green-mid) transition-colors flex items-center gap-1.5"
                  >
                    Read <ChevronRight size={13} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-(--cream-dark)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 text-center">
          <motion.div {...fadeUp(0)}>
            <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-medium text-(--green-deep) mb-4">
              Need personalised guidance?
            </h2>
            <p className="text-(--text-muted) font-light text-[16px] mb-7 max-w-md mx-auto">
              Our certified herbal pharmacists can review your specific
              situation — including your medications and health conditions.
            </p>
            <Button variant="primary" size="lg" href="/booking">
              Book a Consultation
            </Button>
          </motion.div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </>
  );
}
