"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Send, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ImageUploader } from "@/components/ui/image-uploader";
import { blogCategories } from "@/data/blog";
import { useWriterPost, apiPost, apiPatch } from "@/hooks/dashboard-hooks";

interface FormState {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  authorTitle: string;
  readTime: number;
  imageUrl: string | null;
}

const EMPTY: FormState = {
  title: "",
  excerpt: "",
  content: "",
  category: blogCategories.find((c) => c !== "All") ?? "",
  tags: "",
  authorTitle: "",
  readTime: 4,
  imageUrl: null,
};

const categoryOptions = blogCategories.filter((c) => c !== "All");

interface Props {
  /** Omit for a new post; pass the post id to edit an existing one. */
  postId?: string;
}

export function WriterPostForm({ postId }: Props) {
  const router = useRouter();
  const { data, loading: loadingPost } = useWriterPost(postId ?? null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const post = data?.post as
      | (FormState & {
          status: string;
          reviewNotes: string | null;
          tags: string[];
        })
      | undefined;
    if (post) {
      queueMicrotask(() => {
        setForm({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
          authorTitle: post.authorTitle ?? "",
          readTime: post.readTime ?? 4,
          imageUrl: post.imageUrl ?? null,
        });
        setStatus(post.status);
        setReviewNotes(post.reviewNotes ?? null);
      });
    }
  }, [data]);

  function field<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload() {
    return {
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      category: form.category,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      authorTitle: form.authorTitle || null,
      readTime: Number(form.readTime) || 4,
      imageUrl: form.imageUrl,
    };
  }

  async function handleSave(andSubmit: boolean) {
    setErrorMsg(null);
    if (!form.title || !form.excerpt || !form.content || !form.category) {
      setErrorMsg("Title, excerpt, content, and category are required.");
      return;
    }
    if (andSubmit) {
      setSubmitting(true);
    } else {
      setSaving(true);
    }
    try {
      let id = postId;
      if (id) {
        await apiPatch(`/api/dashboard/writer/posts/${id}`, buildPayload());
      } else {
        const res = await apiPost(
          "/api/dashboard/writer/posts",
          buildPayload(),
        );
        id = res.post.id;
      }
      if (andSubmit && id) {
        await apiPost(`/api/dashboard/writer/posts/${id}/submit`, {});
      }
      router.push("/dashboard/writer");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  }

  const locked = status
    ? !["DRAFT", "CHANGES_REQUESTED"].includes(status)
    : false;

  return (
    <DashboardShell
      heading={postId ? "Edit Post" : "New Post"}
      subheading="Write your post, save a draft, then submit it for editorial review when it's ready."
    >
      <Link
        href="/dashboard/writer"
        className="inline-flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white mb-5 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to My Posts
      </Link>

      {loadingPost && postId ? (
        <p className="text-white/50 text-[14px]">Loading…</p>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main fields */}
          <div className="space-y-5">
            {reviewNotes && status === "CHANGES_REQUESTED" && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-[12px] font-semibold text-red-300 uppercase tracking-wide mb-1">
                  Editor requested changes
                </p>
                <p className="text-[13px] text-red-200">{reviewNotes}</p>
              </div>
            )}

            {locked && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-[13px] text-amber-300">
                This post is {status?.toLowerCase().replace("_", " ")} and
                can&apos;t be edited right now.
              </div>
            )}

            <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-4">
              <FieldLabel>Title</FieldLabel>
              <input
                value={form.title}
                disabled={locked}
                onChange={(e) => field("title", e.target.value)}
                placeholder="e.g. 5 Common Herbal Products in Nigeria"
                className={inputCls}
              />

              <FieldLabel>Excerpt</FieldLabel>
              <textarea
                value={form.excerpt}
                disabled={locked}
                onChange={(e) => field("excerpt", e.target.value)}
                rows={2}
                placeholder="A short 1-2 sentence summary shown on the blog listing"
                className={inputCls}
              />

              <FieldLabel>Content</FieldLabel>
              <textarea
                value={form.content}
                disabled={locked}
                onChange={(e) => field("content", e.target.value)}
                rows={16}
                placeholder="Write your post. Separate paragraphs with a blank line."
                className={`${inputCls} font-mono text-[13px] leading-relaxed`}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-4">
              <ImageUploader
                value={form.imageUrl}
                onChange={(url) => field("imageUrl", url)}
                aspectRatio="16/9"
                label="Cover Image"
                theme="dark"
                disabled={locked}
              />

              <FieldLabel>Category</FieldLabel>
              <select
                value={form.category}
                disabled={locked}
                onChange={(e) => field("category", e.target.value)}
                className={inputCls}
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <FieldLabel>Tags (comma-separated)</FieldLabel>
              <input
                value={form.tags}
                disabled={locked}
                onChange={(e) => field("tags", e.target.value)}
                placeholder="safety, herbs, NAFDAC"
                className={inputCls}
              />

              <FieldLabel>Your byline title</FieldLabel>
              <input
                value={form.authorTitle}
                disabled={locked}
                onChange={(e) => field("authorTitle", e.target.value)}
                placeholder="e.g. Herbal Pharmacist"
                className={inputCls}
              />

              <FieldLabel>Read time (minutes)</FieldLabel>
              <input
                type="number"
                min={1}
                max={30}
                value={form.readTime}
                disabled={locked}
                onChange={(e) => field("readTime", Number(e.target.value))}
                className={inputCls}
              />
            </div>

            {errorMsg && (
              <p className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {errorMsg}
              </p>
            )}

            {!locked && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving || submitting}
                  className="flex items-center justify-center gap-2 text-[13px] font-medium px-4 py-2.5 rounded-xl border border-white/15 text-white hover:border-white/30 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving || submitting}
                  className="flex items-center justify-center gap-2 text-[13px] font-medium px-4 py-2.5 rounded-xl bg-(--green-mid) hover:bg-(--green-deep) text-white transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Save &amp; Submit for Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

const inputCls =
  "w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-(--green-mid) transition-colors disabled:opacity-50";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[12px] font-semibold uppercase tracking-wider text-white/50 -mb-2">
      {children}
    </label>
  );
}
