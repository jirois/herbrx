import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-(--cream) flex items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-(--text-muted)">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
