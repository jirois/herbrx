"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useConsultantQueue, consultantApi } from "@/hooks/dashboard-hooks";
import {
  CalendarClock,
  Loader2,
  Mail,
  Phone,
  Video,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  StickyNote,
} from "lucide-react";

const specializationLabel: Record<string, string> = {
  HERBALIST: "Herbalist",
  NATUROPATH: "Naturopath",
  TOXICOLOGIST: "Toxicologist",
  PHARMACIST: "Pharmacist",
};

const statusStyle: Record<string, string> = {
  REQUESTED: "bg-amber-500/15 text-amber-400",
  CONFIRMED: "bg-blue-500/15 text-blue-400",
  COMPLETED: "bg-green-500/15 text-green-400",
  CANCELLED: "bg-red-500/15 text-red-400",
};

interface QueueItem {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  type: string;
  status: "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  scheduledAt: string | null;
  meetingUrl: string | null;
  notes: string | null;
}

type Scope = "today" | "upcoming" | "all";

const TABS: { scope: Scope; label: string }[] = [
  { scope: "today", label: "Today" },
  { scope: "upcoming", label: "Upcoming" },
  { scope: "all", label: "All Appointments" },
];

function formatWhen(iso: string | null) {
  if (!iso) return "Time not set";
  return new Date(iso).toLocaleString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ConsultantAppointmentsPage() {
  const [scope, setScope] = useState<Scope>("today");
  const { data, loading, error, mutate } = useConsultantQueue(scope);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleValue, setRescheduleValue] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const items = (data?.queue ?? []) as unknown as QueueItem[];

  async function runAction(
    id: string,
    action: "CONFIRM" | "COMPLETE" | "CANCEL" | "RESCHEDULE",
    scheduledAt?: string,
  ) {
    setBusyId(id);
    setActionError(null);
    try {
      await consultantApi.updateQueueItem(id, action, scheduledAt);
      setReschedulingId(null);
      await mutate();
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Couldn't update this appointment.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardShell
      heading="Appointments"
      subheading="Manage your consultation requests, confirmed sessions, and history."
    >
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/[0.07]">
        {TABS.map((t) => (
          <button
            key={t.scope}
            onClick={() => setScope(t.scope)}
            className={`px-3.5 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
              scope === t.scope
                ? "border-(--green-mid) text-white"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 mb-5">
          <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-[13px] text-red-300">{actionError}</p>
        </div>
      )}

      {loading && !data ? (
        <div className="p-8 text-center text-white/40 text-[13px]">
          <Loader2 size={18} className="animate-spin inline-block mr-2" />
          Loading appointments…
        </div>
      ) : error ? (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl border border-red-500/20 bg-red-500/10">
          <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[13px] text-red-300">
              Couldn&apos;t load your appointments: {error}
            </p>
            <button
              onClick={() => mutate()}
              className="text-[12px] text-red-300 underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-white/8 bg-white/3">
          <CalendarClock size={22} className="mx-auto text-white/25 mb-3" />
          <p className="text-[13px] text-white/40">
            {scope === "today"
              ? "Nothing on your schedule today."
              : scope === "upcoming"
                ? "No upcoming appointments yet."
                : "No appointment history yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const busy = busyId === item.id;
            const isRescheduling = reschedulingId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-white/8 bg-white/3 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[14px] font-semibold text-white">
                        {item.clientName}
                      </p>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyle[item.status] ?? "bg-white/10 text-white/50"}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-white/40">
                      {specializationLabel[item.type] ?? item.type} consultation
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-white/50">
                    <Clock size={13} />
                    {formatWhen(item.scheduledAt)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-3 text-[12px] text-white/40">
                  <span className="flex items-center gap-1.5">
                    <Mail size={12} /> {item.clientEmail}
                  </span>
                  {item.clientPhone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={12} /> {item.clientPhone}
                    </span>
                  )}
                </div>

                {item.notes && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-white/4 mb-4">
                    <StickyNote
                      size={13}
                      className="text-white/30 shrink-0 mt-0.5"
                    />
                    <p className="text-[12px] text-white/55 leading-relaxed">
                      {item.notes}
                    </p>
                  </div>
                )}

                {isRescheduling ? (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/6">
                    <input
                      type="datetime-local"
                      value={rescheduleValue}
                      onChange={(e) => setRescheduleValue(e.target.value)}
                      className="px-3 py-2 bg-white/6 border border-white/10 rounded-lg text-[13px] text-white outline-none focus:border-(--green-mid)"
                    />
                    <button
                      disabled={!rescheduleValue || busy}
                      onClick={() =>
                        runAction(
                          item.id,
                          "RESCHEDULE",
                          new Date(rescheduleValue).toISOString(),
                        )
                      }
                      className="h-9 px-4 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-40 text-white text-[13px] font-medium rounded-lg transition-colors"
                    >
                      {busy ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        "Save new time"
                      )}
                    </button>
                    <button
                      onClick={() => setReschedulingId(null)}
                      className="h-9 px-3 text-white/40 hover:text-white text-[13px] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/6">
                    {item.meetingUrl &&
                      (item.status === "REQUESTED" ||
                        item.status === "CONFIRMED") && (
                        <a
                          href={item.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 h-9 px-4 bg-(--green-mid) hover:bg-(--green-light) text-white text-[13px] font-medium rounded-lg transition-colors"
                        >
                          <Video size={13} /> Join Meeting
                        </a>
                      )}

                    {item.status === "REQUESTED" && (
                      <>
                        <button
                          disabled={busy}
                          onClick={() => runAction(item.id, "CONFIRM")}
                          className="flex items-center gap-1.5 h-9 px-4 border border-white/10 hover:bg-white/6 disabled:opacity-40 text-white text-[13px] font-medium rounded-lg transition-colors"
                        >
                          {busy ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          Confirm
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => runAction(item.id, "CANCEL")}
                          className="flex items-center gap-1.5 h-9 px-4 text-red-300/80 hover:text-red-300 disabled:opacity-40 text-[13px] transition-colors"
                        >
                          <XCircle size={13} /> Decline
                        </button>
                      </>
                    )}

                    {item.status === "CONFIRMED" && (
                      <>
                        <button
                          disabled={busy}
                          onClick={() => runAction(item.id, "COMPLETE")}
                          className="flex items-center gap-1.5 h-9 px-4 border border-white/10 hover:bg-white/6 disabled:opacity-40 text-white text-[13px] font-medium rounded-lg transition-colors"
                        >
                          {busy ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          Mark Completed
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => {
                            setReschedulingId(item.id);
                            setRescheduleValue("");
                          }}
                          className="flex items-center gap-1.5 h-9 px-4 text-white/50 hover:text-white disabled:opacity-40 text-[13px] transition-colors"
                        >
                          <RefreshCw size={13} /> Reschedule
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => runAction(item.id, "CANCEL")}
                          className="flex items-center gap-1.5 h-9 px-4 text-red-300/80 hover:text-red-300 disabled:opacity-40 text-[13px] transition-colors"
                        >
                          <XCircle size={13} /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
