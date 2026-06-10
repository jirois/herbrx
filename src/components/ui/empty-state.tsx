import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({
  emoji = "🌿",
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-20 px-6",
        className,
      )}
    >
      <div
        className="text-[64px] mb-5 select-none"
        role="img"
        aria-hidden="true"
      >
        {emoji}
      </div>
      <h3 className="font-serif text-[24px] font-semibold text-(--green-deep) mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-[15px] text-(--text-muted) font-light max-w-90 leading-relaxed mb-8">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button variant="primary" size="lg" href={action.href}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" size="lg" href={secondaryAction.href}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
