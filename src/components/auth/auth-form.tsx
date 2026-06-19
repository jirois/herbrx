import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function AuthField({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: AuthFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-(--text-body) mb-1.5"
      >
        {label}
        {props.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        {...props}
        className={cn(
          "w-full px-4 py-3 rounded-xl border text-[14px] bg-white",
          "text-(--text-dark) placeholder:text-(--text-muted)",
          "outline-none transition-all duration-200",
          error
            ? "border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200"
            : "border-(--cream-dark) focus:border-(--green-mid) focus:ring-2 focus:ring-(--green-pale)",
        )}
      />
      {hint && !error && (
        <p className="text-[11px] text-(--text-muted) mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-[12px] text-red-500 mt-1 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────
export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-(--cream-dark)" />
      <span className="text-[12px] text-(--text-muted) uppercase tracking-wider font-medium">
        {label}
      </span>
      <div className="flex-1 h-px bg-(--cream-dark)" />
    </div>
  );
}

// ── Google button ─────────────────────────────────────────────────────────
interface GoogleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  label?: string;
}

export function GoogleButton({
  loading,
  label = "Continue with Google",
  ...props
}: GoogleButtonProps) {
  return (
    <button
      type="button"
      {...props}
      disabled={loading || props.disabled}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-(--cream-dark) bg-white hover:bg-(--cream) text-[14px] font-medium text-(--text-dark) transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Google SVG icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {loading ? "Signing in…" : label}
    </button>
  );
}
