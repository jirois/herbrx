import type { ComponentType, ReactNode, SVGProps } from "react";
import {
  Baby,
  BadgeCheck,
  BookOpen,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  ClipboardList,
  CreditCard,
  Download,
  Droplets,
  Factory,
  Flower2,
  FlaskConical,
  Globe,
  Handshake,
  Info,
  Languages,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Microscope,
  Newspaper,
  Package,
  PartyPopper,
  PenLine,
  Phone,
  Search,
  Siren,
  Smartphone,
  Sparkles,
  Stethoscope,
  Tag,
  Timer,
  TreeDeciduous,
  Tv,
  TriangleAlert,
  User,
  Wallet,
  Wheat,
  BellRing,
  ShoppingCart,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────
   HerbRx icon system
   ------------------------------------------------------------------------
   One visual language for every icon on the public site:
     • 24px grid, 1.6 stroke, round caps and joins
     • herbal / product glyphs are drawn in-house as duotone shapes
       (outline + 16% tint) so they read as HerbRx rather than stock icons
     • generic UI glyphs come from lucide-react at the same stroke weight
   Emoji stored in the database (product.meta.emoji, press logos, …) are
   translated to these glyphs by <EmojiIcon />, so existing data keeps working.
──────────────────────────────────────────────────────────────────────── */

export interface GlyphProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  size?: number | string;
}

/** Shared SVG shell for the hand-drawn glyphs. */
function Glyph({ size = 24, className, children, ...rest }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Soft fill used for the "second tone" of every duotone glyph. */
const TINT = { fill: "currentColor", fillOpacity: 0.16 } as const;

/* ── Hand-drawn herbal glyphs ─────────────────────────────────────────── */

export function LeafGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path
        d="M5 19.5C4.5 11 9.5 4.5 19.5 4.5c.5 9.5-5 15-14.5 15Z"
        {...TINT}
      />
      <path d="M5 19.5 14 10.5" />
    </Glyph>
  );
}

export function SproutGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M12 21v-9.5" />
      <path d="M12 14.5C12 10.8 9.6 8.5 5 8.5c0 3.8 2.4 6 7 6Z" {...TINT} />
      <path d="M12 11.5C12 7.6 14.6 5 19 5c0 4-2.6 6.5-7 6.5Z" {...TINT} />
      <path d="M8.5 21h7" />
    </Glyph>
  );
}

export function PlantGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M8 15h8l-.9 5.2a1 1 0 0 1-1 .8H9.9a1 1 0 0 1-1-.8Z" {...TINT} />
      <path d="M12 15v-5" />
      <path d="M12 12.5c0-2.6-1.9-4-4.8-4 0 2.6 1.9 4 4.8 4Z" {...TINT} />
      <path d="M12 10c0-2.7 1.9-4.3 4.8-4.3 0 2.7-1.9 4.3-4.8 4.3Z" {...TINT} />
    </Glyph>
  );
}

export function BerryGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <circle cx="8" cy="15.5" r="3.4" {...TINT} />
      <circle cx="16" cy="15.5" r="3.4" {...TINT} />
      <circle cx="12" cy="9" r="3.4" {...TINT} />
      <path d="M12 5.6c0-1.6 1-2.7 2.8-2.9 0 1.7-1 2.8-2.8 2.9Z" />
    </Glyph>
  );
}

export function FlowerGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="12"
          cy="6.6"
          rx="2.7"
          ry="3.9"
          transform={`rotate(${angle} 12 12)`}
          {...TINT}
        />
      ))}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

export function RootGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path
        d="M3.8 16.2C2.9 14.8 3.5 13 5 12.5L8 11.6C7.7 9.6 8.2 7.6 9.8 7 11.1 6.5 12.3 7.3 12.6 8.6L13 10.6 15 10C14.7 8.2 15.3 6.4 16.8 5.8 18.1 5.3 19.3 6.2 19.6 7.5L20.3 11.2C20.7 13 19.9 14.4 18.5 14.9 18.3 17 16.3 18.4 14.3 18L8.9 19C7.4 19.3 6 18.7 5.2 17.6 4.6 17.4 4.1 16.9 3.8 16.2Z"
        {...TINT}
      />
      <path d="M15.6 13.3 15.3 15.4M11.4 14.3 11.1 16.4" />
    </Glyph>
  );
}

export function TinctureGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="10" y="2.5" width="4" height="4" rx="2" />
      <rect x="8.5" y="6.5" width="7" height="2.2" rx="0.8" />
      <path d="M8 8.7h8v9.3a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3Z" {...TINT} />
      <path d="M8 14h8" />
    </Glyph>
  );
}

export function JarGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="5.5" y="3.5" width="13" height="4" rx="1.4" />
      <path d="M6.5 7.5h11v10.2a3 3 0 0 1-3 3h-5a3 3 0 0 1-3-3Z" {...TINT} />
      <path d="M9.5 13h5" />
    </Glyph>
  );
}

export function CapsuleGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <g transform="rotate(-40 12 12)">
        <rect x="3" y="8.2" width="18" height="7.6" rx="3.8" {...TINT} />
        <path
          d="M12 8.2h5.2a3.8 3.8 0 0 1 0 7.6H12Z"
          fill="currentColor"
          fillOpacity={0.3}
          stroke="none"
        />
        <path d="M12 8.2v7.6" />
      </g>
    </Glyph>
  );
}

export function TeaGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M5 10h11v3.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z" {...TINT} />
      <path d="M16 11.2h1.5a2.5 2.5 0 0 1 0 5h-2.1" />
      <path d="M4 20.8h13" />
      <path d="M8 3.5c-.9 1 .9 1.8 0 3M12 3.5c-.9 1 .9 1.8 0 3" />
    </Glyph>
  );
}

/** HerbRx signature mark: verification shield with a leaf inside. */
export function LeafShieldGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path
        d="M12 2.8 19.5 5.6v5.7c0 4.8-3.2 8.3-7.5 9.9-4.3-1.6-7.5-5.1-7.5-9.9V5.6Z"
        {...TINT}
      />
      <path d="M8.7 14.5c-.3-3.4 1.8-5.9 6-6.2.3 3.6-1.8 6.2-6 6.2Z" />
      <path d="m8.7 14.5 3.6-3.6" />
    </Glyph>
  );
}

/* ── Social marks (used in the footer) ────────────────────────────────── */

export function XMark(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M4.5 4.5h3.6l11.4 15h-3.6Z" {...TINT} />
      <path d="M19 4.5l-5.9 6.4M5 19.5l5.9-6.4" />
    </Glyph>
  );
}

export function LinkedInMark(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" {...TINT} />
      <path d="M8 10.5V16M8 7.9v.1M11.6 16v-5.5M11.6 13c0-1.5 1-2.5 2.3-2.5s2.1 1 2.1 2.5v3" />
    </Glyph>
  );
}

export function FacebookMark(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" {...TINT} />
      <path d="M13.5 20.5v-6.2h2.1l.4-2.5h-2.5V10c0-.7.3-1.2 1.3-1.2H16V6.6c-.3 0-1-.1-1.8-.1-1.9 0-3 1.1-3 3.1v2.2H9v2.5h2.2v6.2" />
    </Glyph>
  );
}

export function InstagramMark(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" {...TINT} />
      <circle cx="12" cy="12" r="3.9" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
    </Glyph>
  );
}

/* ── Registry ─────────────────────────────────────────────────────────── */

type LucideLike = ComponentType<{
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

type AnyIcon = ComponentType<GlyphProps> | LucideLike;

const ICONS = {
  // herbal + product
  leaf: LeafGlyph,
  sprout: SproutGlyph,
  plant: PlantGlyph,
  berry: BerryGlyph,
  flower: FlowerGlyph,
  root: RootGlyph,
  tincture: TinctureGlyph,
  jar: JarGlyph,
  capsule: CapsuleGlyph,
  tea: TeaGlyph,
  shield: LeafShieldGlyph,
  blossom: Flower2,
  tree: TreeDeciduous,
  grain: Wheat,
  droplets: Droplets,
  flask: FlaskConical,
  sparkles: Sparkles,
  // people + services
  consult: Stethoscope,
  library: BookOpen,
  factory: Factory,
  clipboard: ClipboardList,
  microscope: Microscope,
  handshake: Handshake,
  languages: Languages,
  baby: Baby,
  user: User,
  tag: Tag,
  // status
  bell: Bell,
  "bell-ring": BellRing,
  siren: Siren,
  alert: TriangleAlert,
  info: Info,
  "check-circle": CircleCheck,
  verified: BadgeCheck,
  check: Check,
  "chevron-up": ChevronUp,
  "chevron-down": ChevronDown,
  party: PartyPopper,
  timer: Timer,
  // contact + commerce
  mail: Mail,
  phone: Phone,
  pin: MapPin,
  chat: MessageCircle,
  lock: Lock,
  package: Package,
  download: Download,
  search: Search,
  note: PenLine,
  card: CreditCard,
  cart: ShoppingCart,
  wallet: Wallet,
  // media
  newspaper: Newspaper,
  chart: ChartColumn,
  tv: Tv,
  mobile: Smartphone,
  globe: Globe,
  megaphone: Megaphone,
  // social
  x: XMark,
  linkedin: LinkedInMark,
  facebook: FacebookMark,
  instagram: InstagramMark,
} satisfies Record<string, AnyIcon>;

export type BrandIconName = keyof typeof ICONS;

export interface BrandIconProps {
  name: BrandIconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

/** Render any icon from the HerbRx set by name. */
export function BrandIcon({
  name,
  size = 20,
  className,
  strokeWidth = 1.6,
}: BrandIconProps) {
  const Cmp = ICONS[name] as ComponentType<{
    size?: number | string;
    strokeWidth?: number | string;
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  return (
    <Cmp
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    />
  );
}

/* ── Emoji → icon (for values that still live in the database) ────────── */

const EMOJI_TO_ICON: Record<string, BrandIconName> = {
  "🌿": "leaf",
  "🍃": "leaf",
  "🥬": "leaf",
  "🌱": "sprout",
  "🪴": "plant",
  "🌳": "tree",
  "🌾": "grain",
  "🫐": "berry",
  "🍒": "berry",
  "🌺": "flower",
  "🌼": "blossom",
  "🌸": "blossom",
  "🫚": "root",
  "🧴": "jar",
  "🫧": "droplets",
  "💊": "capsule",
  "🧪": "flask",
  "🫖": "tea",
  "☕": "tea",
  "✨": "sparkles",
  "🛡": "shield",
  "🩺": "consult",
  "👨‍⚕": "consult",
  "👩‍⚕": "consult",
  "🧑‍⚕": "consult",
  "📚": "library",
  "🏭": "factory",
  "📋": "clipboard",
  "🔬": "microscope",
  "🤝": "handshake",
  "🗣": "languages",
  "🤰": "baby",
  "👤": "user",
  "🏷": "tag",
  "🔔": "bell-ring",
  "🚨": "siren",
  "⚠": "alert",
  ℹ: "info",
  "✅": "check-circle",
  "🎉": "party",
  "⏱": "timer",
  "📧": "mail",
  "📞": "phone",
  "📍": "pin",
  "💬": "chat",
  "🔒": "lock",
  "📦": "package",
  "🔍": "search",
  "📝": "note",
  "💳": "card",
  "🛒": "cart",
  "💰": "wallet",
  "📰": "newspaper",
  "🗞": "newspaper",
  "📊": "chart",
  "📺": "tv",
  "📱": "mobile",
  "🌍": "globe",
  "📣": "megaphone",
};

/** Drops variation selectors so "⚠️" and "⚠" resolve to the same key. */
function normalizeEmoji(value: string): string {
  return value.replace(/\uFE0F/g, "").trim();
}

/**
 * Resolve a stored value to an icon name. Accepts an emoji (what the database
 * holds) or an icon name directly. Unknown values fall back to the leaf.
 */
export function emojiToIconName(emoji?: string | null): BrandIconName {
  if (!emoji) return "leaf";
  const value = normalizeEmoji(emoji);
  if (value in ICONS) return value as BrandIconName;
  return EMOJI_TO_ICON[value] ?? "leaf";
}

export function EmojiIcon({
  emoji,
  size = 20,
  className,
  strokeWidth,
}: {
  emoji?: string | null;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <BrandIcon
      name={emojiToIconName(emoji)}
      size={size}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
}

/* ── Tiles ────────────────────────────────────────────────────────────── */

export type IconTone =
  | "green"
  | "sage"
  | "gold"
  | "teal"
  | "cream"
  | "dark"
  | "danger"
  | "warning"
  | "info";

const TONES: Record<IconTone, string> = {
  green: "bg-(--green-pale) text-(--green-deep)",
  sage: "bg-(--green-pale)/45 text-(--green-mid)",
  gold: "bg-[#F5E8CE] text-(--gold)",
  teal: "bg-[#C2DDD5] text-[#1A6B5A]",
  cream: "bg-(--cream-dark) text-(--green-mid)",
  dark: "bg-white/10 text-(--gold-light)",
  danger: "bg-red-100 text-red-600",
  warning: "bg-amber-100 text-amber-600",
  info: "bg-blue-100 text-blue-600",
};

const TILE_SIZES = {
  xs: { box: "w-8 h-8 rounded-lg", icon: 16 },
  sm: { box: "w-10 h-10 rounded-xl", icon: 20 },
  md: { box: "w-12 h-12 rounded-xl", icon: 24 },
  lg: { box: "w-14 h-14 rounded-2xl", icon: 28 },
  xl: { box: "w-16 h-16 rounded-2xl", icon: 32 },
  "2xl": { box: "w-20 h-20 rounded-3xl", icon: 40 },
} as const;

export type IconTileSize = keyof typeof TILE_SIZES;

interface IconTileProps {
  /** Semantic icon name… */
  name?: BrandIconName;
  /** …or a stored emoji to translate. `name` wins when both are given. */
  emoji?: string | null;
  tone?: IconTone;
  size?: IconTileSize;
  className?: string;
  children?: ReactNode;
}

/** A rounded, tinted tile holding one icon: the standard HerbRx icon badge. */
export function IconTile({
  name,
  emoji,
  tone = "green",
  size = "md",
  className,
}: IconTileProps) {
  const s = TILE_SIZES[size];
  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0",
        s.box,
        TONES[tone],
        className,
      )}
    >
      <BrandIcon name={name ?? emojiToIconName(emoji)} size={s.icon} />
    </div>
  );
}

/* ── Language marks (replace flag / colour-dot emoji) ─────────────────── */

const LANGUAGE_MARKS: Record<string, { code: string; light: string }> = {
  English: { code: "EN", light: "bg-slate-200 text-slate-700" },
  Igbo: { code: "IG", light: "bg-emerald-100 text-emerald-700" },
  Yoruba: { code: "YO", light: "bg-amber-100 text-amber-700" },
  Hausa: { code: "HA", light: "bg-sky-100 text-sky-700" },
  Pidgin: { code: "PG", light: "bg-green-100 text-green-700" },
};

export function LanguageMark({
  language,
  onDark = false,
  className,
}: {
  language: string;
  onDark?: boolean;
  className?: string;
}) {
  const mark = LANGUAGE_MARKS[language] ?? {
    code: language.slice(0, 2).toUpperCase(),
    light: "bg-slate-200 text-slate-700",
  };
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-4 min-w-4.5 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none tracking-wide",
        onDark ? "bg-white/15 text-white" : mark.light,
        className,
      )}
    >
      {mark.code}
    </span>
  );
}
