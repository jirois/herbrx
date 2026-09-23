"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PenSquare,
  Clock,
  CheckCircle,
  XCircle,
  Edit3,
  Send,
  Trash2,
  AlertCircle,
  FileText,
  Eye,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useWriterPosts, apiPost, apiDelete } from "@/hooks/dashboard-hooks";

type PostStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "CHANGES_REQUESTED"
  | "PUBLISHED"
  | "ARCHIVED";

interface WriterPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: PostStatus;
  reviewNotes: string | null;
  updatedAt: string;
  publishedAt: string | null;
  readTime: number;
}

const statusConfig: Record<
  PostStatus,
  { badge: string; icon: React.ReactNode; label: string }
> = {
  DRAFT: {
    badge: "bg-white/10 text-white/55",
    icon: <Edit3 size={12} />,
    label: "Draft",
  },
  PENDING_REVIEW: {
    badge: "bg-amber-500/15 text-amber-400",
    icon: <Clock size={12} />,
    label: "In Review",
  },
  CHANGES_REQUESTED: {
    badge: "bg-red-500/15 text-red-400",
    icon: <AlertCircle size={12} />,
    label: "Changes Requested",
  },
  PUBLISHED: {
    badge: "bg-green-500/15 text-green-400",
    icon: <CheckCircle size={12} />,
    label: "Published",
  },
  ARCHIVED: {
    badge: "bg-white/10 text-white/40",
    icon: <XCircle size={12} />,
    label: "Archived",
  },
};

const FILTERS: { key: "ALL" | PostStatus; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: "Drafts" },
  { key: "PENDING_REVIEW", label: "In Review" },
  { key: "CHANGES_REQUESTED", label: "Changes Requested" },
  { key: "PUBLISHED", label: "Published" },
];

export function WriterDashboard() {
  const { data, loading, error, mutate } = useWriterPosts();
  const [filter, setFilter] = useState<"ALL" | PostStatus>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const posts = (data?.posts ?? []) as unknown as WriterPost[];
  const filtered =
    filter === "ALL" ? posts : posts.filter((p) => p.status === filter);

  const counts = {
    DRAFT: posts.filter((p) => p.status === "DRAFT").length,
    PENDING_REVIEW: posts.filter((p) => p.status === "PENDING_REVIEW").length,
    PUBLISHED: posts.filter((p) => p.status === "PUBLISHED").length,
  };

  async function handleSubmit(id: string) {
    setBusyId(id);
    try {
      await apiPost(`/api/dashboard/writer/posts/${id}/submit`, {});
      await mutate();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not submit for review");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post? This can't be undone.")) return;
    setBusyId(id);
    try {
      await apiDelete(`/api/dashboard/writer/posts/${id}`);
      await mutate();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not delete post");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardShell
      heading="My Posts"
      subheading="Write, submit, and track your blog posts through editorial review."
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Drafts", value: counts.DRAFT, icon: <Edit3 size={16} /> },
          {
            label: "In Review",
            value: counts.PENDING_REVIEW,
            icon: <Clock size={16} />,
          },
          {
            label: "Published",
            value: counts.PUBLISHED,
            icon: <CheckCircle size={16} />,
          },
          {
            label: "Total Posts",
            value: posts.length,
            icon: <FileText size={16} />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/8 bg-white/3 p-4"
          >
            <div className="flex items-center gap-2 text-white/50 text-[12px] mb-2">
              {s.icon}
              {s.label}
            </div>
            <div className="text-[24px] font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[13px] px-3 py-1.5 rounded-full border transition-colors ${
                filter === f.key
                  ? "bg-white text-black border-white"
                  : "border-white/15 text-white/60 hover:text-white hover:border-white/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Link
          href="/dashboard/writer/new"
          className="flex items-center gap-2 text-[13px] font-medium bg-(--green-mid) hover:bg-(--green-deep) text-white px-4 py-2 rounded-xl transition-colors"
        >
          <PenSquare size={14} />
          New Post
        </Link>
      </div>

      {loading && (
        <p className="text-white/50 text-[14px]">Loading your posts…</p>
      )}
      {error && <p className="text-red-400 text-[14px]">{error}</p>}

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-10 text-center">
          <FileText className="mx-auto mb-3 text-white/30" size={28} />
          <p className="text-white/60 text-[14px]">
            {filter === "ALL"
              ? "You haven't written any posts yet."
              : "Nothing here yet."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((post, i) => {
          const cfg = statusConfig[post.status];
          const canEdit =
            post.status === "DRAFT" || post.status === "CHANGES_REQUESTED";
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-white/8 bg-white/3 p-4 lg:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </span>
                    <span className="text-[12px] text-white/40">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="font-medium text-[15px] truncate">
                    {post.title}
                  </h3>
                  <p className="text-[12px] text-white/40 mt-1">
                    Updated{" "}
                    {new Date(post.updatedAt).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {post.readTime} min read
                  </p>
                  {post.status === "CHANGES_REQUESTED" && post.reviewNotes && (
                    <div className="mt-2 flex items-start gap-2 text-[12px] text-red-300 bg-red-500/10 border border-red-500/15 rounded-lg px-3 py-2 max-w-140">
                      <AlertCircle size={13} className="shrink-0 mt-0.5" />
                      <span>{post.reviewNotes}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {post.status === "PUBLISHED" && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-colors"
                    >
                      <Eye size={13} />
                      View
                    </Link>
                  )}
                  {canEdit && (
                    <Link
                      href={`/dashboard/writer/${post.id}`}
                      className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-colors"
                    >
                      <Edit3 size={13} />
                      Edit
                    </Link>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => handleSubmit(post.id)}
                      disabled={busyId === post.id}
                      className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-(--green-mid) hover:bg-(--green-deep) text-white transition-colors disabled:opacity-50"
                    >
                      <Send size={13} />
                      {post.status === "CHANGES_REQUESTED"
                        ? "Resubmit"
                        : "Submit for Review"}
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={busyId === post.id}
                      className="flex items-center justify-center h-8 w-8 rounded-lg border border-white/15 text-white/50 hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
