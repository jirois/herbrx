"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  RotateCw,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";

interface Props {
  /** Current image URL (data URL or hosted URL) */
  value?: string | null;
  /** Called with base64 data URL of the compressed image */
  onChange: (dataUrl: string | null) => void;
  /** Max width/height in px (default 800) */
  maxDimension?: number;
  /** Target file size ceiling in KB (default 100) */
  targetMaxKb?: number;
  /** Floor — don't over-compress below this quality (default 50 KB) */
  targetMinKb?: number;
  /** Output MIME type (default 'image/webp', falls back to jpeg) */
  outputFormat?: "image/webp" | "image/jpeg";
  /** Aspect ratio enforced on the preview (CSS) */
  aspectRatio?: string;
  /** Label shown in the dropzone */
  label?: string;
  /** Dark (dashboard) or light (public forms) theme */
  theme?: "dark" | "light";
  disabled?: boolean;
}

interface CompressionResult {
  dataUrl: string;
  sizeKb: number;
  quality: number;
  width: number;
  height: number;
  iterations: number;
}

// ── Core compression engine ──────
//
// Strategy:
//   1. Draw the image onto a canvas scaled to maxDimension (preserving
//      aspect ratio) — this alone dramatically reduces file size for
//      large photos without any quality loss at typical display sizes.
//   2. Binary-search JPEG/WebP quality from 0.95 down until the output
//      lands in [targetMinKb, targetMaxKb].
//   3. If even quality=0.3 exceeds targetMaxKb, reduce canvas dimensions
//      further (half at a time) and retry the quality search.
//   4. Never reduce quality below 0.30 — below that JPEG artefacts are
//      visible. If we still can't meet the ceiling at 0.30, report the
//      best result achieved and let the caller decide.
//
async function compressImage(
  file: File,
  maxDimension = 800,
  targetMaxKb = 100,
  targetMinKb = 50,
  format = "image/webp" as "image/webp" | "image/jpeg",
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.onload = () => {
        // Determine canvas size (≤ maxDimension on longest side)
        let { naturalWidth: w, naturalHeight: h } = img;
        if (w > maxDimension || h > maxDimension) {
          const scale = maxDimension / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        let iterations = 0;
        let bestUrl = "";
        let bestKb = Infinity;
        let bestQ = 0.85;

        // Try to fit inside the ceiling, possibly shrinking dimensions
        for (let dimScale = 1.0; dimScale >= 0.25; dimScale -= 0.25) {
          const cw = Math.max(1, Math.round(w * dimScale));
          const ch = Math.max(1, Math.round(h * dimScale));
          canvas.width = cw;
          canvas.height = ch;
          ctx.clearRect(0, 0, cw, ch);
          ctx.drawImage(img, 0, 0, cw, ch);

          // Binary-search quality
          let lo = 0.3,
            hi = 0.95,
            q = 0.85;
          let url = "",
            kb = Infinity;

          for (let step = 0; step < 10; step++) {
            q = (lo + hi) / 2;
            url = canvas.toDataURL(format, q);
            // data URL overhead: base64 encodes 3 bytes → 4 chars, minus header
            const base64 = url.split(",")[1] ?? "";
            kb = Math.round((base64.length * 3) / 4 / 1024);
            iterations++;

            if (kb > targetMaxKb) {
              hi = q;
            } else if (kb < targetMinKb && q < 0.92) {
              lo = q; // can afford higher quality
            } else {
              break; // in the sweet spot
            }
          }

          if (kb < bestKb) {
            bestUrl = url;
            bestKb = kb;
            bestQ = q;
          }

          // If we're already within ceiling, stop shrinking dimensions
          if (kb <= targetMaxKb) break;
        }

        resolve({
          dataUrl: bestUrl,
          sizeKb: bestKb,
          quality: Math.round(bestQ * 100),
          width: canvas.width,
          height: canvas.height,
          iterations,
        });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ── Formatted file size ─────────────
function fmtKb(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

// ── Component ────────────────────────────────────────────────────────────
export function ImageUploader({
  value,
  onChange,
  maxDimension = 800,
  targetMaxKb = 100,
  targetMinKb = 50,
  outputFormat = "image/webp",
  aspectRatio = "1/1",
  label = "Product Image",
  theme = "dark",
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "compressing" | "done" | "error">(
    "idle",
  );
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [origKb, setOrigKb] = useState<number>(0);
  const [errMsg, setErrMsg] = useState("");
  const [dragging, setDragging] = useState(false);

  const isDark = theme === "dark";

  const process = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setErrMsg("Please upload an image file (JPG, PNG, WebP, AVIF).");
        setState("error");
        return;
      }
      if (file.size > 30 * 1024 * 1024) {
        setErrMsg("Maximum source file size is 30 MB.");
        setState("error");
        return;
      }

      setOrigKb(Math.round(file.size / 1024));
      setState("compressing");
      setErrMsg("");

      try {
        // WebP not universally supported in all environments — check and fallback
        const fmt =
          typeof document !== "undefined" &&
          document
            .createElement("canvas")
            .toDataURL("image/webp")
            .startsWith("data:image/webp")
            ? outputFormat
            : "image/jpeg";

        const res = await compressImage(
          file,
          maxDimension,
          targetMaxKb,
          targetMinKb,
          fmt,
        );

        console.log("Uploader size:", res.dataUrl.length);
        console.log("Uploader preview:", res.dataUrl.substring(0, 100));
        setResult(res);
        setState("done");
        onChange(res.dataUrl);
      } catch (error) {
        setErrMsg(
          error instanceof Error
            ? error.message
            : "Compression failed. Please try a different image.",
        );
        setState("error");
      }
    },
    [maxDimension, targetMaxKb, targetMinKb, outputFormat, onChange],
  );

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || disabled) return;
    process(files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleClear() {
    setResult(null);
    setState("idle");
    setErrMsg("");
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const displayUrl = result?.dataUrl ?? value;

  const borderCls = isDark
    ? "border-white/[0.1] bg-white/[0.04] hover:border-white/20"
    : "border-[var(--cream-dark)] bg-[var(--cream)] hover:border-[var(--green-pale)]";
  const textMuted = isDark ? "text-white/40" : "text-[var(--text-muted)]";
  const textMain = isDark ? "text-white" : "text-[var(--text-dark)]";

  return (
    <div className="w-full">
      {/* Label */}
      <label
        className={`block text-[12px] font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-white/50" : "text-(--text-muted)"}`}
      >
        {label}
      </label>

      {/* Preview / dropzone */}
      <div
        style={{ aspectRatio }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative w-full rounded-2xl border-2 border-dashed overflow-hidden transition-all ${
          dragging
            ? isDark
              ? "border-(--green-mid) bg-(--green-mid)/10"
              : "border-(--green-mid) bg-(--green-pale)/30"
            : borderCls
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => !disabled && !displayUrl && inputRef.current?.click()}
      >
        {/* Current image */}
        {displayUrl && (
          <Image
            src={displayUrl}
            alt="Product"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
        )}

        {/* Compressing overlay */}
        {state === "compressing" && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 z-10">
            <Loader2 size={28} className="animate-spin text-white" />
            <p className="text-[13px] text-white/80">Compressing…</p>
          </div>
        )}

        {/* Idle / no image */}
        {!displayUrl && state !== "compressing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? "bg-white/6" : "bg-(--cream-dark)"}`}
            >
              <ImageIcon size={22} className={textMuted} />
            </div>
            <p className={`text-[13px] font-medium ${textMain}`}>
              {dragging ? "Drop image here" : "Click or drag to upload"}
            </p>
            <p className={`text-[11px] ${textMuted} text-center`}>
              JPG, PNG, WebP — auto-compressed to ≤{targetMaxKb}KB
            </p>
          </div>
        )}

        {/* Controls overlay — shown when image is loaded */}
        {displayUrl && state !== "compressing" && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all group flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  inputRef.current?.click();
                }
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30"
              title="Replace image"
            >
              <RotateCw size={15} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-xl bg-red-500/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/60"
              title="Remove image"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {state === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertTriangle size={13} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-400">{errMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compression stats */}
      <AnimatePresence>
        {state === "done" && result && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-[11px] ${
              isDark
                ? "bg-white/4 border border-white/[0.07]"
                : "bg-(--cream-dark) border border-(--cream-dark)"
            }`}
          >
            <CheckCircle size={12} className="text-green-400 shrink-0" />
            <span className={textMuted}>
              Compressed:{" "}
              <span
                className={`font-semibold ${isDark ? "text-white" : "text-(--text-dark)"}`}
              >
                {origKb} KB
              </span>
              {" → "}
              <span className="font-semibold text-green-400">
                {result.sizeKb} KB
              </span>
              {" · "}
              {result.width}×{result.height}px
              {" · "}Q{result.quality}
            </span>
            {result.sizeKb > targetMaxKb && (
              <span className="text-amber-400 ml-1">
                (above {targetMaxKb} KB limit — best achievable)
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
