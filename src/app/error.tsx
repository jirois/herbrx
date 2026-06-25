"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to your error tracking service here (e.g. Sentry)
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-(--cream) flex items-center justify-center px-6">
      <div className="text-center max-w-105">
        <div className="text-[64px] mb-5">⚠️</div>
        <h2 className="font-serif text-[28px] font-semibold text-(--green-deep) mb-3">
          Something went wrong
        </h2>
        <p className="text-[15px] text-(--text-muted) font-light mb-8 leading-relaxed">
          An unexpected error occurred. Please try again, or contact us if the
          problem persists.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="primary" size="lg" onClick={reset}>
            Try Again
          </Button>
          <Button variant="outline" size="lg" href="/">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
