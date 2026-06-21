"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { Newsletter } from "@/components/sections/newsletter";
import { Footer } from "@/components/sections/footer";

const servicesFull = [
  {
    id: "safety-reviews",
    icon: "🛡️",
    title: "Safety Reviews",
    tagline: "Unbiased. Science-backed. Free from sponsorship.",
    desc: "We independently evaluate herbal products circulating in Nigeria — assessing efficacy, potential interactions, contaminants, and label accuracy. Our review reports are published openly and are free to access.",
    features: [
      "Full ingredient and contaminant screening",
      "Drug-herb interaction analysis",
      "Dosage and label accuracy assessment",
      "Published openly on our platform",
    ],
    cta: "View Safety Reviews",
    href: "/services/safety-reviews",
    highlight: false,
  },
  {
    id: "expert-consultation",
    icon: "👨‍⚕️",
    title: "Expert Consultation",
    tagline: "One-on-one with a herbal pharmacist.",
    desc: "Book a private session with one of our certified herbal pharmacists. We'll review your current remedies, health goals, and existing medications to build a safe, personalised herbal wellness plan for you.",
    features: [
      "60-minute video or in-person session",
      "Personalised herbal wellness plan",
      "Interaction check with existing meds",
      "Follow-up report sent to your email",
    ],
    cta: "Book a Session",
    href: "/booking",
    highlight: true,
  },
  {
    id: "educational-resources",
    icon: "📚",
    title: "Educational Resources",
    tagline: "In your language. At no cost.",
    desc: "Browse our library of guides, articles, and explainer videos covering common Nigerian herbs, their benefits, risks, and proper use. Available in English, Igbo, Yoruba, Hausa, and Pidgin.",
    features: [
      "100+ free herbal safety guides",
      "Video explainers in 5 languages",
      "Downloadable remedy interaction cards",
      "Condition-specific resource bundles",
    ],
    cta: "Explore Resources",
    href: "/resources",
    highlight: false,
  },
  {
    id: "producer-consultancy",
    icon: "🏭",
    title: "Producer Consultancy",
    tagline: "For brands that want to do it right.",
    desc: "We work with Nigerian herbal producers to improve formulation quality, packaging, labelling, and NAFDAC compliance. Whether you're an artisan producer or a growing brand, we'll help you build trust.",
    features: [
      "Formulation safety and stability review",
      "Labelling and claims compliance check",
      "NAFDAC registration guidance",
      "GMP advisory for production scale-up",
    ],
    cta: "Learn More",
    href: "/services/producers",
    highlight: false,
  },
  {
    id: "product-submission",
    icon: "📋",
    title: "Product Submission",
    tagline: "Get your product professionally reviewed.",
    desc: "Submit your herbal product to receive a detailed, independent safety and efficacy report. Use the report to improve your product, satisfy customers, or support your NAFDAC application.",
    features: [
      "Full safety and efficacy assessment",
      "Written report with recommendations",
      "Turnaround within 10 business days",
      "Confidentiality guaranteed",
    ],
    cta: "Submit a Product",
    href: "/submit",
    highlight: false,
  },
  {
    id: "safety-alerts",
    icon: "🔔",
    title: "Safety Alerts",
    tagline: "Know before you consume.",
    desc: "Subscribe to receive immediate alerts when harmful, adulterated, or counterfeit herbal products are identified in the Nigerian market. Stay protected in real time.",
    features: [
      "Real-time SMS and email alerts",
      "Product batch number tracking",
      "Regional distribution warnings",
      "Free to subscribe, always",
    ],
    cta: "Subscribe to Alerts",
    href: "/alerts",
    highlight: false,
  },
];

const faqs = [
  {
    q: "Are your safety reviews truly independent?",
    a: "Yes. HerbRx does not accept payments, sponsorships, or commissions from herbal brands or manufacturers. Our reviews are funded by consultation fees and voluntary support.",
  },
  {
    q: "How long does a product submission take?",
    a: "We typically complete product review reports within 10 business days of receiving a valid sample and completed submission form.",
  },
  {
    q: "Can I book a consultation outside Lagos?",
    a: "Yes. All consultations are available via video call. In-person sessions are currently available in Lagos and Abuja.",
  },
  {
    q: "Are resources available in Hausa and Pidgin?",
    a: "Yes. We publish in English, Igbo, Yoruba, Hausa, and Nigerian Pidgin. Language availability varies by resource type.",
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

export function ServicesPage() {
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
            What We Do
          </motion.span>
          <motion.h1
            {...fadeUp(0.08)}
            className="font-serif font-medium text-white text-[clamp(34px,5vw,62px)] leading-[1.1] mb-6 max-w-3xl mx-auto"
          >
            Every tool you need for{" "}
            <em className="not-italic text-(--gold-light)">
              safe herbal wellness
            </em>
          </motion.h1>
          <motion.p
            {...fadeUp(0.16)}
            className="text-white/60 text-[17px] font-light leading-relaxed max-w-xl mx-auto mb-10"
          >
            From independent safety reviews to expert consultations and producer
            support — HerbRx covers the full spectrum of herbal health services.
          </motion.p>
          <motion.div {...fadeUp(0.22)}>
            <Button variant="secondary" size="lg" href="/booking">
              Book a Free Consultation
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Services grid ── */}
      <section className="py-20 lg:py-28 bg-(--cream)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-6">
            {servicesFull.map((svc, i) => (
              <motion.div
                key={svc.id}
                {...fadeUp(i * 0.07)}
                className={[
                  "relative rounded-2xl border p-8 flex flex-col transition-shadow duration-300 hover:shadow-lg",
                  svc.highlight
                    ? "bg-(--green-deep) border-(--green-mid)"
                    : "bg-white border-(--cream-dark)",
                ].join(" ")}
              >
                {svc.highlight && (
                  <span className="absolute top-6 right-6 text-[11px] font-semibold uppercase tracking-wider bg-(--gold) text-white px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="text-[36px] mb-4">{svc.icon}</div>
                <h3
                  className={[
                    "font-serif text-[22px] font-semibold mb-1",
                    svc.highlight ? "text-white" : "text-(--green-deep)",
                  ].join(" ")}
                >
                  {svc.title}
                </h3>
                <p
                  className={[
                    "text-[13px] font-medium mb-3 uppercase tracking-wide",
                    svc.highlight ? "text-(--gold-light)" : "text-(--gold)",
                  ].join(" ")}
                >
                  {svc.tagline}
                </p>
                <p
                  className={[
                    "text-[15px] leading-relaxed font-light mb-6",
                    svc.highlight ? "text-white/60" : "text-(--text-muted)",
                  ].join(" ")}
                >
                  {svc.desc}
                </p>
                <ul className="space-y-2 mb-8 flex-1">
                  {svc.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span
                        className={[
                          "mt-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                          svc.highlight
                            ? "bg-white/15 text-white"
                            : "bg-(--green-pale) text-(--green-deep)",
                        ].join(" ")}
                      >
                        ✓
                      </span>
                      <span
                        className={[
                          "text-[14px] font-light",
                          svc.highlight
                            ? "text-white/75"
                            : "text-(--text-body)",
                        ].join(" ")}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={svc.href}
                  className={[
                    "inline-flex items-center gap-2 font-medium text-[14px] transition-colors",
                    svc.highlight
                      ? "text-(--gold-light) hover:text-white"
                      : "text-(--green-mid) hover:text-(--green-deep)",
                  ].join(" ")}
                >
                  {svc.cta} →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 lg:py-24 bg-(--cream-dark)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-16 items-start">
            <motion.div {...fadeUp(0)}>
              <SectionTitle
                tag="FAQ"
                title="Common Questions"
                subtitle="Everything you need to know before getting started with HerbRx services."
              />
              <Button variant="outline" size="md" href="/contact">
                Ask Us Anything →
              </Button>
            </motion.div>
            <div className="space-y-5">
              {faqs.map((faq, i) => (
                <motion.div
                  key={faq.q}
                  {...fadeUp(i * 0.08)}
                  className="bg-white border border-(--cream-dark) rounded-2xl p-7"
                >
                  <h4 className="font-serif text-[17px] font-semibold text-(--green-deep) mb-2">
                    {faq.q}
                  </h4>
                  <p className="text-[14px] text-(--text-muted) leading-relaxed font-light">
                    {faq.a}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </>
  );
}
