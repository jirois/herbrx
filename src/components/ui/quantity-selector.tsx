"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function QuantitySelector({
  value,
  min = 1,
  max = 99,
  onChange,
  size = "md",
  className,
}: QuantitySelectorProps) {
  const btnSize = {
    sm: "w-7 h-7 text-[12px]",
    md: "w-9 h-9 text-[14px]",
    lg: "w-11 h-11 text-[16px]",
  }[size];
  const numSize = {
    sm: "w-8 text-[13px]",
    md: "w-10 text-[15px]",
    lg: "w-12 text-[17px]",
  }[size];

  return (
    <div
      className={cn(
        "flex items-center border border-(--cream-dark) rounded-full overflow-hidden bg-white",
        className,
      )}
    >
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          btnSize,
          "flex items-center justify-center text-(--text-body) hover:bg-(--cream-dark) transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
        )}
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <span
        className={cn(
          numSize,
          "text-center font-medium text-(--text-dark) select-none",
        )}
      >
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          btnSize,
          "flex items-center justify-center text-(--text-body) hover:bg-(--cream-dark) transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
        )}
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
