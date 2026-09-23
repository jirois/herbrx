"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Archive,
  User,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useEditorPosts, apiPatch } from "@/hooks/dashboard-hooks";

type PostStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "CHANGES_REQUESTED"
  | "PUBLISHED"
  | "ARCHIVED";

interface Author {
  firstName: string;
  lastName: string;
  email: string;
}

interface EditorPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: PostStatus;
  submittedAt: string | null;
  publishedAt: string | null;
  reviewNotes: string | null;
  author: Author;
}

const TABS: { key: PostStatus; label: string }[] = [
  { key: "PENDING_REVIEW", label: "Review Queue" },
  { key: "PUBLISHED", label: "Published" },
  { key: "CHANGES_REQUESTED", label: "Changes Requested" },
  { key: "ARCHIVED", label: "Archived" },
];

export function EditorDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab =
    (searchParams.get("status") as PostStatus) ?? "PENDING_REVIEW";
  const [tab, setTab] = useState<PostStatus>(
    TABS.some((t) => t.key === initialTab) ? initialTab : "PENDING_REVIEW",
  );
  const { data, loading, error, mutate } = useEditorPosts(tab);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const posts = (data?.posts ?? []) as unknown as EditorPost[];

  function selectTab(key: PostStatus) {
    setTab(key);
    setExpandedId(null);
    setNote("");
    router.replace(`/dashboard/editor?status=${key}`, { scroll: false });
  }

  async function decide(
    postId: string,
    decision: "PUBLISHED" | "CHANGES_REQUESTED" | "ARCHIVED",
  ) {
    if (decision === "CHANGES_REQUESTED" && !note.trim()) {
      alert(
        "Add a note explaining what needs to change before sending it back.",
      );
      return;
    }
    setBusyId(postId);
    try {
      await apiPatch("/api/dashboard/editor/posts", {
        postId,
        decision,
        reviewNote: note || undefined,
      });
      setExpandedId(null);
      setNote("");
      await mutate();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not update this post");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardShell
      heading="Editorial Review"
      subheading="Review posts submitted by writers before they go live on the blog."
    >
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => selectTab(t.key)}
            className={`text-[13px] px-3 py-1.5 rounded-full border transition-colors ${
              tab === t.key
                ? "bg-white text-black border-white"
                : "border-white/15 text-white/60 hover:text-white hover:border-white/30"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-white/50 text-[14px]">Loading…</p>}
      {error && <p className="text-red-400 text-[14px]">{error}</p>}

      {!loading && posts.length === 0 && (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-10 text-center">
          <CheckCircle className="mx-auto mb-3 text-white/30" size={28} />
          <p className="text-white/60 text-[14px]">Nothing here right now.</p>
        </div>
      )}

      <div className="space-y-3">
        {posts.map((post) => {
          const isOpen = expandedId === post.id;
          return (
            <motion.div
              key={post.id}
              layout
              className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden"
            >
              <button
                onClick={() => {
                  setExpandedId(isOpen ? null : post.id);
                  setNote("");
                }}
                className="w-full flex items-start justify-between gap-3 p-4 lg:p-5 text-left"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <StatusPill status={post.status} />
                    <span className="text-[12px] text-white/40">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="font-medium text-[15px] truncate">
                    {post.title}
                  </h3>
                  <p className="flex items-center gap-1.5 text-[12px] text-white/40 mt-1">
                    <User size={11} />
                    {post.author.firstName} {post.author.lastName}
                    {post.submittedAt && (
                      <>
                        {" · Submitted "}
                        {new Date(post.submittedAt).toLocaleDateString(
                          "en-NG",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </>
                    )}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp size={16} className="shrink-0 text-white/40" />
                ) : (
                  <ChevronDown size={16} className="shrink-0 text-white/40" />
                )}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/8"
                  >
                    <div className="p-4 lg:p-5 space-y-4">
                      <p className="text-[13px] text-white/60 italic">
                        {post.excerpt}
                      </p>
                      <div className="max-h-72 overflow-y-auto rounded-xl bg-black/20 p-4 text-[13px] text-white/70 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </div>

                      {post.reviewNotes && post.status !== "PENDING_REVIEW" && (
                        <p className="text-[12px] text-white/40">
                          Last note:{" "}
                          <span className="text-white/60">
                            {post.reviewNotes}
                          </span>
                        </p>
                      )}

                      {post.status === "PENDING_REVIEW" && (
                        <>
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            placeholder="Feedback for the writer (required if requesting changes)"
                            className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-(--green-mid) transition-colors"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => decide(post.id, "PUBLISHED")}
                              disabled={busyId === post.id}
                              className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-xl bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle size={14} />
                              Approve &amp; Publish
                            </button>
                            <button
                              onClick={() =>
                                decide(post.id, "CHANGES_REQUESTED")
                              }
                              disabled={busyId === post.id}
                              className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-50"
                            >
                              <Send size={14} />
                              Request Changes
                            </button>
                          </div>
                        </>
                      )}

                      {post.status === "PUBLISHED" && (
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="text-[13px] font-medium px-4 py-2 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-colors"
                          >
                            View live post
                          </a>
                          <button
                            onClick={() => decide(post.id, "ARCHIVED")}
                            disabled={busyId === post.id}
                            className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors disabled:opacity-50"
                          >
                            <Archive size={14} />
                            Archive
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </DashboardShell>
  );
}

function StatusPill({ status }: { status: PostStatus }) {
  const cfg: Record<
    PostStatus,
    { badge: string; icon: React.ReactNode; label: string }
  > = {
    DRAFT: {
      badge: "bg-white/10 text-white/55",
      icon: <Clock size={12} />,
      label: "Draft",
    },
    PENDING_REVIEW: {
      badge: "bg-amber-500/15 text-amber-400",
      icon: <Clock size={12} />,
      label: "Pending Review",
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
  const c = cfg[status];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${c.badge}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
}
