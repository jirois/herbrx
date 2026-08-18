"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "./dashboard-shell";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Loader2,
  ShieldOff,
  Archive,
  DollarSign,
} from "lucide-react";
import { formatNaira, cn } from "@/lib/utils";
import { useAdminDisputes, adminApi } from "@/hooks/dashboard-hooks";

// Static demo disputes — in production pull from Paystack Disputes API
// const DEMO_DISPUTES = [
//   {
//     id: "DSP-001",
//     orderId: "ORD-0012",
//     customer: "Chioma Okafor",
//     email: "chioma@example.com",
//     amount: 4500,
//     reason: "Item not received",
//     status: "pending" as const,
//     date: "2025-06-01",
//     dueDate: "2025-06-15",
//     description:
//       "Customer claims the Liver Cleanse Blend was not delivered despite tracking showing delivered.",
//   },
// ];

type DisputeStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";

const statusConfig: Record<
  DisputeStatus,
  { label: string; class: string; icon: React.ReactNode }
> = {
  OPEN: {
    label: "Open",
    class: "bg-amber-500/15 text-amber-400",
    icon: <Clock size={13} />,
  },
  INVESTIGATING: {
    label: "Investigating",
    class: "bg-blue-500/15  text-blue-400",
    icon: <MessageSquare size={13} />,
  },
  RESOLVED: {
    label: "Resolved",
    class: "bg-green-500/15 text-green-400",
    icon: <CheckCircle size={13} />,
  },
  CLOSED: {
    label: "Closed",
    class: "bg-white/10 text-white/50",
    icon: <ShieldOff size={13} />,
  },
};

const NEXT_STATUS: Record<DisputeStatus, DisputeStatus | null> = {
  OPEN: "INVESTIGATING",
  INVESTIGATING: "RESOLVED",
  RESOLVED: "CLOSED",
  CLOSED: null,
};

export function DisputesPage() {
  const { data, loading, mutate } = useAdminDisputes();
  const disputes = data?.disputes ?? [];
  const counts = data?.counts ?? {
    open: 0,
    resolved: 0,
    closed: 0,
    amountAtRisk: 0,
  };

  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function advance(disputeId: string, next: DisputeStatus) {
    setUpdating(disputeId);
    try {
      await adminApi.updateDispute({ disputeId, status: next });
      await mutate();
    } catch {
      // swallow — the button will just re-enable and the admin can retry
    }
    setUpdating(null);
  }

  return (
    <DashboardShell
      heading="Disputes"
      subheading="Order disputes raised by customers"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Open Disputes",
            value: counts.open.toString(),
            icon: AlertTriangle,
            color: "text-amber-500",
          },
          {
            label: "Resolved",
            value: counts.resolved.toString(),
            icon: CheckCircle,
            color: "text-emerald-500",
          },
          {
            label: "Closed",
            value: counts.closed.toString(),
            icon: Archive,
            color: "text-slate-400",
          },
          {
            label: "Amount at Risk",
            value: formatNaira(counts.amountAtRisk),
            icon: DollarSign,
            color: "text-red-400",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-[#161B27] border border-white/[0.07] rounded-2xl p-5"
          >
            <s.icon size={28} className={cn("mb-3", s.color)} />
            <p className="font-serif text-[24px] font-semibold text-white leading-none mb-1">
              {loading ? "—" : s.value}
            </p>
            <p className="text-[12px] text-white/40">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-(--green-pale)" />
        </div>
      )}

      {!loading && disputes.length === 0 && (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <ShieldOff size={28} className="text-white/20 mx-auto mb-3" />
          <p className="text-[13px] text-white/40">
            No disputes have been raised yet.
          </p>
        </div>
      )}

      {/* Dispute list */}
      <div className="space-y-3">
        {disputes.map((dispute, i) => {
          const st = statusConfig[dispute.status];
          const isExp = expanded === dispute.id;
          const next = NEXT_STATUS[dispute.status];

          return (
            <motion.div
              key={dispute.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#161B27] border border-white/[0.07] rounded-2xl overflow-hidden"
            >
              <div
                onClick={() => setExpanded(isExp ? null : dispute.id)}
                className="flex flex-wrap items-center gap-4 px-6 py-4 cursor-pointer hover:bg-white/2.5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-mono text-[12px] text-white/50">
                      {dispute.id.slice(0, 10)}
                    </p>
                    <span className="text-white/20">·</span>
                    <p className="font-mono text-[12px] text-white/40">
                      Order {dispute.orderId.slice(0, 10)}
                    </p>
                  </div>
                  <p className="text-[14px] font-medium text-white">
                    {dispute.customer}
                  </p>
                  <p className="text-[12px] text-white/40">{dispute.subject}</p>
                </div>

                <div className="text-right sm:text-left">
                  <p className="font-serif text-[16px] font-semibold text-white">
                    {formatNaira(dispute.amount)}
                  </p>
                  <p className="text-[11px] text-white/30">
                    Filed{" "}
                    {new Date(dispute.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>

                <span
                  className={cn(
                    "flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full",
                    st.class,
                  )}
                >
                  {st.icon} {st.label}
                </span>
              </div>

              {isExp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-t border-white/[0.07] px-6 py-5 bg-white/2"
                >
                  <p className="text-[13px] text-white/60 mb-4 leading-relaxed">
                    {dispute.description}
                  </p>
                  {dispute.resolution && (
                    <div className="mb-4 p-3 rounded-xl bg-white/4 border border-white/8">
                      <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">
                        Resolution
                      </p>
                      <p className="text-[13px] text-white/60">
                        {dispute.resolution}
                      </p>
                    </div>
                  )}
                  {next && (
                    <button
                      onClick={() => advance(dispute.id, next)}
                      disabled={updating === dispute.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-(--green-mid)/30 hover:bg-(--green-mid)/50 text-(--green-pale) text-[13px] font-medium transition-all disabled:opacity-50"
                    >
                      {updating === dispute.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <AlertTriangle size={13} />
                      )}
                      Mark as {statusConfig[next].label}
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
