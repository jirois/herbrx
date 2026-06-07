"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/types";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  index: number;
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div
        className={cn(
          "group relative bg-white rounded-2xl p-8 border border-(--cream-dark)",
          "hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(26,58,42,0.10)]",
          "transition-all duration-300 cursor-default h-full flex flex-col",
          service.highlight && "ring-2 ring-(--green-mid) ring-offset-2",
        )}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.75 bg-(--green-mid) rounded-t-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

        {/* Icon */}
        <div className="w-12 h-12 bg-(--green-pale) rounded-xl flex items-center justify-center text-[22px] mb-5 shrink-0">
          <Icon />
        </div>

        {/* Content */}
        <h3 className="font-serif text-[21px] font-semibold text-(--green-deep) mb-2.5">
          {service.title}
        </h3>
        <p className="text-[14px] text-(--text-muted) leading-relaxed font-light flex-1">
          {service.description}
        </p>

        {/* Link */}
        <Link
          href={service.href}
          className={cn(
            "mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium",
            "text-(--green-mid) transition-all duration-200",
            "group-hover:gap-2.5",
          )}
        >
          {service.linkText}
          <ArrowRight size={14} />
        </Link>

        {service.highlight && (
          <span className="absolute top-4 right-4 text-[10px] bg-(--green-deep)] text-white px-2.5 py-1 rounded-full font-medium tracking-wide">
            Popular
          </span>
        )}
      </div>
    </motion.div>
  );
}
