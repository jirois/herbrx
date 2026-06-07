"use client";

import { useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard } from "./product-card";
import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { products, productCategories } from "@/data/products";
import { cn } from "@/lib/utils";

export function Products() {
  const [activeCategory, setActiveCategory] = useState("All Products");

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const filtered =
    activeCategory === "All Products"
      ? products
      : products.filter((p) => {
          const map: Record<string, string[]> = {
            "Teas & Blends": ["Tea", "Blend", "Loose"],
            Capsules: ["Capsule"],
            Tinctures: ["Tincture"],
            Topical: ["Topical", "Bar", "Balm", "Soap"],
            Supplements: ["Supplement"],
          };
          const keywords = map[activeCategory] ?? [];
          return keywords.some((kw) =>
            p.type.toLowerCase().includes(kw.toLowerCase()),
          );
        });

  return (
    <section
      className="bg-white border-t border-(--cream-dark) border-b py-20 lg:py-24"
      id="store"
    >
      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
        {/* Header row */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <SectionTitle
            tag="HerbRx Store"
            title="Verified Natural Products"
            subtitle="Every product in our store has passed our rigorous safety review process."
            className="mb-0"
          />
          <Button
            variant="outline"
            size="sm"
            href="/store"
            className="shrink-0"
          >
            View All Products
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {productCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-[13px] transition-all duration-200 border",
                activeCategory === cat
                  ? "bg-(--green-deep) text-white border-(--green-deep)"
                  : "bg-transparent text-(--text-muted) border-(--cream-dark) hover:bg-(--green-deep) hover:text-white hover:border-(--green-deep)",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.slice(0, 8).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* Mobile embla carousel */}
        <div className="md:hidden">
          <div className="embla" ref={emblaRef}>
            <div className="embla__container gap-4" style={{ display: "flex" }}>
              {filtered.map((product, i) => (
                <div
                  key={product.id}
                  className="embla__slide"
                  style={{ flex: "0 0 80%", minWidth: 0 }}
                >
                  <ProductCard product={product} index={i} />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel controls */}
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={scrollPrev}
              className="w-10 h-10 rounded-full border border-(--cream-dark) flex items-center justify-center hover:bg-(--green-deep) hover:text-white hover:border-(--green-deep) transition-all"
              aria-label="Previous products"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={scrollNext}
              className="w-10 h-10 rounded-full border border-(--cream-dark) flex items-center justify-center hover:bg-(--green-deep) hover:text-white hover:border-(--green-deep) transition-all"
              aria-label="Next products"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" href="/store">
            Browse All {products.length}+ Products
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
