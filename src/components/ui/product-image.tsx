import { Package } from "lucide-react";
import Image from "next/image";

interface Props {
  /** Data URL, hosted URL, or null/undefined */
  src?: string | null;
  /** Legacy emoji fallback — shown when no src available */
  emoji?: string | null;
  /** Tailwind size classes for the wrapper, e.g. "w-10 h-10" */
  size?: string;
  /** Additional className on the wrapper */
  className?: string;
  alt?: string;
  /** Rounded corners class, default "rounded-xl" */
  rounded?: string;
  /** Dark or light background when falling back to icon */
  theme?: "dark" | "light";
}

/**
 * Renders a real product image if `src` is present.
 * Falls back to the legacy emoji, then to a generic Package icon.
 *
 * Drop-in replacement for every `{product.emoji}` render site —
 * just pass `src={product.imageUrl}` and `emoji={product.emoji}`.
 */
export function ProductImage({
  src,
  emoji,
  size = "w-10 h-10",
  className = "",
  alt = "Product image",
  rounded = "rounded-xl",
  theme = "dark",
}: Props) {
  const bgCls = theme === "dark" ? "bg-white/[0.07]" : "bg-[var(--cream-dark)]";

  if (src) {
    return (
      <div
        className={`relative ${size} ${rounded} overflow-hidden shrink-0 ${className}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="48px"
          className="object-cover"
          unoptimized={src.startsWith("data:")}
        />
      </div>
    );
  }

  if (emoji) {
    // Determine font size from the size class
    const textSize = size.includes("w-6")
      ? "text-[14px]"
      : size.includes("w-8")
        ? "text-[18px]"
        : size.includes("w-9")
          ? "text-[20px]"
          : size.includes("w-10")
            ? "text-[22px]"
            : size.includes("w-12")
              ? "text-[26px]"
              : size.includes("w-14")
                ? "text-[30px]"
                : size.includes("w-16")
                  ? "text-[34px]"
                  : size.includes("w-20")
                    ? "text-[40px]"
                    : size.includes("w-24")
                      ? "text-[48px]"
                      : "text-[22px]";

    return (
      <div
        className={`${size} ${rounded} ${bgCls} flex items-center justify-center shrink-0 ${className}`}
      >
        <span className={textSize}>{emoji}</span>
      </div>
    );
  }

  // No image, no emoji — generic placeholder
  return (
    <div
      className={`${size} ${rounded} ${bgCls} flex items-center justify-center shrink-0 ${className}`}
    >
      <Package
        size={16}
        className={theme === "dark" ? "text-white/25" : "text-(--text-muted)"}
      />
    </div>
  );
}
