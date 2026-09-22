import { Package } from "lucide-react";
import Image from "next/image";
import { EmojiIcon } from "@/components/icons/brand-icons";

interface Props {
  /** Data URL, hosted URL, or null/undefined */
  src?: string | null;
  /** Stored emoji (or icon name) — drawn as a HerbRx icon when no src is available */
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
 * Falls back to the HerbRx icon for the stored emoji/icon key, then to a
 * generic Package icon.
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
    // Icon size (px) follows the wrapper size class
    const iconSize = size.includes("w-6")
      ? 14
      : size.includes("w-8")
        ? 18
        : size.includes("w-9")
          ? 20
          : size.includes("w-10")
            ? 22
            : size.includes("w-11")
              ? 24
              : size.includes("w-12")
                ? 26
                : size.includes("w-14")
                  ? 30
                  : size.includes("w-16")
                    ? 34
                    : size.includes("w-20")
                      ? 40
                      : size.includes("w-24")
                        ? 48
                        : 22;

    return (
      <div
        className={`${size} ${rounded} ${bgCls} flex items-center justify-center shrink-0 ${className}`}
      >
        <EmojiIcon
          emoji={emoji}
          size={iconSize}
          className={
            theme === "dark" ? "text-(--gold-light)" : "text-(--green-mid)"
          }
        />
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
