import { cn } from "@/lib/utils";

interface SectionTitleProps {
  tag?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  light?: boolean;
  className?: string;
  titleClassName?: string;
}

export function SectionTitle({
  tag,
  title,
  subtitle,
  align = "left",
  light = false,
  className,
  titleClassName,
}: SectionTitleProps) {
  const alignClass = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right ml-auto",
  }[align];

  return (
    <div className={cn("mb-14", alignClass, className)}>
      {tag && (
        <span
          className={cn(
            "inline-block text-[11px] font-medium tracking-[0.15em] uppercase rounded-full px-3.5 py-1 mb-3",
            light
              ? "bg-white/10 text-(--gold-light)"
              : "bg-(--green-pale) text-(--green-mid)",
          )}
        >
          {tag}
        </span>
      )}
      <h2
        className={cn(
          "font-serif font-medium mb-4",
          "text-[clamp(28px,3.5vw,44px)] leading-[1.15]",
          light ? "text-white" : "text-(--green-deep)",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "text-[16px] leading-relaxed font-light max-w-130",
            light ? "text-white/55" : "text-(--text-muted)",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
