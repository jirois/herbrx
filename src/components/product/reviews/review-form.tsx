"use client";

import { useState } from "react";
import { Star, Loader2, Lock, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useReviewEligibility, submitReview } from "@/hooks/review-hooks";
import {
  required,
  minLength,
  maxLength,
  collectErrors,
  hasErrors,
} from "@/lib/vaildation";
import { useToast } from "@/context/toast-context";

type ExistingReview = {
  rating: number;
  title: string;
  body: string;
};

type ReviewFormFieldsProps = {
  productId: string;
  existingReview?: ExistingReview | null;
  onSubmitted: () => void;
  closeForm: () => void;
};

function ReviewFormFields({
  productId,
  existingReview,
  onSubmitted,
  closeForm,
}: ReviewFormFieldsProps) {
  const { success, error: toastError } = useToast();
  const isEditing = !!existingReview;

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const errors = collectErrors({
    rating: rating < 1 ? "Select a star rating." : null,
    title:
      required(title, "Review title") ?? maxLength(title, 120, "Review title"),
    body:
      required(body, "Review") ??
      minLength(body, 10, "Review") ??
      maxLength(body, 5000, "Review"),
  });
  const showError = (f: string) =>
    touched[f] || submitAttempted ? errors[f] : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hasErrors(errors)) {
      setSubmitAttempted(true);
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({
        productId,
        rating,
        title: title.trim(),
        body: body.trim(),
      });
      success(
        isEditing
          ? "Your review was updated."
          : "Thanks — your review is live!",
      );
      closeForm();
      setSubmitAttempted(false);
      onSubmitted();
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "string"
            ? e
            : "Failed to submit your review.";
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 rounded-2xl bg-white border border-(--cream-dark) space-y-4"
    >
      <p className="text-[14px] font-semibold text-(--green-deep)">
        {isEditing ? "Edit Your Review" : "Write a Review"}
      </p>

      <div>
        <label className="block text-[12px] font-medium text-(--text-muted) mb-1.5">
          Your Rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              onBlur={() => setTouched((t) => ({ ...t, rating: true }))}
              className="p-0.5"
            >
              <Star
                size={24}
                className={
                  s <= (hoverRating || rating)
                    ? "fill-(--gold) text-(--gold)"
                    : "text-(--cream-dark) fill-(--cream-dark)"
                }
              />
            </button>
          ))}
        </div>
        {showError("rating") && (
          <p className="text-[11px] text-red-500 mt-1">{errors.rating}</p>
        )}
      </div>

      <div>
        <label className="block text-[12px] font-medium text-(--text-muted) mb-1.5">
          Review Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, title: true }))}
          placeholder="Sum up your experience"
          className={`w-full h-10 px-3.5 bg-(--cream)/40 border rounded-xl text-[14px] outline-none focus:border-(--green-mid) transition-colors ${
            showError("title") ? "border-red-400" : "border-(--cream-dark)"
          }`}
        />
        {showError("title") && (
          <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-[12px] font-medium text-(--text-muted) mb-1.5">
          Your Review
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, body: true }))}
          rows={4}
          placeholder="What did you like or dislike? How did it work for you?"
          className={`w-full px-3.5 py-3 bg-(--cream)/40 border rounded-xl text-[14px] outline-none focus:border-(--green-mid) transition-colors resize-none ${
            showError("body") ? "border-red-400" : "border-(--cream-dark)"
          }`}
        />
        {showError("body") && (
          <p className="text-[11px] text-red-500 mt-1">{errors.body}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 text-[13px] font-medium px-5 py-2.5 rounded-full bg-(--green-deep) text-white hover:bg-(--green-mid) transition-colors disabled:opacity-60"
        >
          {submitting && <Loader2 size={13} className="animate-spin" />}
          {isEditing ? "Update Review" : "Submit Review"}
        </button>
        {!isEditing && (
          <button
            type="button"
            onClick={closeForm}
            className="text-[13px] text-(--text-muted) hover:text-[(--text-body)]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId: string;
  onSubmitted: () => void;
}) {
  const { status } = useSession();
  const { data, loading } = useReviewEligibility(productId);
  const [open, setOpen] = useState(false);

  if (loading || status === "loading") return null;

  if (status !== "authenticated" || !data?.loggedIn) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-(--cream-dark)">
        <Lock size={16} className="text-(--text-muted) shrink-0" />
        <p className="text-[13px] text-(--text-body)">
          <Link
            href="/login"
            className="font-medium text-(--green-mid) hover:underline"
          >
            Log in
          </Link>{" "}
          to write a review — only verified purchasers can review this product.
        </p>
      </div>
    );
  }

  if (!data.hasVerifiedPurchase) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-(--cream-dark)">
        <ShoppingBag size={16} className="text-(--text-muted) shrink-0" />
        <p className="text-[13px] text-(--text-body)">
          Reviews are limited to customers who&apos;ve purchased this product.
          Buy it to share your experience once it arrives.
        </p>
      </div>
    );
  }

  const existingReview = data?.existingReview;
  const isEditing = !!existingReview;

  if (!open && !isEditing) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[13px] font-medium px-4 py-2.5 rounded-full border border-(--green-mid) text-(--green-mid) hover:bg-(--green-mid) hover:text-white transition-colors"
      >
        Write a Review
      </button>
    );
  }

  return (
    <ReviewFormFields
      key={existingReview ? "editing" : "new"}
      productId={productId}
      existingReview={existingReview}
      onSubmitted={onSubmitted}
      closeForm={() => setOpen(false)}
    />
  );
}
