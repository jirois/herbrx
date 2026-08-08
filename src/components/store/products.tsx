"use client";

import { useCallback, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard } from "./product-card";
import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { useStoreProducts } from "@/hooks/store-hooks";
import { useReviewSummaries } from "@/hooks/review-hooks";
import { cn } from "@/lib/utils";

export function Products() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
  });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const { data, loading } = useStoreProducts();
  const products = useMemo(() => data?.products ?? [], [data]);
  const { data: reviewData } = useReviewSummaries(products.map((p) => p.id));

  // Categories are producer-set free text, not a fixed static list — derive
  // the filter chips from whatever's actually live in the catalog.
  const productCategories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All Products", ...Array.from(set).sort()];
  }, [products]);

  const filtered =
    activeCategory === "All Products"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section
      className="bg-white border-t border-(--cream-dark) border-b py-20 lg:py-24"
      id="store"
    >
      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <SectionTitle
            tag="HerbRx Store"
            title="Verified Natural Products"
            subtitle="Every product in our store has passed our rigorous safety review process."
            className="mb-0"
          />
          <Button variant="outline" size="sm" href="/store">
            View All Products
          </Button>
        </div>

        {!loading && products.length > 0 && (
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
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-(--green-deep)" />
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-(--text-muted) text-[14px]">
              New products are on the way — check back soon.
            </p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <>
            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
              {filtered.slice(0, 8).map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  liveSummary={reviewData?.summaries[product.id] ?? null}
                />
              ))}
            </div>

            {/* Mobile carousel */}
            <div className="md:hidden">
              <div className="embla" ref={emblaRef}>
                <div
                  className="embla__container"
                  style={{ display: "flex", gap: "16px" }}
                >
                  {filtered.map((product, i) => (
                    <div
                      key={product.id}
                      className="embla__slide"
                      style={{ flex: "0 0 80%", minWidth: 0 }}
                    >
                      <ProductCard
                        product={product}
                        index={i}
                        liveSummary={reviewData?.summaries[product.id] ?? null}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={scrollPrev}
                  className="w-10 h-10 rounded-full border border-(--cream-dark) flex items-center justify-center hover:bg-(--green-deep) hover:text-white transition-all"
                  aria-label="Previous"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={scrollNext}
                  className="w-10 h-10 rounded-full border border-(--cream-dark) flex items-center justify-center hover:bg-(--green-deep) hover:text-white transition-all"
                  aria-label="Next"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

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
          </>
        )}
      </div>
    </section>
  );
}
