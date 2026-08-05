"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useConsultantOverview, consultantApi } from "@/hooks/dashboard-hooks";
import {
  Bell,
  Users,
  Wallet,
  Star,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  BadgeCheck,
  ShieldOff,
  Loader2,
  Stethoscope,
  MessageSquare,
} from "lucide-react";

// ── Formatting helpers ────
const naira = (kobo: number) =>
  `₦${(kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const specializationLabel: Record<string, string> = {
  HERBALIST: "Herbalist",
  NATUROPATH: "Naturopath",
  TOXICOLOGIST: "Toxicologist",
  PHARMACIST: "Pharmacist",
};

const notifIcon: Record<string, React.ReactNode> = {
  NEW_BOOKING: <CalendarClock size={14} className="text-blue-400" />,
  CANCELLED: <XCircle size={14} className="text-red-400" />,
  RESCHEDULED: <RefreshCw size={14} className="text-amber-400" />,
  REMINDER: <Clock size={14} className="text-white/50" />,
};

const cardCls = "rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5";

type FeedbackItem = {
  id: string;
  rating: number;
  feedback?: string;
  user: {
    firstName: string;
    lastName: string;
  };
};

// ── Main component ──────
export function ConsultantDashboard() {
  const { data, loading, error, mutate } = useConsultantOverview();
  const [markingAll, setMarkingAll] = useState(false);

  if (loading && !data) {
    return (
      <DashboardShell
        heading="Consultant Dashboard"
        subheading="Loading your overview…"
      >
        <div className="p-8 text-center text-white/40 text-[13px]">
          <Loader2 size={18} className="animate-spin inline-block mr-2" />{" "}
          Loading your dashboard…
        </div>
      </DashboardShell>
    );
  }

  if (error || !data) {
    return (
      <DashboardShell
        heading="Consultant Dashboard"
        subheading="Something went wrong"
      >
        <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/10 text-[13px] text-red-300">
          Couldn&apos;t load your dashboard. {error ?? "Please refresh."}
        </div>
      </DashboardShell>
    );
  }

  const { profile, queue, notifications, earnings, rating } = data;
  const recentFeedback = rating.recentFeedback as FeedbackItem[];

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await consultantApi.markAllNotificationsRead();
      await mutate();
    } finally {
      setMarkingAll(false);
    }
  }

  async function markOneRead(id: string) {
    await consultantApi.markNotificationRead(id);
    mutate();
  }

  return (
    <DashboardShell
      heading={`Welcome back, ${profile.firstName}`}
      subheading="Here's what's happening with your consultations today."
    >
      {profile.status === "INACTIVE" && (
        <div className="flex items-center gap-2 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-[13px] text-red-300 mb-6">
          <ShieldOff size={15} />
          Your account has been deactivated by an admin. You can view your
          history but can&apos;t take new bookings until it&apos;s reactivated.
        </div>
      )}
      {profile.mustResetPassword === true && (
        <div className="flex items-center gap-2 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-[13px] text-amber-300 mb-6">
          <BadgeCheck size={15} />
          You&apos;re using a temporary password. Update it from your profile
          settings.
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Clients Waiting Today",
            value: String(queue.today),
            icon: <Users size={16} />,
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/15",
          },
          {
            label: "Unread Notifications",
            value: String(notifications.unreadCount),
            icon: <Bell size={16} />,
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/15",
          },
          {
            label: "Earnings This Month",
            value: naira(earnings.thisMonthKobo),
            icon: <Wallet size={16} />,
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/15",
          },
          {
            label: "Average Rating",
            value: rating.average ? rating.average.toFixed(1) : "—",
            icon: <Star size={16} />,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10 border-yellow-500/15",
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl border p-5 ${k.bg}`}
          >
            <div
              className={`flex items-center justify-between mb-2 ${k.color}`}
            >
              {k.icon}
            </div>
            <div className={`text-[26px] font-serif font-semibold ${k.color}`}>
              {k.value}
            </div>
            <div className="text-[12px] text-white/40 mt-0.5">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Notifications feed */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardCls} lg:col-span-2`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-white/50" />
              <h3 className="text-[14px] font-semibold text-white">
                Meeting Notifications
              </h3>
            </div>
            {notifications.unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="text-[11px] text-(--green-pale) hover:text-white transition-colors disabled:opacity-50"
              >
                {markingAll ? "Marking…" : "Mark all read"}
              </button>
            )}
          </div>
          {notifications.items.length === 0 ? (
            <p className="text-[13px] text-white/35 text-center py-8">
              No notifications yet. New bookings, cancellations, and reschedules
              will show up here.
            </p>
          ) : (
            <div className="space-y-2">
              {(
                notifications.items as {
                  id: string;
                  type:
                    | "NEW_BOOKING"
                    | "CANCELLED"
                    | "RESCHEDULED"
                    | "REMINDER"
                    | string;
                  title: string;
                  body: string;
                  createdAt: string;
                  isRead: boolean;
                }[]
              ).map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && markOneRead(n.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${n.isRead ? "bg-white/2" : "bg-white/6 hover:bg-white/9"}`}
                >
                  <div className="w-7 h-7 rounded-lg bg-white/6 flex items-center justify-center shrink-0 mt-0.5">
                    {notifIcon[n.type] ?? (
                      <Bell size={14} className="text-white/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium text-white">
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-(--green-mid) shrink-0" />
                      )}
                    </div>
                    <p className="text-[12px] text-white/45 mt-0.5">{n.body}</p>
                    <p className="text-[11px] text-white/25 mt-1">
                      {new Date(n.createdAt).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Profile summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cardCls}
        >
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope size={15} className="text-white/50" />
            <h3 className="text-[14px] font-semibold text-white">
              Profile Summary
            </h3>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-(--green-mid)/20 border border-(--green-mid)/30 flex items-center justify-center text-[15px] font-semibold text-(--green-pale) shrink-0">
              {typeof profile.firstName === "string"
                ? profile.firstName[0]
                : ""}
              {typeof profile.lastName === "string" ? profile.lastName[0] : ""}
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-white truncate">
                {typeof profile.firstName === "string" ? profile.firstName : ""}
                {typeof profile.lastName === "string"
                  ? ` ${profile.lastName}`
                  : ""}
              </p>
              <p className="text-[12px] text-white/40 truncate">
                {typeof profile.email === "string" ? profile.email : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/6 text-white/70">
              {typeof profile.specialization === "string"
                ? (specializationLabel[profile.specialization] ??
                  profile.specialization)
                : ""}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${
                profile.status === "ACTIVE"
                  ? "bg-green-500/15 text-green-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {profile.status === "ACTIVE" ? (
                <CheckCircle2 size={11} />
              ) : (
                <ShieldOff size={11} />
              )}
              {profile.status === "ACTIVE" ? "Active" : "Inactive"}
            </span>
          </div>
          {typeof profile.bio === "string" && profile.bio ? (
            <p className="text-[12px] text-white/50 leading-relaxed">
              {profile.bio}
            </p>
          ) : (
            <p className="text-[12px] text-white/25 italic">
              No bio added yet.
            </p>
          )}
          {typeof profile.yearsExperience === "number" && (
            <p className="text-[11px] text-white/35 mt-3">
              {profile.yearsExperience} years of experience
            </p>
          )}
        </motion.div>

        {/* Financial analytics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cardCls}
        >
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={15} className="text-white/50" />
            <h3 className="text-[14px] font-semibold text-white">
              Financial Analytics
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-white/45">This month</span>
              <span className="text-[14px] font-semibold text-green-400">
                {naira(earnings.thisMonthKobo)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-white/45">Pending balance</span>
              <span className="text-[14px] font-semibold text-amber-400">
                {naira(earnings.pendingKobo)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/6">
              <span className="text-[12px] text-white/45">Total paid out</span>
              <span className="text-[14px] font-semibold text-white">
                {naira(earnings.totalPaidOutKobo)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Ratings & feedback */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`${cardCls} lg:col-span-2`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Star size={15} className="text-white/50" />
            <h3 className="text-[14px] font-semibold text-white">
              Client Feedback &amp; Ratings
            </h3>
            {rating.count > 0 && (
              <span className="text-[11px] text-white/35 ml-auto">
                {rating.count} rated session{rating.count !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {recentFeedback.length === 0 ? (
            <p className="text-[13px] text-white/35 text-center py-6">
              No client ratings yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentFeedback.map((f) => (
                <div
                  key={f.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/6"
                >
                  <MessageSquare
                    size={14}
                    className="text-white/30 shrink-0 mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-medium text-white">
                        {f.user.firstName} {f.user.lastName}
                      </p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={
                              i < f.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-white/15"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    {f.feedback && (
                      <p className="text-[12px] text-white/50 mt-1">
                        {f.feedback}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardShell>
  );
}
