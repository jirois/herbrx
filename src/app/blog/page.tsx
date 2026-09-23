import type { Metadata } from "next";
import { BlogListing } from "@/components/blog/blog-listing";
import { getPublishedPosts, getPublishedCategories } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog - Herbal Health Guides & Safety Reviews",
  description:
    "Evidence-based guides on Nigerian herbal medicine — safety reviews, herb profiles, consumer tips, and producer resources.",
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getPublishedPosts(),
    getPublishedCategories(),
  ]);
  return <BlogListing posts={posts} categories={categories} />;
}
