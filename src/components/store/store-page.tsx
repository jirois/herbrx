"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { ProductCard } from "./product-card";
import { useStoreProducts } from "@/hooks/store-hooks";
import { useReviewSummaries } from "@/hooks/review-hooks";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

type StoreProduct = NonNullable<
  ReturnType<typeof useStoreProducts>["data"]
>["products"][number];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

export function StorePage() {
  const [category, setCategory] = useState("All Products");
  const [sort, setSort] = useState<SortOption>("featured");
  const [query, setQuery] = useState("");
  const { data, loading, error } = useStoreProducts();
  const products = useMemo(() => data?.products ?? [], [data]);
  const { data: reviewData } = useReviewSummaries(products.map((p) => p.id));

  // Categories are producer-set free text now, not a fixed static list —
  // derive the filter list from whatever's actually in the live catalog.
  const productCategories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All Products", ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (category !== "All Products") {
      result = result.filter((p) => p.category === category);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(q)),
      );
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort(
          (a, b) =>
            (reviewData?.summaries[b.id]?.average ?? 0) -
            (reviewData?.summaries[a.id]?.average ?? 0),
        );
        break;
      case "newest":
        // API already returns newest-first; nothing further to sort by.
        break;
      case "featured":
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [products, category, sort, query, reviewData]);

  return (
    <div className="min-h-screen bg-(--cream)">
      {/* Page header */}
      <div className="bg-(--green-deep) py-16">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <p className="text-(--gold-light) text-[12px] uppercase tracking-[0.15em] font-medium mb-3">
            HerbRx Store
          </p>
          <h1 className="font-serif text-[clamp(32px,4vw,52px)] text-white font-medium mb-3">
            Verified Natural Products
          </h1>
          <p className="text-white/55 text-[16px] font-light max-w-120">
            Every product independently reviewed for safety. No sponsorships. No
            bias.
          </p>
        </div>
      </div>

      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 py-10">
        {/* Controls bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-50 max-w-85">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2.5 rounded-full border border-(--cream-dark) bg-white text-[14px] text-(--text-dark) placeholder:text-(--text-muted) outline-none focus:border-(--green-mid) transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-dark)"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-4 py-2.5 rounded-full border border-(--cream-dark) bg-white text-[14px] text-(--text-body)] outline-none focus:border-(--green-mid) transition-colors cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <span className="text-[13px] text-(--text-muted) ml-auto">
            {loading
              ? "Loading…"
              : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        <div className="flex gap-8">
          {/* Sidebar categories — desktop */}
          <aside className="hidden lg:block w-52 shrink-0">
            <p className="text-[11px] uppercase tracking-[0.12em] text-(--text-muted) font-medium mb-4">
              Categories
            </p>
            <nav className="space-y-1">
              {productCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "w-full text-left px-3.5 py-2.5 rounded-xl text-[14px] transition-all duration-200",
                    category === cat
                      ? "bg-(--green-deep) text-white font-medium"
                      : "text-(--text-body) hover:bg-(--green-pale)/40 hover:text-(--green-deep)",
                  )}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </aside>

          {/* Mobile pill filters */}
          <div className="lg:hidden flex gap-2 flex-wrap mb-6 w-full">
            {productCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[13px] border transition-all",
                  category === cat
                    ? "bg-(--green-deep) text-white border-(--green-deep)"
                    : "border-(--cream-dark) text-(--text-muted) hover:border-(--green-deep)",
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <div className="text-center py-24 text-(--text-muted)">
                <Loader2 size={22} className="animate-spin inline-block mr-2" />{" "}
                Loading products…
              </div>
            ) : error ? (
              <div className="text-center py-24">
                <p className="text-(--text-muted) text-[14px]">
                  Couldn&apos;t load products. Please refresh.
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.length > 0 ? (
                  <motion.div
                    key={`${category}-${sort}-${query}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                  >
                    {filtered.map((product, i) => (
                      <ProductCard
                        key={product.id}
                        product={product as Product}
                        index={i}
                        liveSummary={reviewData?.summaries[product.id] ?? null}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24"
                  >
                    <div className="text-[48px] mb-4">🔍</div>
                    <h3 className="font-serif text-[22px] text-(--green-deep) mb-2">
                      No products found
                    </h3>
                    <p className="text-(--text-muted) text-[14px] mb-6">
                      Try adjusting your search or filters
                    </p>
                    <button
                      onClick={() => {
                        setQuery("");
                        setCategory("All Products");
                      }}
                      className="text-(--green-mid) font-medium text-[14px] hover:underline"
                    >
                      Clear all filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
