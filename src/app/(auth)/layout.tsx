import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {/* Subtle back link */}
      <div className="absolute top-5 left-6 z-10">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[13px] text-(--text-muted) hover:text-(--green-mid) transition-colors"
        >
          <ArrowLeft size={14} />
          Back to HerbRx
        </Link>
      </div>
      {children}
    </div>
  );
}
