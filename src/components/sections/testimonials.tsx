"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionTitle } from "@/components/ui/section-title";
import { testimonials } from "@/data/services";

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="bg-(--cream-dark) py-20 lg:py-24">
      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-14">
          <SectionTitle
            tag="Testimonials"
            title="Real People. Real Impact."
            subtitle="Hear from those who've trusted HerbRx for guidance, safety, and support."
            className="mb-0"
          />

          {/* Desktop carousel nav */}
          <div className="hidden lg:flex gap-2">
            <button
              onClick={scrollPrev}
              className="w-10 h-10 rounded-full border border-(--cream-dark) bg-white flex items-center justify-center hover:bg-(--green-deep) hover:text-white hover:border-(--green-deep) transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={scrollNext}
              className="w-10 h-10 rounded-full border border-(--cream-dark) bg-white flex items-center justify-center hover:bg-(--green-deep) hover:text-white hover:border-(--green-deep) transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="embla lg:overflow-visible" ref={emblaRef}>
          <div
            className="embla__container"
            style={{ display: "flex", gap: "24px" }}
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                className="embla__slide"
                style={{ flex: "0 0 min(340px, 85vw)", minWidth: 0 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="bg-white rounded-2xl p-8 border border-white/50 h-full flex flex-col">
                  {/* Quote mark */}
                  <div className="font-serif text-[56px] text-(--green-pale) leading-[0.8] mb-4 select-none">
                    &quot;
                  </div>

                  <blockquote className="font-serif text-[16px] text-[(--text-body) leading-relaxed italic flex-1 mb-6">
                    {t.quote}
                  </blockquote>

                  <div className="flex items-center gap-3 border-t border-(--cream-dark) pt-5">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-serif text-[16px] font-semibold shrink-0"
                      style={{ background: t.avatarBg, color: t.avatarColor }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div className="font-medium text-[14px] text-(--text-dark)">
                        {t.author},{" "}
                        <span className="text-(--text-muted)">
                          {t.location}
                        </span>
                      </div>
                      <div className="text-[12px] text-(--text-muted)">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
