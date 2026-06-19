import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyEmailContent } from "@/components/auth/verify-email";

export const metadata: Metadata = { title: "Verify Your Email — HerbRx" };

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-(--cream) flex items-center justify-center px-4 py-16">
      <Suspense
        fallback={
          <div className="text-(--text-muted) text-[15px]">Loading…</div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
