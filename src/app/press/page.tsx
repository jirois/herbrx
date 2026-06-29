"use client";

import { motion } from "framer-motion";
// import Link from 'next/link'
import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { Newsletter } from "@/components/sections/newsletter";
import { Footer } from "@/components/sections/footer";
import { usePress } from "@/hooks/dashboard-hooks";

// Static fallback
const PRESS_COVERAGE = [
  {
    outlet: "TechCabal",
    logo: "📰",
    headline:
      "This Nigerian startup is making herbal medicine safer through science — and it's free",
    date: "March 2025",
    excerpt:
      "HerbRx has quietly built the most comprehensive database of Nigerian herb safety data, available in five local languages and accessible to anyone with a smartphone.",
    href: "#",
    category: "Feature",
  },
  {
    outlet: "BusinessDay",
    logo: "📊",
    headline:
      "The ₦60bn herbal medicine market has a safety problem. HerbRx wants to fix it.",
    date: "January 2025",
    excerpt:
      "As Nigeria's traditional medicine industry grows, one Lagos-based company is using pharmacognosy and tech to ensure consumers aren't harmed in the process.",
    href: "#",
    category: "Interview",
  },
  {
    outlet: "Channels TV",
    logo: "📺",
    headline:
      "HerbRx pharmacists speak out on rising counterfeit herbal products in Lagos",
    date: "November 2024",
    excerpt:
      "A live segment featuring HerbRx's Dr. Adaeze Okonkwo on the growing risk of adulterated herbal products in Nigerian markets.",
    href: "#",
    category: "Broadcast",
  },
  {
    outlet: "Pulse Nigeria",
    logo: "📱",
    headline:
      "Why Nigerians are switching from self-medication to verified herbal consultations",
    date: "October 2024",
    excerpt:
      "HerbRx's telehealth model is changing how everyday Nigerians approach herbal wellness — replacing guesswork with expert guidance.",
    href: "#",
    category: "Feature",
  },
  {
    outlet: "The Punch",
    logo: "🗞️",
    headline:
      "NAFDAC and HerbRx partner to improve herbal product compliance monitoring",
    date: "August 2024",
    excerpt:
      "A new information-sharing framework between HerbRx and regulators aims to speed up adverse event reporting for herbal products.",
    href: "#",
    category: "News",
  },
  {
    outlet: "Ventures Africa",
    logo: "🌍",
    headline: "African healthtech is going beyond hospitals — HerbRx is proof",
    date: "June 2024",
    excerpt:
      "Traditional medicine represents a multi-billion dollar opportunity in Africa, but safety infrastructure has lagged. HerbRx is building it.",
    href: "#",
    category: "Analysis",
  },
];

const PRESS_RELEASES = [
  {
    date: "June 2025",
    title:
      "HerbRx Launches Tier 2 Verified Producer Programme, Raising the Bar for Nigerian Herbal Safety",
  },
  {
    date: "April 2025",
    title:
      "HerbRx Issues Platform-Wide Safety Alert on Counterfeit Moringa Products in Lagos",
  },
  {
    date: "February 2025",
    title:
      "HerbRx Reaches 2,000 Nigerians Served, Publishes Annual Safety Impact Report",
  },
  {
    date: "November 2024",
    title:
      "HerbRx Expands to Hausa and Pidgin, Making Herbal Safety Information Accessible to All Nigerians",
  },
  {
    date: "July 2024",
    title:
      "HerbRx Launches Herb × Drug Interaction Engine — A First for Nigerian Herbal Healthcare",
  },
];

const BRAND_COLORS = [
  { name: "Forest Green", hex: "#1A3A2A", usage: "Primary brand colour" },
  { name: "Herbal Green", hex: "#2D5A3D", usage: "Secondary / midtone" },
  { name: "Pale Leaf", hex: "#C8DABB", usage: "Accent / backgrounds" },
  { name: "Harvest Gold", hex: "#B8832A", usage: "CTA / highlights" },
  { name: "Natural Cream", hex: "#F7F3EC", usage: "Page background" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

export default function PressPage() {
  const { data: coverageData } = usePress("COVERAGE");
  const { data: releasesData } = usePress("RELEASE");
  const liveCoverage = coverageData?.items ?? PRESS_COVERAGE;
  const liveReleases = releasesData?.items ?? PRESS_RELEASES;
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
            Press & Media
          </motion.span>
          <motion.h1
            {...fadeUp(0.08)}
            className="font-serif font-medium text-white text-[clamp(34px,5vw,58px)] leading-[1.1] mb-5 max-w-3xl mx-auto"
          >
            HerbRx in the{" "}
            <em className="not-italic text-(--gold-light)">Press</em>
          </motion.h1>
          <motion.p
            {...fadeUp(0.15)}
            className="text-white/60 text-[17px] font-light max-w-xl mx-auto mb-8"
          >
            Media resources, coverage, press releases, and contact details for
            journalists and content creators.
          </motion.p>
          <motion.div
            {...fadeUp(0.2)}
            className="flex flex-wrap gap-3 justify-center"
          >
            <Button variant="secondary" size="md" href="mailto:press@herbrx.ng">
              Contact Press Team
            </Button>
            <Button variant="outline-light" size="md" href="#assets">
              Download Brand Assets
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Press coverage */}
      <section className="py-20 lg:py-28 bg-(--cream)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <SectionTitle
            tag="In the Media"
            title="What they're saying about HerbRx"
            subtitle="Coverage from Nigeria's leading news, business, and technology publications."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(
              liveCoverage as Array<{
                outlet: string;
                logo: string;
                headline: string;
                date: string;
                excerpt: string;
                href: string;
                category: string;
              }>
            ).map((item, i: number) => (
              <motion.a
                key={item.outlet}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                {...fadeUp(i * 0.06)}
                className="group bg-white border border-(--cream-dark) rounded-2xl p-6 hover:shadow-lg hover:border-[(--green-pale) transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[22px]">{item.logo}</span>
                    <span className="font-semibold text-(--green-deep) text-[15px]">
                      {item.outlet}
                    </span>
                  </div>
                  <span className="text-[11px] text-(--text-muted) bg-(--cream-dark) px-2.5 py-1 rounded-full">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-serif text-[16px] font-semibold text-(--green-deep) leading-snug mb-3 flex-1 group-hover:text-(--green-mid) transition-colors">
                  {item.headline}
                </h3>
                <p className="text-[13px] text-(--text-muted) leading-relaxed mb-4 font-light">
                  {item.excerpt}
                </p>
                <div className="flex items-center justify-between text-[12px] text-(--text-muted)">
                  <span>{item.date}</span>
                  <span className="flex items-center gap-1 text-(--green-mid) group-hover:gap-2 transition-all">
                    Read article →
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Press releases */}
      <section className="py-16 bg-(--cream-dark)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <SectionTitle
            tag="Press Releases"
            title="Official Announcements"
            className="max-w-xl"
          />
          <div className="space-y-3">
            {(liveReleases as Array<{ date: string; title: string }>).map(
              (pr: { date: string; title: string }, i: number) => (
                <motion.div
                  key={pr.title}
                  {...fadeUp(i * 0.06)}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 bg-white border border-(--cream-dark) rounded-2xl px-6 py-5 hover:border-(--green-pale) hover:shadow-sm transition-all group cursor-pointer"
                >
                  <span className="text-[12px] font-medium text-(--text-muted) bg-(--cream-dark) px-3 py-1.5 rounded-lg shrink-0 w-fit">
                    {pr.date}
                  </span>
                  <p className="font-medium text-(--green-deep) text-[15px] flex-1 group-hover:text-(--green-mid) transition-colors">
                    {pr.title}
                  </p>
                  <span className="text-(--green-mid) text-[13px] shrink-0 hidden sm:block">
                    Download PDF →
                  </span>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Brand assets */}
      <section id="assets" className="py-20 lg:py-24 bg-(--cream)">
        <div className="max-w-[(--max-width)] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Logos */}
            <motion.div {...fadeUp(0)}>
              <SectionTitle
                tag="Brand Assets"
                title="Logos & Visual Identity"
                subtitle="Download official HerbRx logos for editorial use. Please do not alter colours or proportions."
              />
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Logo — Dark",
                    bg: "bg-[var(--green-deep)]",
                    textColor: "text-white",
                  },
                  {
                    label: "Logo — Light",
                    bg: "bg-white border border-[var(--cream-dark)]",
                    textColor: "text-[var(--green-deep)]",
                  },
                  {
                    label: "Logo — Cream",
                    bg: "bg-[var(--cream-dark)]",
                    textColor: "text-[var(--green-deep)]",
                  },
                  {
                    label: "Mark only",
                    bg: "bg-[var(--green-mid)]",
                    textColor: "text-white",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`${item.bg} rounded-2xl p-8 flex flex-col items-center gap-3 group cursor-pointer`}
                  >
                    <div
                      className={`font-serif text-[22px] font-semibold italic ${item.textColor}`}
                    >
                      HerbRx
                    </div>
                    <span
                      className={`text-[11px] ${item.textColor} opacity-60`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`text-[11px] ${item.textColor} opacity-0 group-hover:opacity-60 transition-opacity`}
                    >
                      ↓ Download
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="md" className="mt-5" href="#">
                Download Full Brand Kit (.zip)
              </Button>
            </motion.div>

            {/* Colours + contact */}
            <div>
              <motion.div {...fadeUp(0.1)} className="mb-10">
                <SectionTitle
                  tag="Brand Colours"
                  title="Colour Palette"
                  subtitle="Use these exact values when referencing HerbRx in publications."
                />
                <div className="space-y-2.5">
                  {BRAND_COLORS.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-4 bg-white border border-(--cream-dark) rounded-xl px-5 py-3"
                    >
                      <div
                        className="w-9 h-9 rounded-lg shrink-0 border border-black/10"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div className="flex-1">
                        <p className="text-[14px] font-semibold text-(--green-deep)">
                          {c.name}
                        </p>
                        <p className="text-[12px] text-(--text-muted)">
                          {c.usage}
                        </p>
                      </div>
                      <code className="text-[12px] font-mono text-(--text-muted) bg-(--cream-dark) px-2 py-0.5 rounded">
                        {c.hex}
                      </code>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Press contact */}
              <motion.div
                {...fadeUp(0.2)}
                className="bg-(--green-deep) rounded-2xl p-7 text-white"
              >
                <p className="text-[12px] text-white/50 uppercase tracking-wider mb-2">
                  Press Contact
                </p>
                <h3 className="font-serif text-[20px] font-semibold mb-2">
                  Media Enquiries
                </h3>
                <p className="text-[14px] text-white/60 leading-relaxed mb-5">
                  For interviews, fact-checking, expert commentary on Nigerian
                  herbal medicine, or editorial licensing, contact our
                  communications team.
                </p>
                <div className="space-y-2 mb-5 text-[14px] text-white/70">
                  <p>
                    📧{" "}
                    <a
                      href="mailto:press@herbrx.ng"
                      className="hover:text-white transition-colors"
                    >
                      press@herbrx.ng
                    </a>
                  </p>
                  <p>
                    📞{" "}
                    <a
                      href="tel:+2348004372793"
                      className="hover:text-white transition-colors"
                    >
                      +234 800 HERBRX
                    </a>
                  </p>
                  <p>⏱ Response within 4 business hours</p>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  href="mailto:press@herbrx.ng"
                >
                  Email the Press Team
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </>
  );
}
