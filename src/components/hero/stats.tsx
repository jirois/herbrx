"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";
import CountUp from "react-countup";
import { stats } from "@/data/services";

export function HeroStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="flex items-center gap-8 flex-wrap">
      {stats.slice(0, 3).map((stat) => (
        <div key={stat.label} className="border-l-2 border-(--gold) pl-4">
          <div className="font-serif text-[28px] font-semibold text-white leading-none">
            {inView ? (
              <CountUp
                end={stat.value}
                duration={2.2}
                delay={0.2}
                separator=","
                suffix={stat.suffix}
                prefix={stat.prefix}
              />
            ) : (
              <span>0{stat.suffix}</span>
            )}
          </div>
          <div className="text-[12px] text-white/50 mt-1 tracking-wider">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
