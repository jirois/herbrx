"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ChevronRight, ArrowLeft, Tag } from "lucide-react";
import { BlogCard } from "./blog-card";
import { BlogImage } from "@/components/ui/blog-image";
import { renderMarkdownLite } from "@/lib/render-content";
import type { BlogPost as BlogPostType } from "@/data/blog";

interface Props {
  post: BlogPostType;
  /** Other published posts to show under "More Articles" — fetched
   * server-side from the DB so it reflects real published content
   * rather than the static seed list. */
  related?: BlogPostType[];
}

export function BlogPost({ post, related = [] }: Props) {
  return (
    <div className="min-h-screen bg-(--cream)">
      {/* Hero — cover image as a full-bleed background behind the title */}
      <div className="relative min-h-110 lg:min-h-130 flex flex-col justify-end overflow-hidden">
        {post.imageUrl ? (
          <>
            <BlogImage
              src={post.imageUrl}
              emoji={post.emoji}
              alt={post.title}
              className="absolute inset-0"
              priority
            />
            {/* Scrim so white text stays legible over any photo */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/10" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${post.gradientFrom}, ${post.gradientTo})`,
            }}
          >
            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
          </div>
        )}

        <div className="relative z-10 max-w-(--max-width) mx-auto px-6 lg:px-10 pb-10 pt-24 w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[13px] text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={13} />
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog
            </Link>
            <ChevronRight size={13} />
            <span className="text-white/90 truncate max-w-50">
              {post.category}
            </span>
          </div>

          <div className="max-w-180">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[11px] px-3 py-1 rounded-full tracking-wide font-medium mb-5">
              {post.category}
            </span>
            <h1 className="font-serif text-[clamp(26px,4vw,44px)] font-medium text-white leading-[1.15] mb-5 [text-shadow:0_2px_16px_rgba(0,0,0,0.35)]">
              {post.title}
            </h1>
            <p className="text-white/80 text-[16px] font-light leading-relaxed mb-7 max-w-150">
              {post.excerpt}
            </p>

            {/* Author + meta */}
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-white/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-[11px] font-bold text-white">
                  {post.authorInitials}
                </div>
                <div>
                  <span className="text-white font-medium">{post.author}</span>
                  <span className="ml-1.5">· {post.authorRole}</span>
                </div>
              </div>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {post.readTime} min read
              </span>
              <span>
                {new Date(post.date).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 py-12">
        <div className="grid lg:grid-cols-[1fr_280px] gap-12">
          {/* Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="bg-white rounded-2xl border border-(--cream-dark) p-8 lg:p-12 mb-8 prose-custom">
              {renderMarkdownLite(post.content)}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <Tag size={14} className="text-(--text-muted)" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-(--green-pale)/60 text-(--green-mid) text-[12px] px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[14px] text-(--text-muted) hover:text-(--green-mid) transition-colors"
            >
              <ArrowLeft size={15} />
              Back to Blog
            </Link>
          </motion.article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Author card */}
              <div className="bg-white rounded-2xl border border-(--cream-dark) p-5">
                <p className="text-[11px] uppercase tracking-widest text-(--text-muted) font-medium mb-4">
                  About the Author
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-(--green-pale) flex items-center justify-center font-serif text-[17px] font-semibold text-(--green-mid) shrink-0">
                    {post.authorInitials}
                  </div>
                  <div>
                    <p className="font-medium text-[15px] text-(--text-dark)">
                      {post.author}
                    </p>
                    <p className="text-[12px] text-(--text-muted)">
                      {post.authorRole}
                    </p>
                  </div>
                </div>
                <p className="text-[13px] text-(--text-muted) font-light leading-relaxed">
                  Our team of herbal pharmacists and health journalists provide
                  evidence-based guidance grounded in Nigerian herbal tradition.
                </p>
              </div>

              {/* Newsletter mini */}
              <div className="bg-(--green-deep) rounded-2xl p-5 text-white">
                <p className="font-serif text-[17px] font-semibold mb-2">
                  Stay Informed
                </p>
                <p className="text-[13px] text-white/60 font-light mb-4 leading-relaxed">
                  Get new articles, safety alerts, and product reviews in your
                  inbox.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-3 py-2 text-[13px] text-white placeholder:text-white/40 outline-none focus:border-white/50 min-w-0"
                  />
                  <button className="bg-(--gold) text-white text-[12px] font-medium px-4 py-2 rounded-full hover:bg-(--gold-light) transition-colors whitespace-nowrap shrink-0">
                    Join
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-[26px] font-semibold text-[(--green-deep) mb-8">
              More Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p, i) => (
                <BlogCard key={p.id} post={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
