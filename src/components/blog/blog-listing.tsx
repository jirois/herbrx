"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BlogCard } from "./blog-card";
import { blogPosts, blogCategories, getFeaturedPost } from "@/data/blog";
import { cn } from "@/lib/utils";

export function BlogListing() {
  const [activeCategory, setActiveCategory] = useState("All");
  const featured = getFeaturedPost();

  const filtered =
    activeCategory === "All"
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-(--cream)">
      {/* Header */}
      <div className="bg-(--green-deep) py-16">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
          <p className="text-(--gold-light) text-[12px] uppercase tracking-[0.15em] font-medium mb-3">
            From the Blog
          </p>
          <h1 className="font-serif text-[clamp(32px,4vw,52px)] text-white font-medium mb-3">
            Herbal Health Guides
          </h1>
          <p className="text-white/55 text-[16px] font-light max-w-120">
            Evidence-based articles on Nigerian herbal medicine — for consumers,
            patients, and producers.
          </p>
        </div>
      </div>

      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 py-12">
        {/* Featured post */}
        {featured && activeCategory === "All" && (
          <div className="mb-12">
            <p className="text-[11px] uppercase tracking-[0.15em] text-(--text-muted) font-medium mb-4">
              Featured Article
            </p>
            <BlogCard post={featured} featured index={0} />
          </div>
        )}

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {blogCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-[13px] border transition-all duration-200",
                activeCategory === cat
                  ? "bg-(--green-deep) text-white border-(--green-deep)"
                  : "bg-white text-(--text-muted) border-(--cream-dark) hover:border-(--green-mid) hover:text-(--green-mid)",
              )}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto self-center text-[13px] text-(--text-muted)">
            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered
              .filter((p) => !(activeCategory === "All" && p.featured))
              .map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} />
              ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
