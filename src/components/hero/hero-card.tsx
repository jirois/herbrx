"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HeroCard() {
  return (
    <div className="relative w-full max-w-100">
      {/* Floating top badge */}
      <motion.div
        initial={{ opacity: 0, y: -20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{ animation: "float 4s ease-in-out 1s infinite" }}
        className="absolute -top-5 -right-5 bg-(--green-deep) text-white rounded-2xl px-5 py-3.5 z-10 shadow-xl"
      >
        <span className="block font-serif text-[28px] font-semibold text-(--gold-light) leading-none">
          98%
        </span>
        <span className="text-[12px] text-white/70 mt-0.5 block">
          Safe-use rate
        </span>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-(--cream) rounded-3xl p-7 relative z-2"
      >
        {/* Product visual */}
        <div
          className="w-full h-50 rounded-2xl mb-5 flex items-center justify-center gap-4 overflow-hidden relative"
          style={{
            background:
              "linear-gradient(135deg, var(--green-mid), var(--green-light))",
          }}
        >
          {/* Decorative circles */}
          {[
            { size: 100, fontSize: 40, emoji: "🌿" },
            { size: 70, fontSize: 28, emoji: "🌱" },
            { size: 80, fontSize: 32, emoji: "🍃" },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-full bg-white/15 flex items-center justify-center"
              style={{
                width: item.size,
                height: item.size,
                fontSize: item.fontSize,
              }}
            >
              {item.emoji}
            </div>
          ))}
        </div>

        <h3 className="font-serif text-[20px] font-semibold text-(--green-deep) mb-1.5">
          Verified Herbal Products
        </h3>
        <p className="text-[13px] text-(--text-muted) mb-4 font-light leading-relaxed">
          Science-backed safety reviews for Nigerian remedies
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="green">NAFDAC Aligned</Badge>
          <Badge variant="green">Science-Backed</Badge>
          <Badge variant="gold">Expert Verified</Badge>
        </div>
      </motion.div>

      {/* Bottom float card */}
      <motion.div
        initial={{ opacity: 0, y: 20, x: -20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{ animation: "float 4.5s ease-in-out 0.5s infinite" }}
        className="absolute -bottom-5 -left-5 bg-white rounded-2xl px-4 py-3.5 z-10 shadow-lg flex items-center gap-3"
      >
        <div className="w-9 h-9 bg-(--green-pale) rounded-xl flex items-center justify-center shrink-0">
          <CheckCircle size={18} className="text-(--green-mid)" />
        </div>
        <div>
          <div className="text-[13px] font-medium text-(--text-dark)">
            Latest Review Published
          </div>
          <div className="text-[11px] text-(--text-muted)">
            Liver Detox Blend —{" "}
            {new Date().toLocaleDateString("en-NG", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
