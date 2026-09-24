"use client";

import { useRef, useState } from "react";
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  Quote,
  List,
  ListOrdered,
  ImagePlus,
  Minus,
  Eye,
  Pencil,
  Loader2,
} from "lucide-react";
import { compressImage } from "@/components/ui/image-uploader";
import { renderMarkdownLite } from "@/lib/render-content";
import { estimateReadTime } from "@/lib/reading-time";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
}

type ToolAction =
  | "h2"
  | "h3"
  | "bold"
  | "italic"
  | "quote"
  | "ul"
  | "ol"
  | "hr";

/**
 * A lightweight rich-text toolbar over our markdown-lite syntax: writers
 * click buttons instead of memorizing markdown, get a live "how this will
 * look" preview, and can drop real inline images anywhere in the body —
 * distinct from the post's single cover image — the same way they'd add
 * an image between paragraphs in WordPress.
 */
export function ContentEditor({ value, onChange, disabled, rows = 16 }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function applyAtSelection(
    transform: (
      selected: string,
      before: string,
      after: string,
    ) => {
      text: string;
      selectStart: number;
      selectEnd: number;
    },
  ) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);

    const result = transform(selected, before, after);
    onChange(result.text);

    // Restore focus + selection after React re-renders the textarea
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(result.selectStart, result.selectEnd);
    });
  }

  function wrapInline(marker: string) {
    applyAtSelection((selected, before, after) => {
      const placeholder = selected || "text";
      const text = `${before}${marker}${placeholder}${marker}${after}`;
      const selectStart = before.length + marker.length;
      const selectEnd = selectStart + placeholder.length;
      return { text, selectStart, selectEnd };
    });
  }

  function prefixLine(prefix: string) {
    applyAtSelection((selected, before, after) => {
      // Prefix every selected line (or the current line if nothing selected)
      const lineStart = before.lastIndexOf("\n") + 1;
      const head = before.slice(0, lineStart);
      const currentLinePart = before.slice(lineStart);
      const block = currentLinePart + selected || "";
      const prefixed = block
        .split("\n")
        .map((l) => (l.startsWith(prefix) ? l : `${prefix}${l}`))
        .join("\n");
      const text = `${head}${prefixed}${after}`;
      const selectStart = head.length + prefixed.length;
      const selectEnd = selectStart;
      return { text, selectStart, selectEnd };
    });
  }

  function insertBlock(block: string) {
    applyAtSelection((selected, before, after) => {
      const needsLeadingBreak = before.length > 0 && !before.endsWith("\n\n");
      const lead = before.length === 0 ? "" : needsLeadingBreak ? "\n\n" : "";
      const text = `${before}${lead}${block}\n\n${after}`;
      const pos = before.length + lead.length + block.length + 2;
      return { text, selectStart: pos, selectEnd: pos };
    });
  }

  function handleToolbar(action: ToolAction) {
    if (disabled) return;
    switch (action) {
      case "h2":
        prefixLine("## ");
        break;
      case "h3":
        prefixLine("### ");
        break;
      case "bold":
        wrapInline("**");
        break;
      case "italic":
        wrapInline("*");
        break;
      case "quote":
        prefixLine("> ");
        break;
      case "ul":
        prefixLine("- ");
        break;
      case "ol":
        prefixLine("1. ");
        break;
      case "hr":
        insertBlock("---");
        break;
    }
  }

  async function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const supportsWebp =
        typeof document !== "undefined" &&
        document
          .createElement("canvas")
          .toDataURL("image/webp")
          .startsWith("data:image/webp");
      const res = await compressImage(
        file,
        900,
        120,
        40,
        supportsWebp ? "image/webp" : "image/jpeg",
      );
      insertBlock(`![Add a caption](${res.dataUrl})`);
    } catch (e) {
      setUploadError(
        e instanceof Error ? e.message : "Could not process that image.",
      );
    } finally {
      setUploading(false);
    }
  }

  const readTime = estimateReadTime(value);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div className="flex flex-wrap gap-1">
          <ToolButton
            icon={<Heading2 size={15} />}
            title="Heading"
            onClick={() => handleToolbar("h2")}
            disabled={disabled || mode === "preview"}
          />
          <ToolButton
            icon={<Heading3 size={15} />}
            title="Subheading"
            onClick={() => handleToolbar("h3")}
            disabled={disabled || mode === "preview"}
          />
          <ToolDivider />
          <ToolButton
            icon={<Bold size={15} />}
            title="Bold"
            onClick={() => handleToolbar("bold")}
            disabled={disabled || mode === "preview"}
          />
          <ToolButton
            icon={<Italic size={15} />}
            title="Italic"
            onClick={() => handleToolbar("italic")}
            disabled={disabled || mode === "preview"}
          />
          <ToolDivider />
          <ToolButton
            icon={<Quote size={15} />}
            title="Blockquote"
            onClick={() => handleToolbar("quote")}
            disabled={disabled || mode === "preview"}
          />
          <ToolButton
            icon={<List size={15} />}
            title="Bullet list"
            onClick={() => handleToolbar("ul")}
            disabled={disabled || mode === "preview"}
          />
          <ToolButton
            icon={<ListOrdered size={15} />}
            title="Numbered list"
            onClick={() => handleToolbar("ol")}
            disabled={disabled || mode === "preview"}
          />
          <ToolButton
            icon={<Minus size={15} />}
            title="Divider"
            onClick={() => handleToolbar("hr")}
            disabled={disabled || mode === "preview"}
          />
          <ToolDivider />
          <ToolButton
            icon={
              uploading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <ImagePlus size={15} />
              )
            }
            title="Insert image"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading || mode === "preview"}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/40">
            ≈ {readTime} min read
          </span>
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 transition-colors ${mode === "write" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
            >
              <Pencil size={12} />
              Write
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 transition-colors ${mode === "preview" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
            >
              <Eye size={12} />
              Preview
            </button>
          </div>
        </div>
      </div>

      {uploadError && (
        <p className="text-[12px] text-red-400 mb-2">{uploadError}</p>
      )}

      {mode === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={
            "Write your post here.\n\nUse the toolbar for headings, quotes, lists, and inline images — or type markdown directly (## heading, > quote, - list item, ![caption](image))."
          }
          className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-(--green-mid) transition-colors font-mono leading-relaxed disabled:opacity-50"
        />
      ) : (
        <div
          className="w-full min-h-40 bg-white rounded-xl border border-white/10 px-6 py-5 prose-custom overflow-y-auto"
          style={{ maxHeight: rows * 28 }}
        >
          {value.trim() ? (
            renderMarkdownLite(value)
          ) : (
            <p className="text-[13px] text-(--text-muted) italic">
              Nothing to preview yet.
            </p>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function ToolButton({
  icon,
  title,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center h-8 w-8 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {icon}
    </button>
  );
}

function ToolDivider() {
  return <div className="w-px h-5 bg-white/1 mx-1 self-center" />;
}
