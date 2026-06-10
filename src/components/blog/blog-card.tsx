"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/data/blog";

interface BlogCardProps {
  post: BlogPost;
  index?: number;
  featured?: boolean;
}

export function BlogCard({ post, index = 0, featured = false }: BlogCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
    >
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <div className="bg-white rounded-2xl overflow-hidden border border-(--cream-dark) h-full flex flex-col hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(26,58,42,0.10)] transition-all duration-300">
          {/* Thumbnail */}
          <div
            className={cn(
              "flex items-center justify-center overflow-hidden relative",
              featured ? "h-70" : "h-50",
            )}
            style={{
              background: `linear-gradient(135deg, ${post.gradientFrom}, ${post.gradientTo})`,
            }}
          >
            <span
              className="text-[72px] select-none transition-transform duration-500 group-hover:scale-110"
              role="img"
              aria-label={post.title}
            >
              {post.emoji}
            </span>
            {/* Category pill */}
            <div className="absolute bottom-3 left-3">
              <span className="bg-white/20 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1 rounded-full tracking-wide">
                {post.category}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col flex-1">
            <h3
              className={cn(
                "font-serif font-semibold text-(--green-deep) leading-snug mb-2",
                featured ? "text-[22px]" : "text-[18px]",
              )}
            >
              {post.title}
            </h3>

            {featured && (
              <p className="text-[14px] text-(--text-muted) font-light leading-relaxed mb-4 flex-1">
                {post.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-(--cream-dark)">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-(--green-pale) flex items-center justify-center text-[10px] font-bold text-(--green-mid)">
                  {post.authorInitials}
                </div>
                <span className="text-[12px] text-(--text-muted)">
                  {new Date(post.date).toLocaleDateString("en-NG", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[12px] text-(--text-muted)">
                  <Clock size={11} />
                  {post.readTime} min
                </span>
                <span className="flex items-center gap-1 text-[12px] text-(--green-mid) font-medium group-hover:gap-2 transition-all">
                  Read <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
