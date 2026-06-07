"use client";

import { motion } from "framer-motion";
import { HeroCard } from "./hero-card";
import { HeroStats } from "./stats";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

export function Hero() {
  return (
    <section
      className="relative min-h-[88vh] grid lg:grid-cols-2 overflow-hidden bg-(--green-deep)"
      aria-label="Hero"
    >
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern pointer-events-none" />

      {/* Decorative blobs */}
      <div
        className="absolute -top-15 right-30 w-[320px] h-80 rounded-[50%_10%_50%_10%] opacity-30 pointer-events-none"
        style={{ background: "var(--green-mid)", transform: "rotate(-20deg)" }}
      />
      <div
        className="absolute -bottom-20 -right-10 w-105 h-105 rounded-[10%_50%_10%_50%] opacity-20 pointer-events-none"
        style={{ background: "var(--green-light)", transform: "rotate(15deg)" }}
      />

      {/* ── Left Column ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col justify-center px-8 py-20 lg:px-16 lg:py-24 xl:pl-20"
      >
        {/* Badge */}
        <motion.div variants={fadeUp}>
          <div className="inline-flex items-center gap-2.5 bg-white/8 border border-white/15 rounded-full px-4 py-1.5 mb-8 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-(--gold-light) shrink-0" />
            <span className="text-[12px] text-white/70 tracking-widest uppercase">
              Trusted Herbal Health in Nigeria
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-serif font-medium text-white leading-[1.1] mb-6"
          style={{ fontSize: "clamp(40px, 5vw, 62px)" }}
        >
          Making Herbal <em className="text-(--gold-light) not-italic">Safe</em>
          <br />
          for Every Nigerian
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-[16px] text-white/65 leading-relaxed max-w-105 mb-10 font-light"
        >
          HerbRx bridges ancient herbal wisdom and modern safety science — so
          you can trust every remedy you take, in your language, for your body.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center gap-4 mb-14"
        >
          <Button variant="secondary" size="lg" href="/booking">
            Book a Consultation
          </Button>
          <Button variant="outline-light" size="lg" href="/services">
            Explore Services →
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp}>
          <HeroStats />
        </motion.div>
      </motion.div>

      {/* ── Right Column ── */}
      <div className="hidden lg:flex items-center justify-center px-10 relative z-10 py-16">
        <HeroCard />
      </div>
    </section>
  );
}
