import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium tracking-wide rounded-full transition-colors",
  {
    variants: {
      variant: {
        gold: "bg-[#F5E8CE] text-[var(--gold)] text-[10px] px-3 py-1",
        green:
          "bg-[var(--green-pale)] text-[var(--green-mid)] text-[10px] px-3 py-1",
        teal: "bg-[#C2DDD5] text-[#1A6B5A] text-[10px] px-3 py-1",
        dark: "bg-[var(--green-deep)] text-white text-[10px] px-3 py-1",
        outline:
          "border border-[var(--cream-dark)] text-[var(--text-muted)] text-[11px] px-3 py-1",
        pill: "bg-[var(--green-pale)]/60 text-[var(--green-mid)] text-[11px] px-3 py-1.5 uppercase tracking-[0.12em]",
      },
      size: {
        sm: "text-[10px] px-2.5 py-0.5",
        md: "text-[11px] px-3 py-1",
        lg: "text-[12px] px-4 py-1.5",
      },
    },
    defaultVariants: {
      variant: "green",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            background:
              variant === "gold"
                ? "var(--gold)"
                : variant === "teal"
                  ? "#1A6B5A"
                  : "var(--green-mid)",
          }}
        />
      )}
      {children}
    </span>
  );
}
