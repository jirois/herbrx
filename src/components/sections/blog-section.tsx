import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { SectionTitle } from "@/components/ui/section-title";
import { getFeaturedPublishedPost, getRecentPublishedPosts } from "@/lib/blog";

export async function BlogSection() {
  const featured = await getFeaturedPublishedPost();
  const recent = await getRecentPublishedPosts(2, featured?.slug);

  return (
    <section className="bg-(--cream) py-20 lg:py-24">
      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-14">
          <SectionTitle
            tag="From the Blog"
            title="Latest Articles"
            subtitle="Evidence-based herbal health guides written for Nigerians."
            className="mb-0"
          />
          <Link
            href="/blog"
            className="flex items-center gap-1.5 text-[14px] font-medium text-(--green-mid) hover:gap-3 transition-all"
          >
            View all articles <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr] gap-6">
          {featured && <BlogCard post={featured} featured index={0} />}
          {recent.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
