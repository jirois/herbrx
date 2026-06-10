"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────
type ToastVariant = "success" | "error" | "info" | "cart";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  cartAdd: (productName: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ── Icons ─────────────────────────────────────────────────────────────────
const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle size={16} />,
  error: <AlertCircle size={16} />,
  info: <Info size={16} />,
  cart: <span className="text-[16px]">🛒</span>,
};

const styles: Record<ToastVariant, string> = {
  success: "bg-[var(--green-deep)] text-white",
  error: "bg-red-600 text-white",
  info: "bg-[var(--text-dark)] text-white",
  cart: "bg-white text-[var(--text-dark)] border border-[var(--cream-dark)] shadow-lg",
};

const iconStyles: Record<ToastVariant, string> = {
  success: "text-[var(--green-pale)]",
  error: "text-red-200",
  info: "text-white/70",
  cart: "text-[var(--green-mid)]",
};

// ── Provider ──────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timerMap.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timerMap.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info", duration = 3500) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [
        ...prev.slice(-4),
        { id, message, variant, duration },
      ]);
      const timer = setTimeout(() => dismiss(id), duration);
      timerMap.current.set(id, timer);
    },
    [dismiss],
  );

  const success = useCallback((msg: string) => toast(msg, "success"), [toast]);
  const error = useCallback(
    (msg: string) => toast(msg, "error", 5000),
    [toast],
  );
  const info = useCallback((msg: string) => toast(msg, "info"), [toast]);
  const cartAdd = useCallback(
    (name: string) => toast(`"${name}" added to cart`, "cart", 2800),
    [toast],
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info, cartAdd }}>
      {children}

      {/* Toast stack */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-6 right-6 z-200 flex flex-col gap-2.5 pointer-events-none"
        style={{ maxWidth: "min(360px, calc(100vw - 32px))" }}
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              role="alert"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.95,
                transition: { duration: 0.18 },
              }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl min-w-60",
                styles[t.variant],
              )}
            >
              <span className={cn("mt-0.5 shrink-0", iconStyles[t.variant])}>
                {icons[t.variant]}
              </span>
              <p className="text-[13px] leading-snug flex-1 font-medium">
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
