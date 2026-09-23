import { prisma } from "@/lib/prisma";
import {
  blogPosts as staticBlogPosts,
  blogCategories as staticCategories,
  type BlogPost,
} from "@/data/blog";
import type { Prisma } from "@prisma/client";

// ── DB row -> public BlogPost view ─────────────────────────────────────
// The public blog UI (BlogCard, BlogPost, BlogListing) was built against
// the static src/data/blog.ts shape, so DB rows are mapped into that same
// shape here rather than changing every consumer component.

const AUTHOR_GRADIENTS: [string, string][] = [
  ["#2D5A3D", "#4A7C59"],
  ["#B8832A", "#D4A85C"],
  ["#4A7C59", "#2D5A3D"],
  ["#C8DABB", "#4A7C59"],
  ["#C2DDD5", "#9BCABB"],
  ["#F5C4C4", "#E8A0A0"],
];

function gradientFor(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AUTHOR_GRADIENTS[hash % AUTHOR_GRADIENTS.length];
}

function initials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "HX";
}

type DbPostWithAuthor = Prisma.BlogPostGetPayload<{
  include: { author: { select: { firstName: true; lastName: true } } };
}>;

function toView(row: DbPostWithAuthor): BlogPost {
  const [gradientFrom, gradientTo] = gradientFor(row.category || row.slug);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    author: `${row.author.firstName} ${row.author.lastName}`.trim(),
    authorRole: row.authorTitle ?? "HerbRx Writer",
    authorInitials: initials(row.author.firstName, row.author.lastName),
    date: (row.publishedAt ?? row.createdAt).toISOString(),
    readTime: row.readTime,
    emoji: "🌿",
    imageUrl: row.imageUrl ?? undefined,
    gradientFrom,
    gradientTo,
    featured: row.featured,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
  };
}

const authorSelect = { select: { firstName: true, lastName: true } } as const;

// Falls back to the static seed data if the BlogPost table isn't
// migrated yet, or the DB is briefly unreachable — the public site
// should never hard-fail because a migration hasn't been run.
async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error("[blog] DB query failed, using static fallback:", e);
    return fallback;
  }
}

export async function getPublishedPosts(category?: string): Promise<BlogPost[]> {
  return safeQuery(async () => {
    const rows = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        ...(category && category !== "All" ? { category } : {}),
      },
      include: { author: authorSelect },
      orderBy: { publishedAt: "desc" },
    });
    return rows.map(toView);
  }, category && category !== "All"
    ? staticBlogPosts.filter((p) => p.category === category)
    : staticBlogPosts);
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return safeQuery(async () => {
    const row = await prisma.blogPost.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: { author: authorSelect },
    });
    return row ? toView(row) : undefined;
  }, staticBlogPosts.find((p) => p.slug === slug));
}

export async function getFeaturedPublishedPost(): Promise<BlogPost | undefined> {
  return safeQuery(async () => {
    const row = await prisma.blogPost.findFirst({
      where: { status: "PUBLISHED", featured: true },
      include: { author: authorSelect },
      orderBy: { publishedAt: "desc" },
    });
    return row ? toView(row) : undefined;
  }, staticBlogPosts.find((p) => p.featured));
}

export async function getRecentPublishedPosts(limit = 3, excludeSlug?: string): Promise<BlogPost[]> {
  return safeQuery(async () => {
    const rows = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        ...(excludeSlug ? { slug: { not: excludeSlug } } : {}),
      },
      include: { author: authorSelect },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
    return rows.map(toView);
  }, staticBlogPosts.filter((p) => p.slug !== excludeSlug).slice(0, limit));
}

/** Newest published post, for the homepage hero's "New Post Published" card. */
export async function getLatestPublishedPost(): Promise<BlogPost | undefined> {
  const [latest] = await getRecentPublishedPosts(1);
  return latest;
}

export async function getPublishedCategories(): Promise<string[]> {
  return safeQuery(async () => {
    const rows = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { category: true },
      distinct: ["category"],
    });
    return ["All", ...rows.map((r) => r.category)];
  }, staticCategories);
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  return safeQuery(async () => {
    const rows = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  }, staticBlogPosts.map((p) => p.slug));
}
