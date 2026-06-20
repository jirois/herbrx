"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardShell } from "./dashboard-shell";
import { AlertTriangle, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { formatNaira, cn } from "@/lib/utils";

// Static demo disputes — in production pull from Paystack Disputes API
const DEMO_DISPUTES = [
  {
    id: "DSP-001",
    orderId: "ORD-0012",
    customer: "Chioma Okafor",
    email: "chioma@example.com",
    amount: 4500,
    reason: "Item not received",
    status: "pending" as const,
    date: "2025-06-01",
    dueDate: "2025-06-15",
    description:
      "Customer claims the Liver Cleanse Blend was not delivered despite tracking showing delivered.",
  },
  {
    id: "DSP-002",
    orderId: "ORD-0034",
    customer: "Emeka Nwosu",
    email: "emeka@example.com",
    amount: 6200,
    reason: "Product not as described",
    status: "under_review" as const,
    date: "2025-05-28",
    dueDate: "2025-06-11",
    description:
      "Customer received product but says capsule count was less than advertised (90 count).",
  },
  {
    id: "DSP-003",
    orderId: "ORD-0007",
    customer: "Amina Yusuf",
    email: "amina@example.com",
    amount: 3800,
    reason: "Duplicate charge",
    status: "won" as const,
    date: "2025-05-10",
    dueDate: "2025-05-24",
    description:
      "Customer was charged twice. Bank error confirmed. Refund processed.",
  },
  {
    id: "DSP-004",
    orderId: "ORD-0019",
    customer: "Tokunbo Adeyemi",
    email: "tokunbo@example.com",
    amount: 5400,
    reason: "Unauthorised transaction",
    status: "lost" as const,
    date: "2025-04-22",
    dueDate: "2025-05-06",
    description:
      "Cardholder claims they did not authorise the transaction. Chargeback upheld.",
  },
];

type DisputeStatus = (typeof DEMO_DISPUTES)[0]["status"];

const statusConfig: Record<
  DisputeStatus,
  { label: string; class: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Awaiting Response",
    class: "bg-amber-500/15 text-amber-400",
    icon: <Clock size={13} />,
  },
  under_review: {
    label: "Under Review",
    class: "bg-blue-500/15  text-blue-400",
    icon: <MessageSquare size={13} />,
  },
  won: {
    label: "Won",
    class: "bg-green-500/15 text-green-400",
    icon: <CheckCircle size={13} />,
  },
  lost: {
    label: "Lost",
    class: "bg-red-500/15   text-red-400",
    icon: <AlertTriangle size={13} />,
  },
};

export function DisputesPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const open = DEMO_DISPUTES.filter(
    (d) => d.status === "pending" || d.status === "under_review",
  ).length;
  const won = DEMO_DISPUTES.filter((d) => d.status === "won").length;
  const lost = DEMO_DISPUTES.filter((d) => d.status === "lost").length;
  const atRisk = DEMO_DISPUTES.filter((d) => d.status !== "won").reduce(
    (s, d) => s + d.amount,
    0,
  );

  return (
    <DashboardShell
      heading="Disputes"
      subheading="Chargebacks and payment disputes from your customers"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Open Disputes",
            value: open.toString(),
            icon: "⚠️",
            accent: "gold" as const,
          },
          {
            label: "Won",
            value: won.toString(),
            icon: "✅",
            accent: "green" as const,
          },
          {
            label: "Lost",
            value: lost.toString(),
            icon: "❌",
            accent: "red" as const,
          },
          {
            label: "Amount at Risk",
            value: formatNaira(atRisk),
            icon: "💸",
            accent: "gold" as const,
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-[#161B27] border border-white/[0.07] rounded-2xl p-5"
          >
            <div className="text-[24px] mb-3">{s.icon}</div>
            <p className="font-serif text-[24px] font-semibold text-white leading-none mb-1">
              {s.value}
            </p>
            <p className="text-[12px] text-white/40">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl px-5 py-4 mb-6 text-[13px] text-amber-300/70">
        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <p>
          You have{" "}
          <strong className="text-amber-300">
            {open} open dispute{open !== 1 ? "s" : ""}
          </strong>{" "}
          requiring a response. Respond before the due date to improve your
          chance of winning. Evidence can be uploaded on the Paystack dashboard.
        </p>
      </div>

      {/* Dispute list */}
      <div className="space-y-3">
        {DEMO_DISPUTES.map((dispute, i) => {
          const st = statusConfig[dispute.status];
          const isExp = expanded === dispute.id;
          const overdue =
            new Date(dispute.dueDate) < new Date() &&
            dispute.status === "pending";

          return (
            <motion.div
              key={dispute.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[#161B27] border border-white/[0.07] rounded-2xl overflow-hidden"
            >
              <div
                onClick={() => setExpanded(isExp ? null : dispute.id)}
                className="flex flex-wrap items-center gap-4 px-6 py-4 cursor-pointer hover:bg-white/2.5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-mono text-[12px] text-white/50">
                      {dispute.id}
                    </p>
                    <span className="text-white/20">·</span>
                    <p className="font-mono text-[12px] text-white/40">
                      {dispute.orderId}
                    </p>
                    {overdue && (
                      <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">
                        OVERDUE
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] font-medium text-white">
                    {dispute.customer}
                  </p>
                  <p className="text-[12px] text-white/40">{dispute.reason}</p>
                </div>

                <div className="text-right sm:text-left">
                  <p className="font-serif text-[16px] font-semibold text-white">
                    {formatNaira(dispute.amount)}
                  </p>
                  <p className="text-[11px] text-white/30">
                    Due:{" "}
                    {new Date(dispute.dueDate).toLocaleDateString("en-NG", {
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
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://dashboard.paystack.com/#/disputes"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-r(--green-mid)/30 hover:bg-(--green-mid)/50 text-(--green-pale) text-[13px] font-medium transition-all"
                    >
                      Respond on Paystack ↗
                    </a>
                    <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-white/50 text-[13px] hover:text-white hover:border-white/20 transition-all">
                      View Order Details
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
