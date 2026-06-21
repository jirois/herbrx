"use client";

import { motion } from "framer-motion";
import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { Newsletter } from "@/components/sections/newsletter";
import { Footer } from "@/components/sections/footer";

const values = [
  {
    icon: "🔬",
    title: "Science-First",
    desc: "Every claim we publish is grounded in peer-reviewed research and evidence-based pharmacognosy — not tradition alone.",
  },
  {
    icon: "🤝",
    title: "Community-Centred",
    desc: "We exist to serve Nigerians. Our work is shaped by the communities we reach — from Lagos to Kano to Enugu.",
  },
  {
    icon: "🛡️",
    title: "Radical Transparency",
    desc: "No sponsorships. No paid reviews. Our safety ratings are independent and will always be free from commercial influence.",
  },
  {
    icon: "🗣️",
    title: "Inclusive Access",
    desc: "We publish in English, Igbo, Yoruba, Hausa, and Pidgin — because safety information should reach everyone.",
  },
];

const team = [
  {
    name: "Pharm Omanudhowho Ajiri",
    role: "Chief Scientific Officer",
    initials: "AO",
    bg: "#C8DABB",
    color: "#2D5A3D",
    bio: "B.Pharm, MSc Pharmacognosy (UI). 12 years evaluating Nigerian medicinal plants and indigenous remedy systems.",
  },
  {
    name: "Musa Musa",
    role: "Head of Product Safety",
    initials: "EN",
    bg: "#F5E8CE",
    color: "#B8832A",
    bio: "NAFDAC-certified regulatory affairs specialist with deep expertise in herbal product registration and compliance.",
  },
  {
    name: "Fatimah Al-Hassan",
    role: "Community & Languages Lead",
    initials: "FA",
    bg: "#C2DDD5",
    color: "#1A6B5A",
    bio: "Health communication expert driving our multi-language outreach across Northern, Western, and Eastern Nigeria.",
  },
  {
    name: "Segun Adeleke",
    role: "Technology & Operations",
    initials: "SA",
    bg: "#DDD0C8",
    color: "#5A3A2A",
    bio: "Full-stack engineer and operations lead, building the digital infrastructure that powers the HerbRx platform.",
  },
];

const milestones = [
  {
    year: "2020",
    label:
      "Founded in Lagos with a mission to make herbal safety accessible to all Nigerians.",
  },
  {
    year: "2021",
    label:
      "Published our first 50 herb safety reviews, downloaded over 10,000 times in 3 months.",
  },
  {
    year: "2022",
    label:
      "Launched Igbo and Yoruba content. Partnered with two NAFDAC-approved labs.",
  },
  {
    year: "2023",
    label:
      "Expanded consultancy to herbal producers. Reached 1,000+ Nigerians served.",
  },
  {
    year: "2024",
    label:
      "Launched HerbRx Store — curated, verified herbal products in one trusted place.",
  },
  {
    year: "2025",
    label:
      "Now serving 2,000+ Nigerians with 150+ herbs reviewed across 5 languages.",
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

export function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-(--green-deep) overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border-70 border-white/4 pointer-events-none" />
        <div className="absolute -left-16 bottom-0 w-64 h-64 rounded-full border-50p border-white/4 pointer-events-none" />

        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 relative z-10 text-center">
          <motion.span
            {...fadeUp(0)}
            className="inline-block text-[11px] font-medium tracking-[0.15em] uppercase rounded-full px-3.5 py-1 mb-4 bg-white/10 text-(--gold-light)"
          >
            Our Story
          </motion.span>
          <motion.h1
            {...fadeUp(0.08)}
            className="font-serif font-medium text-white text-[clamp(34px,5vw,62px)] leading-[1.1] mb-6 max-w-3xl mx-auto"
          >
            Making Herbal Health{" "}
            <em className="not-italic text-(--gold-light)">Safe</em> for Every
            Nigerian
          </motion.h1>
          <motion.p
            {...fadeUp(0.16)}
            className="text-white/60 text-[17px] font-light leading-relaxed max-w-xl mx-auto mb-10"
          >
            HerbRx bridges centuries of Nigerian herbal tradition with modern
            pharmaceutical science — so you can trust every remedy you take.
          </motion.p>
          <motion.div
            {...fadeUp(0.22)}
            className="flex flex-wrap gap-3 justify-center"
          >
            <Button variant="secondary" size="lg" href="/booking">
              Book a Consultation
            </Button>
            <Button variant="outline-light" size="lg" href="/services">
              Explore Services →
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 lg:py-28 bg-(--cream)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp(0)}>
              <SectionTitle
                tag="Our Mission"
                title={"Trusted herbal guidance,\nin every Nigerian language"}
                subtitle="Millions of Nigerians rely on herbal remedies daily — but most lack access to reliable safety information. HerbRx was built to close that gap."
              />
              <p className="text-(--text-muted) text-[15px] leading-relaxed mb-6">
                We combine rigorous pharmacognosy research with deep cultural
                respect for Nigerian herbal practice. Our pharmacists,
                scientists, and community educators work together to produce
                safety reviews, consultations, and educational resources that
                are honest, accessible, and grounded in evidence.
              </p>
              <p className="text-(--text-muted) text-[15px] leading-relaxed">
                We are proudly Nigerian — shaped by the communities we serve,
                committed to the languages they speak, and driven by the belief
                that herbal safety is a right, not a privilege.
              </p>
            </motion.div>

            {/* Stats panel */}
            <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 gap-4">
              {[
                { value: "2,000+", label: "Nigerians Served" },
                { value: "150+", label: "Herbs Reviewed" },
                { value: "5", label: "Languages Spoken" },
                { value: "98%", label: "Safe-use Rate" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white border border-(--cream-dark) rounded-2xl p-7"
                >
                  <div className="font-serif text-[40px] font-semibold text-(--green-deep) leading-none mb-2">
                    {stat.value}
                  </div>
                  <div className="text-[13px] text-(--text-muted) font-medium uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 lg:py-24 bg-(--cream-dark)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <SectionTitle
            tag="What We Stand For"
            title="Our Core Values"
            subtitle="Everything we do at HerbRx is guided by four uncompromising principles."
            align="center"
            className="max-w-lg mx-auto"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                {...fadeUp(i * 0.08)}
                className="bg-white border border-(--cream-dark) rounded-2xl p-7 hover:shadow-md transition-shadow duration-300"
              >
                <div className="text-[32px] mb-4">{v.icon}</div>
                <h3 className="font-serif text-[18px] font-semibold text-(--green-deep) mb-2">
                  {v.title}
                </h3>
                <p className="text-[14px] text-(--text-muted) leading-relaxed font-light">
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-20 lg:py-28 bg-(--cream)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <SectionTitle
            tag="Our Journey"
            title="From Idea to Impact"
            subtitle="A short history of how HerbRx grew from a Lagos idea into a trusted national platform."
            align="center"
            className="max-w-lg mx-auto"
          />
          <div className="relative max-w-2xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-5.5 top-2 bottom-2 w-0.5 bg-(--green-pale)" />

            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  {...fadeUp(i * 0.07)}
                  className="flex gap-6 items-start"
                >
                  <div className="relative z-10 w-11 h-11 rounded-full bg-(--green-deep) text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    {m.year.slice(2)}
                  </div>
                  <div className="pt-2.5">
                    <span className="text-[12px] font-semibold text-(--gold) tracking-wide uppercase mr-2">
                      {m.year}
                    </span>
                    <span className="text-[15px] text-(--text-body) leading-relaxed">
                      {m.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section id="team" className="py-20 lg:py-28 bg-(--green-deep)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <SectionTitle
            tag="Our Team"
            title="The People Behind HerbRx"
            subtitle="A multidisciplinary team of pharmacists, scientists, regulators, and technologists — united by one mission."
            align="center"
            light
            className="max-w-lg mx-auto"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                {...fadeUp(i * 0.08)}
                className="bg-white/[0.07] border border-white/10 rounded-2xl p-7 hover:bg-white/11 transition-colors duration-300"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-[18px] font-bold mb-5"
                  style={{ background: member.bg, color: member.color }}
                >
                  {member.initials}
                </div>
                <h3 className="font-serif text-[18px] font-semibold text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-[12px] text-(--gold-light) font-medium uppercase tracking-wide mb-3">
                  {member.role}
                </p>
                <p className="text-[13px] text-white/50 leading-relaxed font-light">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-(--cream-dark)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 text-center">
          <motion.div {...fadeUp(0)}>
            <h2 className="font-serif text-[clamp(26px,3.5vw,40px)] font-medium text-(--green-deep) mb-4">
              Ready to experience safe herbal wellness?
            </h2>
            <p className="text-(--text-muted) text-[16px] font-light mb-8 max-w-md mx-auto">
              Book a consultation with our herbal pharmacists or explore our
              verified product store.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="primary" size="lg" href="/booking">
                Book a Consultation
              </Button>
              <Button variant="outline" size="lg" href="/contact">
                Contact Us
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
