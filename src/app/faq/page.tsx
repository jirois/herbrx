"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { Newsletter } from "@/components/sections/newsletter";
import { Footer } from "@/components/sections/footer";
import { Search, ChevronDown, MessageSquare } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  // General
  {
    id: "f1",
    category: "General",
    question: "What is HerbRx?",
    answer:
      "HerbRx is a Nigerian herbal health platform that bridges traditional herbal medicine with modern pharmacognosy science. We provide independent safety reviews of herbal products, expert consultations with certified herbal pharmacists, a curated marketplace of verified herbal products, and free educational resources in five Nigerian languages (English, Igbo, Yoruba, Hausa, and Pidgin).",
  },
  {
    id: "f2",
    category: "General",
    question: "Is HerbRx affiliated with NAFDAC or any government agency?",
    answer:
      "No. HerbRx is an independent private platform. We are not affiliated with NAFDAC, the Federal Ministry of Health, or any Nigerian government agency. Our safety reviews and alerts are independently produced and are not a substitute for official regulatory decisions. We do share relevant adverse event data with regulatory bodies where appropriate.",
  },
  {
    id: "f3",
    category: "General",
    question: "Are your safety reviews truly unbiased?",
    answer:
      "Yes. HerbRx does not accept sponsorships, paid reviews, or commissions from herbal brands, manufacturers, or distributors. Our reviews are funded by consultation fees, voluntary user support, and grants. Our scientific team applies standardised pharmacognosy review criteria to every product and herb we evaluate. Producers cannot pay to influence safety ratings.",
  },
  {
    id: "f4",
    category: "General",
    question: "Which languages does HerbRx support?",
    answer:
      "Our resources are available in English, Igbo, Yoruba, Hausa, and Nigerian Pidgin. Availability varies by resource — safety reviews and most herb profiles are in English, while selected guides, alerts, and educational materials are translated. We are actively expanding multi-language coverage.",
  },
  // Safety & Reviews
  {
    id: "f5",
    category: "Safety Reviews",
    question: "How does HerbRx review herbal products?",
    answer:
      "Our review process involves four stages: document review (Certificate of Analysis from accredited labs), active ingredient verification, drug interaction analysis, and label accuracy assessment. Products must pass all four stages to receive an Approved status. We use internationally recognised pharmacognosy standards and Nigerian-specific regulatory guidelines.",
  },
  {
    id: "f6",
    category: "Safety Reviews",
    question: "What is a Certificate of Analysis (COA)?",
    answer:
      "A Certificate of Analysis (COA) is a document from an accredited testing laboratory that certifies the identity, purity, potency, and microbiological safety of a herbal product batch. A valid COA for herbal products should include heavy metals screening (Lead, Mercury, Cadmium, Arsenic), total plate count, identification of active compounds, and moisture content, at minimum. HerbRx requires COAs from NAFDAC-recognised laboratories for all Tier 2 verified products.",
  },
  {
    id: "f7",
    category: "Safety Reviews",
    question: "Can I submit a product for review?",
    answer:
      "Yes. Both producers and consumers can submit products for review. Producers submit through the Producer Dashboard using our Batch/COA submission workflow. Individual consumers can submit products through the Contact page. Our standard review turnaround is 10 business days. All findings are published openly — we do not suppress negative results.",
  },
  {
    id: "f8",
    category: "Safety Reviews",
    question: "What does a safety alert mean for a product I already have?",
    answer:
      "If a product you own or use is subject to a Danger-level alert, stop using it immediately. For Warning-level alerts, read the alert carefully — you may need to consult a pharmacist, especially if you take prescription medications. For Info-level alerts, no immediate action is required but you should read and save the updated guidance. If you are unsure, book a consultation with one of our pharmacists.",
  },
  // Consultations
  {
    id: "f9",
    category: "Consultations",
    question: "What happens in a HerbRx consultation?",
    answer:
      "Consultations are 30-minute video sessions with a certified practitioner (herbalist, pharmacist, naturopath, or toxicologist, depending on your needs). Before the session, you share your current medications, health conditions, and the specific questions or products you want to discuss. The practitioner reviews your situation and produces a short written report, emailed to you after the session.",
  },
  {
    id: "f10",
    category: "Consultations",
    question: "How much does a consultation cost?",
    answer:
      "Consultations start from ₦3,500 for a pharmacist session and go up to ₦7,500 for a toxicologist session. All prices are for a 30-minute video call. There are no subscriptions — you pay per session. Payment is processed securely via Paystack.",
  },
  {
    id: "f11",
    category: "Consultations",
    question: "Can I book a consultation outside of Lagos?",
    answer:
      "Yes. All consultations are conducted via video call and are available to anyone in Nigeria (or abroad). In-person sessions are only available in Lagos and Abuja at this time.",
  },
  {
    id: "f12",
    category: "Consultations",
    question: "Are consultations confidential?",
    answer:
      "Yes. All consultation content is strictly confidential between you and your practitioner. We do not share your health information with third parties, advertisers, or producers. Your data is stored securely and handled in accordance with our privacy policy.",
  },
  // For Producers
  {
    id: "f13",
    category: "For Producers",
    question: "What is the HerbRx Verified (Tier 2) programme?",
    answer:
      'The Verified programme (Tier 2) allows producers who pass our compliance review to sell in the HerbRx marketplace and display the "HerbRx Verified Safe" badge on their products. To qualify, producers must submit valid business registration (CAC), a lab partnership letter from an accredited testing laboratory, and at least one approved COA for each product they wish to list. Verification is free to apply for and is reviewed within 3–5 business days.',
  },
  {
    id: "f14",
    category: "For Producers",
    question: "What happens if my product fails the review?",
    answer:
      "If a product fails COA review, you will receive a detailed written report explaining which parameters did not meet acceptable limits and what remediation steps are required. You can resubmit with a new COA after addressing the issues. Repeated failures or submission of falsified documents will result in account suspension.",
  },
  {
    id: "f15",
    category: "For Producers",
    question: "Do I need a NAFDAC number to list on HerbRx?",
    answer:
      "A NAFDAC registration number is not required to list on HerbRx, but it significantly strengthens your verification application and is displayed prominently on your product page. We strongly encourage all producers to pursue NAFDAC registration. Products with valid NAFDAC numbers receive a separate NAFDAC badge visible to consumers.",
  },
  // Account & Privacy
  {
    id: "f16",
    category: "Account & Privacy",
    question: "Do I need to create an account to use HerbRx?",
    answer:
      "No. The Herb Directory, Safety Guides, Safety Alerts, and general product information are freely accessible without an account. An account is required to book consultations, purchase products, access your order history, use the Interaction Engine, or manage a producer profile.",
  },
  {
    id: "f17",
    category: "Account & Privacy",
    question: "Does HerbRx sell my data?",
    answer:
      "Never. HerbRx does not sell, rent, or share your personal data with advertisers, third parties, or commercial partners. Your health profile and consultation records are strictly confidential. We collect only the data required to provide our services, and you can request deletion of your account and data at any time.",
  },
  {
    id: "f18",
    category: "Account & Privacy",
    question: "Is the Herb × Drug Interaction Engine a medical tool?",
    answer:
      "The Interaction Engine is an informational tool, not a clinical diagnostic tool. It checks your listed medications against a curated database of known herb-drug interactions. Results are for general awareness — they do not replace a pharmacist consultation, especially for complex medication regimens. Always confirm with a qualified healthcare provider before making any changes to your medications or herbal use.",
  },
];

const CATEGORIES = [
  "All",
  "General",
  "Safety Reviews",
  "Consultations",
  "For Producers",
  "Account & Privacy",
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = FAQ_ITEMS.filter((f) => {
    const matchSearch =
      !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || f.category === category;
    return matchSearch && matchCategory;
  });

  // Group by category for rendering
  const grouped = CATEGORIES.slice(1).reduce<Record<string, FAQItem[]>>(
    (acc, cat) => {
      const items = filtered.filter((f) => f.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    },
    {},
  );

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
            FAQ
          </motion.span>
          <motion.h1
            {...fadeUp(0.08)}
            className="font-serif font-medium text-white text-[clamp(34px,5vw,58px)] leading-[1.1] mb-5 max-w-2xl mx-auto"
          >
            Frequently Asked{" "}
            <em className="not-italic text-(--gold-light)">Questions</em>
          </motion.h1>
          <motion.p
            {...fadeUp(0.15)}
            className="text-white/60 text-[17px] font-light max-w-xl mx-auto mb-8"
          >
            Everything you need to know about HerbRx — our services, safety
            reviews, consultations, and producer programme.
          </motion.p>
          {/* Search */}
          <motion.div {...fadeUp(0.2)} className="relative max-w-md mx-auto">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="w-full h-12 pl-11 pr-4 bg-white/10 border border-white/20 rounded-xl text-[15px] text-white placeholder:text-white/40 outline-none focus:border-(--green-pale) focus:bg-white/15 transition-all"
            />
          </motion.div>
        </div>
      </section>

      {/* FAQ body */}
      <section className="py-16 lg:py-24 bg-(--cream)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-[220px_1fr] gap-12 items-start">
            {/* Category nav — sticky sidebar */}
            <motion.nav {...fadeUp(0)} className="lg:sticky lg:top-24">
              <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-3">
                Categories
              </p>
              <ul className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-[14px] font-medium transition-all ${category === cat ? "bg-(--green-deep) text-white" : "text-(--text-body) hover:bg-(--cream-dark)"}`}
                    >
                      {cat}
                      <span
                        className={`ml-2 text-[11px] ${category === cat ? "text-white/60" : "text-(--text-muted)"}`}
                      >
                        (
                        {cat === "All"
                          ? filtered.length
                          : filtered.filter((f) => f.category === cat).length}
                        )
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-5 bg-(--green-deep) rounded-2xl text-white">
                <MessageSquare size={18} className="mb-2" />
                <p className="font-semibold text-[15px] mb-1">
                  Still have questions?
                </p>
                <p className="text-[13px] text-white/55 mb-4">
                  Our team replies within one business day.
                </p>
                <Button variant="secondary" size="sm" href="/contact">
                  Contact Us
                </Button>
              </div>
            </motion.nav>

            {/* FAQ items */}
            <div>
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-(--text-muted) text-[15px]">
                    No questions match your search.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setCategory("All");
                    }}
                    className="mt-3 text-(--green-mid) text-[14px] hover:text-(--green-deep) transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {category === "All" ? (
                Object.entries(grouped).map(([cat, items], gi) => (
                  <motion.div
                    key={cat}
                    {...fadeUp(gi * 0.06)}
                    className="mb-10"
                  >
                    <h2 className="font-serif text-[22px] font-semibold text-(--green-deep) mb-5 pb-3 border-b border-(--cream-dark)">
                      {cat}
                    </h2>
                    <FAQList
                      items={items}
                      openId={openId}
                      setOpenId={setOpenId}
                    />
                  </motion.div>
                ))
              ) : (
                <FAQList
                  items={filtered}
                  openId={openId}
                  setOpenId={setOpenId}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-(--cream-dark)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 text-center">
          <motion.div {...fadeUp(0)}>
            <h2 className="font-serif text-[clamp(22px,3vw,34px)] font-medium text-(--green-deep) mb-4">
              Not finding what you need?
            </h2>
            <p className="text-(--text-muted) font-light text-[15px] mb-7 max-w-md mx-auto">
              Book a 30-minute consultation with one of our certified
              pharmacists for personalised answers to your specific situation.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="primary" size="lg" href="/booking">
                Book a Consultation
              </Button>
              <Button variant="outline" size="lg" href="/contact">
                Send Us a Message
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </>
  );
}

function FAQList({
  items,
  openId,
  setOpenId,
}: {
  items: FAQItem[];
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={`bg-white border rounded-2xl overflow-hidden transition-all ${isOpen ? "border-(--green-pale) shadow-sm" : "border-(--cream-dark)"}`}
          >
            <button
              className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              <span className="font-semibold text-(--green-deep) text-[15px] leading-snug">
                {item.question}
              </span>
              <ChevronDown
                size={18}
                className={`text-(--text-muted) shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 border-t border-(--cream-dark) pt-4">
                    <p className="text-[14px] text-(--text-body) leading-relaxed font-light">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
