import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  light?: boolean;
  className?: string;
}

export function Logo({ light = false, className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 group", className)}
      aria-label="HerbRx — go to homepage"
    >
      {/* Icon mark */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          "font-serif italic font-semibold text-[17px] transition-transform duration-300",
          "group-hover:scale-105",
          light
            ? "bg-white/15 text-white border border-white/20"
            : "bg-(--green-deep) text-white",
        )}
      >
        Hx
      </div>

      {/* Word mark */}
      <div className="leading-none">
        <span
          className={cn(
            "block font-serif font-semibold text-[22px] tracking-[0.01em]",
            light ? "text-white" : "text-(--green-deep)",
          )}
        >
          HerbRx
        </span>
        <span
          className={cn(
            "block font-sans font-normal text-[10px] tracking-[0.14em] uppercase mt-0.5",
            light ? "text-white/40" : "text-(--text-muted)",
          )}
        >
          Natural Wellness
        </span>
      </div>
    </Link>
  );
}
