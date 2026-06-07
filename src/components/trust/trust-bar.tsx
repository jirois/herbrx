"use client";

import { motion } from "framer-motion";
import { trustItems } from "@/data/services";

export function TrustBar() {
  // Double for seamless loop
  const items = [...trustItems, ...trustItems];

  return (
    <div className="bg-(--cream-dark) border-b border-black/6 py-4 overflow-hidden">
      <motion.div
        className="flex items-center gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 28,
          ease: "linear",
          repeat: Infinity,
        }}
        style={{ width: "max-content" }}
      >
        {items.map((item, i) => {
          const Icon = item.icon;

          return (
            <span
              key={i}
              className="inline-flex items-center gap-2.5 text-[13px] text-(--text-muted) shrink-0"
            >
              <span className="w-8 h-8 bg-(--green-pale) rounded-lg flex items-center justify-center text-[16px] shrink-0">
                <Icon />
              </span>
              {item.label}
              {i < items.length - 1 && (
                <span className="ml-6 w-px h-5 bg-black/10 shrink-0" />
              )}
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}
