import Image from "next/image";
import { EmojiIcon } from "@/components/icons/brand-icons";

interface Props {
  /** Hosted URL, data: URI, or null/undefined */
  src?: string | null;
  /** Stored emoji — drawn as a HerbRx icon when no image is available */
  emoji?: string | null;
  alt: string;
  /** Tailwind classes controlling the wrapper's size */
  className?: string;
  /** Icon size used in the emoji fallback */
  fallbackIconSize?: number;
  priority?: boolean;
}

/**
 * Renders a real blog cover image if `src` is present. Falls back to the
 * HerbRx icon for the stored emoji inside a soft circle — the same
 * degrade path ProductImage uses for products without a photo yet.
 */
export function BlogImage({
  src,
  emoji,
  alt,
  className = "",
  fallbackIconSize = 44,
  priority = false,
}: Props) {
  if (src) {
    return (
      // No "relative" here on purpose — every caller passes
      // className="absolute inset-0" because the actual positioning
      // context (the card thumbnail box, the post hero) is already
      // `relative` one level up. Adding "relative" on top of that
      // "absolute" put two conflicting position values on the same
      // element, which is what made the image render unpositioned.
      <div className={`overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-cover object-center"
          priority={priority}
          unoptimized={src.startsWith("data:") || src.endsWith(".svg")}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="img"
      aria-label={alt}
    >
      <span className="flex items-center justify-center rounded-full bg-white/35 text-(--green-deep) h-24 w-24">
        <EmojiIcon emoji={emoji} size={fallbackIconSize} />
      </span>
    </div>
  );
}
