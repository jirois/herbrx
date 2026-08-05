"use client";

import { useState } from "react";
import { Star, ShieldCheck, ThumbsUp, Loader2 } from "lucide-react";
import type { ReviewItem } from "@/hooks/review-hooks";
import { toggleReviewHelpful } from "@/hooks/review-hooks";
import { useToast } from "@/context/toast-context";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function ReviewCard({
  review,
  loggedIn,
}: {
  review: ReviewItem;
  loggedIn: boolean;
}) {
  const [helpful, setHelpful] = useState(review.markedHelpful);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [voting, setVoting] = useState(false);
  const { error: toastError } = useToast();

  async function handleHelpful() {
    if (!loggedIn) {
      toastError("Log in to mark reviews as helpful.");
      return;
    }
    if (review.isOwnReview || voting) return;
    setVoting(true);
    try {
      const res = await toggleReviewHelpful(review.id);
      setHelpful(res.helpful);
      setHelpfulCount(res.helpfulCount);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      toastError(message);
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="py-5 border-b border-(--cream-dark) last:border-0">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={13}
              className={
                s <= review.rating
                  ? "fill-(--gold) text-(--gold)"
                  : "text-(--cream-dark) fill-(--cream-dark)"
              }
            />
          ))}
        </div>
        {review.verifiedPurchase && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-(--green-mid)">
            <ShieldCheck size={11} /> Verified Purchase
          </span>
        )}
      </div>
      <p className="text-[14px] font-semibold text-(--green-deep) mb-1">
        {review.title}
      </p>
      <p className="text-[13px] text-(--text-body) leading-relaxed font-light mb-2.5 whitespace-pre-wrap">
        {review.body}
      </p>
      <div className="flex items-center gap-4">
        <span className="text-[12px] text-(--text-muted)">
          {review.reviewerName} · {timeAgo(review.createdAt)}
        </span>
        {!review.isOwnReview && (
          <button
            onClick={handleHelpful}
            disabled={voting}
            className={`inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors disabled:opacity-50 ${
              helpful
                ? "text-(--green-deep)"
                : "text-(--text-muted) hover:text-(--green-mid)"
            }`}
          >
            {voting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <ThumbsUp
                size={12}
                className={helpful ? "fill-(--green-deep)" : ""}
              />
            )}
            Helpful{helpfulCount > 0 ? ` (${helpfulCount})` : ""}
          </button>
        )}
      </div>
    </div>
  );
}

export function ReviewList({
  reviews,
  loggedIn,
  loading,
}: {
  reviews: ReviewItem[];
  loggedIn: boolean;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-5 py-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-3 w-24 bg-(--cream) rounded" />
            <div className="h-4 w-1/2 bg-(--cream) rounded" />
            <div className="h-10 bg-(--cream) rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] text-(--text-muted)">
        No reviews match this filter.
      </p>
    );
  }

  return (
    <div>
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} loggedIn={loggedIn} />
      ))}
    </div>
  );
}
