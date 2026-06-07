"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium tracking-wide transition-all duration-200",
    "rounded-full cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:pointer-events-none",
    "active:scale-[0.97]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--green-deep)] text-white",
          "hover:bg-[var(--green-mid)]",
          "focus-visible:ring-[var(--green-mid)]",
        ],
        secondary: [
          "bg-[var(--gold)] text-white",
          "hover:bg-[var(--gold-light)]",
          "focus-visible:ring-[var(--gold)]",
        ],
        outline: [
          "bg-transparent border border-[var(--green-deep)] text-[var(--green-deep)]",
          "hover:bg-[var(--green-deep)] hover:text-white",
          "focus-visible:ring-[var(--green-deep)]",
        ],
        "outline-light": [
          "bg-transparent border border-white/30 text-white",
          "hover:border-white hover:bg-white/10",
          "focus-visible:ring-white",
        ],
        ghost: [
          "bg-transparent text-[var(--green-mid)]",
          "hover:bg-[var(--green-pale)]/40",
          "focus-visible:ring-[var(--green-mid)]",
        ],
        danger: [
          "bg-red-600 text-white",
          "hover:bg-red-700",
          "focus-visible:ring-red-500",
        ],
      },
      size: {
        sm: "h-9 px-5 text-[13px]",
        md: "h-11 px-7 text-[14px]",
        lg: "h-13 px-9 text-[15px]",
        icon: "h-10 w-10 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  href?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, href, children, ...props }, ref) => {
    if (href) {
      return (
        <a
          href={href}
          className={cn(buttonVariants({ variant, size }), className)}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
