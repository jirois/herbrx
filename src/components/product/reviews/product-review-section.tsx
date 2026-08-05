"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useProductReviews } from "@/hooks/review-hooks";
import type { ReviewSort } from "@/hooks/review-hooks";
import { ReviewSummaryPanel } from "./review-summary";
import { ReviewFilterBar } from "./review-filter-bar";
import { ReviewList } from "./review-list";
import { ReviewForm } from "./review-form";

export function ProductReviewsSection({ productId }: { productId: string }) {
  const { status } = useSession();
  const [stars, setStars] = useState<number | null>(null);
  const [sort, setSort] = useState<ReviewSort>("recent");

  const { data, loading, mutate } = useProductReviews(productId, {
    stars,
    sort,
  });

  return (
    <div className="bg-white rounded-2xl border border-(--cream-dark) p-8 mb-16">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="font-serif text-[24px] font-semibold text-(--green-deep)">
          Customer Reviews
        </h2>
        <ReviewForm productId={productId} onSubmitted={mutate} />
      </div>

      <ReviewSummaryPanel
        summary={data?.summary ?? null}
        loading={loading && !data}
      />

      <ReviewFilterBar
        summary={data?.summary ?? null}
        activeStars={stars}
        onStarsChange={setStars}
        sort={sort}
        onSortChange={setSort}
      />

      <ReviewList
        reviews={data?.reviews ?? []}
        loggedIn={status === "authenticated"}
        loading={loading}
      />
    </div>
  );
}
