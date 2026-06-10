import type { Metadata } from "next";
import { BlogListing } from "@/components/blog/blog-listing";

export const metadata: Metadata = {
  title: "Blog — Herbal Health Guides & Safety Reviews",
  description:
    "Evidence-based guides on Nigerian herbal medicine — safety reviews, herb profiles, consumer tips, and producer resources.",
};

export default function BlogPage() {
  return <BlogListing />;
}
