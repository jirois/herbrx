"use client";

import { Star } from "lucide-react";
import type { ReviewSummary } from "@/hooks/review-hooks";

export function ReviewSummaryPanel({
  summary,
  loading,
}: {
  summary: ReviewSummary | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row gap-8 p-6 rounded-2xl bg-white border border-(--cream-dark) animate-pulse">
        <div className="w-32 h-24 bg-(--cream) rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={n} className="h-4 bg-(--cream) rounded" />
          ))}
        </div>
      </div>
    );
  }

  const count = summary?.count ?? 0;

  if (count === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-(--cream-dark) text-center">
        <p className="text-[15px] text-(--text-body) font-medium mb-1">
          No reviews yet
        </p>
        <p className="text-[13px] text-(--text-muted)">
          Be the first customer to share your experience with this product.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-8 p-6 rounded-2xl bg-white border border-(--cream-dark)">
      {/* Average */}
      <div className="flex flex-col items-center justify-center shrink-0 sm:w-32 sm:border-r sm:border-(--cream-dark) sm:pr-8">
        <p className="font-serif text-[44px] leading-none font-semibold text-(--green-deep)">
          {summary!.average.toFixed(1)}
        </p>
        <div className="flex items-center gap-0.5 my-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={14}
              className={
                s <= Math.round(summary!.average)
                  ? "fill-(--gold) text-(--gold)"
                  : "text-(--cream-dark) fill-(--cream-dark)"
              }
            />
          ))}
        </div>
        <p className="text-[12px] text-(--text-muted)">
          {count} review{count !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Breakdown bars */}
      <div className="flex-1 space-y-1.5">
        {(["5", "4", "3", "2", "1"] as const).map((star) => {
          const row = summary!.breakdown[star];
          return (
            <div key={star} className="flex items-center gap-2.5">
              <span className="text-[12px] text-(--text-muted) w-10 shrink-0 text-right">
                {star} star
              </span>
              <div className="flex-1 h-2 rounded-full bg-(--cream) overflow-hidden">
                <div
                  className="h-full rounded-full bg-(--gold)"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <span className="text-[12px] text-(--text-muted) w-16 shrink-0">
                {row.pct}% ({row.count})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
