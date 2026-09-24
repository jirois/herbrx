import Image from "next/image";

/**
 * Renders our lightweight markdown subset into JSX: paragraphs, ## and ###
 * headings, > blockquotes, - / 1. lists, --- dividers, ![alt](url) inline
 * images, and **bold** / *italic* / `code` inline formatting.
 *
 * This is the single source of truth for how post content becomes HTML —
 * used by the public post page AND the writer's live preview, so what a
 * writer sees while editing is exactly what gets published.
 */
export function renderMarkdownLite(content: string): React.ReactNode[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Image on its own line: ![alt](url)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)\s*$/);
    if (imgMatch) {
      const [, alt, url] = imgMatch;
      blocks.push(
        <figure key={key++} className="my-8">
          <div
            className="relative w-full rounded-2xl overflow-hidden bg-(--cream-dark)"
            style={{ aspectRatio: "16/9" }}
          >
            <Image
              src={url}
              alt={alt || "Post image"}
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
              unoptimized={url.startsWith("data:") || url.endsWith(".svg")}
            />
          </div>
          {alt && (
            <figcaption className="text-center text-[12px] text-(--text-muted) mt-2 italic">
              {alt}
            </figcaption>
          )}
        </figure>,
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3
          key={key++}
          className="font-serif text-[20px] font-semibold text-(--green-deep) mt-8 mb-3"
        >
          {renderInline(line.slice(4))}
        </h3>,
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2
          key={key++}
          className="font-serif text-[26px] font-semibold text-(--green-deep) mt-10 mb-4"
        >
          {renderInline(line.slice(3))}
        </h2>,
      );
      i++;
      continue;
    }

    if (line.startsWith("> ") || line === ">") {
      const group: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        group.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={key++}
          className="border-l-4 border-(--green-mid) bg-(--green-pale)/30 rounded-r-xl pl-5 pr-4 py-3 my-6 text-(--text-dark) italic text-[15px] leading-relaxed"
        >
          {group.map((l, j) => (
            <p key={j} className={j > 0 ? "mt-2" : ""}>
              {renderInline(l)}
            </p>
          ))}
        </blockquote>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul
          key={key++}
          className="list-disc pl-5 my-4 space-y-1.5 text-[15px] text-(--text-body) leading-relaxed font-light"
        >
          {items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol
          key={key++}
          className="list-decimal pl-5 my-4 space-y-1.5 text-[15px] text-(--text-body) leading-relaxed font-light"
        >
          {items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (line.trim() === "---") {
      blocks.push(<hr key={key++} className="border-(--cream-dark) my-8" />);
      i++;
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph — gather consecutive plain lines until a blank line or a
    // block-level marker, so a hard-wrapped paragraph stays one <p>.
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("## ") &&
      !lines[i].startsWith("### ") &&
      !lines[i].startsWith(">") &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      lines[i].trim() !== "---" &&
      !lines[i].match(/^!\[(.*?)\]\((.*?)\)\s*$/)
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(
      <p
        key={key++}
        className="text-[15px] text-(--text-body) leading-relaxed font-light mb-4"
      >
        {paraLines.map((l, j) => (
          <span key={j}>
            {renderInline(l)}
            {j < paraLines.length - 1 && <br />}
          </span>
        ))}
      </p>,
    );
  }

  return blocks;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.+?\*\*|\*.+?\*|`.+?`)/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={j} className="font-semibold text-(--text-dark)">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={j}
          className="bg-(--cream-dark) text-(--green-deep) px-1.5 py-0.5 rounded text-[13px] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={j}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
