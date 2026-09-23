import { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/api-helpers";
import { getPublishedPosts, getPublishedCategories } from "@/lib/blog";

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get("category") ?? undefined;
    const [posts, categories] = await Promise.all([
      getPublishedPosts(category),
      getPublishedCategories(),
    ]);
    return ok({ posts, categories });
  } catch (e) {
    return serverError(e);
  }
}
