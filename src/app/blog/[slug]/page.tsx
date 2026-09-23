import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPublishedPostBySlug,
  getAllPublishedSlugs,
  getRecentPublishedPosts,
} from "@/lib/blog";
import { BlogPost } from "@/components/blog/blog-post";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();
  const related = await getRecentPublishedPosts(3, slug);
  return <BlogPost post={post} related={related} />;
}
