"use client";

import { Star } from "lucide-react";
import type { ReviewSort, ReviewSummary } from "@/hooks/review-hooks";

export function ReviewFilterBar({
  summary,
  activeStars,
  onStarsChange,
  sort,
  onSortChange,
}: {
  summary: ReviewSummary | null;
  activeStars: number | null;
  onStarsChange: (stars: number | null) => void;
  sort: ReviewSort;
  onSortChange: (sort: ReviewSort) => void;
}) {
  if (!summary || summary.count === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 border-b border-(--cream-dark)">
      {/* Star filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onStarsChange(null)}
          className={`text-[12px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
            activeStars === null
              ? "bg-(--green-deep) border-(--green-deep) text-white"
              : "bg-white border-(--cream-dark) text-(--text-body) hover:border-(--green-mid)"
          }`}
        >
          All ({summary.count})
        </button>
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const row =
            summary.breakdown[String(star) as "5" | "4" | "3" | "2" | "1"];
          const active = activeStars === star;
          return (
            <button
              key={star}
              onClick={() => onStarsChange(active ? null : star)}
              disabled={row.count === 0}
              className={`flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                active
                  ? "bg-(--green-deep) border-(--green-deep) text-white"
                  : "bg-white border-(--cream-dark) text-(--text-body) hover:border-(--green-mid)"
              }`}
            >
              {star}{" "}
              <Star
                size={11}
                className={
                  active
                    ? "fill-white text-white"
                    : "fill-(--gold) text-(--gold)"
                }
              />
              <span
                className={active ? "text-white/70" : "text-(--text-muted)"}
              >
                ({row.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <label className="text-[12px] text-(--text-muted)">Sort by</label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as ReviewSort)}
          className="text-[12px] font-medium bg-white border border-(--cream-dark) rounded-lg px-2.5 py-1.5 outline-none cursor-pointer focus:border-(--green-mid)"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Highest Helpful Count</option>
        </select>
      </div>
    </div>
  );
}
