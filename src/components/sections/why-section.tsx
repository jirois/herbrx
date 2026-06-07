"use client";

import { motion } from "framer-motion";
import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { whyItems } from "@/data/services";

export function WhySection() {
  return (
    <section className="relative bg-(--green-deep) py-20 lg:py-24 overflow-hidden">
      {/* Decorative rings */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border-60 border-white/4 pointer-events-none" />
      <div className="absolute -left-10 -bottom-16 w-52 h-52 rounded-full border-40 border-white/4 pointer-events-none" />

      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <SectionTitle
              tag="Why HerbRx"
              title={"We're not just\nanother herbal brand"}
              subtitle="We are your trusted herbal health guide — combining rigorous science with deep knowledge of Nigerian herbal tradition."
              light
            />
            <Button variant="outline-light" size="lg" href="/about">
              Our Story →
            </Button>
          </motion.div>

          {/* Right: 2×2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.09 }}
                className="group bg-white/6 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition-colors duration-300"
              >
                <div className="text-[28px] mb-4">{item.icon}</div>
                <h4 className="font-serif text-[19px] font-semibold text-white mb-2">
                  {item.title}
                </h4>
                <p className="text-[14px] text-white/55 leading-relaxed font-light">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
