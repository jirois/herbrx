import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Use the white version of the artwork — for dark backgrounds (footer, dark hero sections, etc). */
  light?: boolean;
  /** Render just the mortar-and-pestle mark, no wordmark — for tight spaces (collapsed sidebars, compact headers). */
  iconOnly?: boolean;
  /** Where the logo links to. Defaults to the homepage. */
  href?: string;
  /** Mark as high-priority for above-the-fold instances (e.g. the main navbar) to improve LCP. */
  priority?: boolean;
  className?: string;
}

// Intrinsic pixel dimensions of the source artwork — keeps the aspect ratio
// correct at every size next/image is asked to render it at.
const FULL_RATIO = { width: 868, height: 267 };
const ICON_RATIO = { width: 263, height: 263 };

export function Logo({
  light = false,
  iconOnly = false,
  href = "/",
  priority = false,
  className,
}: LogoProps) {
  const src = iconOnly
    ? light
      ? "/brand/herbrx-icon-white.png"
      : "/brand/herbrx-icon.png"
    : light
      ? "/brand/herbrx-logo-full-white.png"
      : "/brand/herbrx-logo-full.png";

  const dims = iconOnly ? ICON_RATIO : FULL_RATIO;

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center group", className)}
      aria-label="HerbRx — go to homepage"
    >
      <Image
        src={src}
        alt="HerbRx"
        width={dims.width}
        height={dims.height}
        priority={priority}
        className={cn(
          "w-auto transition-transform duration-300 group-hover:scale-105 select-none",
          iconOnly ? "h-8 sm:h-9" : "h-9 sm:h-10",
        )}
      />
    </Link>
  );
}
