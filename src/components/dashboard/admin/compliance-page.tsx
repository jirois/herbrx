"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useAdminCompliance, adminApi } from "@/hooks/dashboard-hooks";
import {
  Search,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldX,
  Loader2,
  X,
  Mail,
  Phone,
  MapPin,
  Hash,
  Globe,
  ExternalLink,
  Package,
  Calendar,
  BadgeCheck,
} from "lucide-react";

// ── Types ────────
type VStatus =
  | "UNVERIFIED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

interface ComplianceProducer {
  id: string;
  producerUserId: string;
  businessName: string;
  businessEmail: string | null;
  businessPhone: string | null;
  rcNumber: string | null;
  nafdacNumber: string | null;
  state: string | null;
  website: string | null;
  tier: "UNVERIFIED" | "VERIFIED";
  verificationStatus: VStatus;
  verificationNote: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  documents: {
    cacCertUrl: string | null;
    labPartnerUrl: string | null;
    nafdacCertUrl: string | null;
    insuranceUrl: string | null;
  };
  productCount: number;
  contact: {
    name: string;
    email: string;
    phone: string | null;
    joinedAt: string;
  };
}

type Decision = "APPROVED" | "REJECTED" | "UNDER_REVIEW";

const statusConfig: Record<
  VStatus,
  { badge: string; icon: React.ReactNode; label: string; dot: string }
> = {
  UNVERIFIED: {
    badge: "bg-white/10 text-white/50",
    icon: <Clock size={12} />,
    label: "Unverified",
    dot: "bg-white/30",
  },
  SUBMITTED: {
    badge: "bg-amber-500/15 text-amber-400",
    icon: <Clock size={12} />,
    label: "Pending Review",
    dot: "bg-amber-400",
  },
  UNDER_REVIEW: {
    badge: "bg-blue-500/15 text-blue-400",
    icon: <Loader2 size={12} className="animate-spin" />,
    label: "Under Review",
    dot: "bg-blue-400",
  },
  APPROVED: {
    badge: "bg-green-500/15 text-green-400",
    icon: <CheckCircle size={12} />,
    label: "Verified",
    dot: "bg-green-400",
  },
  REJECTED: {
    badge: "bg-red-500/15 text-red-400",
    icon: <XCircle size={12} />,
    label: "Rejected",
    dot: "bg-red-400",
  },
};

const DOC_LABELS: Record<keyof ComplianceProducer["documents"], string> = {
  cacCertUrl: "CAC Certificate",
  labPartnerUrl: "Lab Partnership Letter",
  nafdacCertUrl: "NAFDAC Certificate",
  insuranceUrl: "Insurance Certificate",
};

const inputCls =
  "w-full h-10 px-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[var(--green-mid)] transition-all";

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CompliancePage() {
  const [statusFilter, setStatusFilter] = useState<
    "PENDING" | "APPROVED" | "REJECTED" | "ALL"
  >("PENDING");
  const [search, setSearch] = useState("");
  const {
    data,
    loading,
    mutate: refetch,
  } = useAdminCompliance(statusFilter, search || undefined);

  const producers = (data?.producers ?? []) as unknown as ComplianceProducer[];
  const counts = data?.counts ?? {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  };

  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{
    producer: ComplianceProducer;
    decision: Decision;
  } | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actioning, setActioning] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function applyDecision() {
    if (!actionModal) return;
    if (actionModal.decision === "REJECTED" && !actionNote.trim()) return;
    setActioning(true);
    setActionError(null);
    try {
      await adminApi.reviewVerification({
        producerUserId: actionModal.producer.producerUserId,
        decision: actionModal.decision,
        note: actionNote || undefined,
      });
      await refetch();
      setActionModal(null);
      setActionNote("");
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Failed to apply decision.",
      );
    }
    setActioning(false);
  }

  const decisionConfig: Record<
    Decision,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    APPROVED: {
      label: "Approve Verification",
      color: "bg-green-500/15 text-green-400 border-green-500/25",
      icon: <ShieldCheck size={14} />,
    },
    REJECTED: {
      label: "Reject Application",
      color: "bg-red-500/15 text-red-400 border-red-500/25",
      icon: <ShieldX size={14} />,
    },
    UNDER_REVIEW: {
      label: "Mark Under Review",
      color: "bg-blue-500/15 text-blue-400 border-blue-500/25",
      icon: <Clock size={14} />,
    },
  };

  return (
    <DashboardShell
      heading="Compliance Management"
      subheading="Review producer verification submissions — CAC, NAFDAC, lab partnership, and insurance documents."
    >
      {/* Approve / Reject / Under-review modal */}
      <AnimatePresence>
        {actionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActionModal(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-[#1A2030] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  {decisionConfig[actionModal.decision].icon}
                  <h3 className="text-[15px] font-semibold text-white">
                    {decisionConfig[actionModal.decision].label}
                  </h3>
                </div>
                <button
                  onClick={() => setActionModal(null)}
                  className="text-white/30 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-[13px] text-white/50">
                  Producer:{" "}
                  <span className="text-white font-medium">
                    {actionModal.producer.businessName}
                  </span>
                </p>
                <div>
                  <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-1.5">
                    {actionModal.decision === "REJECTED"
                      ? "Rejection reason (required)"
                      : "Note (optional)"}
                  </label>
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder={
                      actionModal.decision === "REJECTED"
                        ? "e.g. License expired — please upload a CAC certificate issued within the last 12 months."
                        : "Optional note for the producer / audit log…"
                    }
                    rows={3}
                    className={`${inputCls} h-auto py-3 resize-none`}
                  />
                </div>
                {actionError && (
                  <p className="text-[12px] text-red-400">{actionError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setActionModal(null)}
                    className="h-10 px-5 border border-white/10 text-white/50 hover:text-white rounded-xl text-[13px] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyDecision}
                    disabled={
                      actioning ||
                      (actionModal.decision === "REJECTED" &&
                        !actionNote.trim())
                    }
                    className={`flex-1 h-10 border font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${decisionConfig[actionModal.decision].color}`}
                  >
                    {actioning ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Applying…
                      </>
                    ) : (
                      <>Confirm {decisionConfig[actionModal.decision].label}</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {[
          {
            label: "Pending Review",
            value: counts.pending,
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/15",
            status: "PENDING" as const,
          },
          {
            label: "Verified",
            value: counts.approved,
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/15",
            status: "APPROVED" as const,
          },
          {
            label: "Rejected",
            value: counts.rejected,
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/15",
            status: "REJECTED" as const,
          },
          {
            label: "All Producers",
            value: counts.total,
            color: "text-white",
            bg: "bg-white/[0.04] border-white/[0.07]",
            status: "ALL" as const,
          },
        ].map((kpi) => (
          <button
            key={kpi.label}
            onClick={() => setStatusFilter(kpi.status)}
            className={`text-left rounded-2xl border p-4 transition-all ${kpi.bg} ${statusFilter === kpi.status ? "ring-2 ring-white/20" : "hover:border-white/20"}`}
          >
            <p className={`text-[24px] font-semibold ${kpi.color}`}>
              {kpi.value}
            </p>
            <p className="text-[12px] text-white/40 mt-0.5">{kpi.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search business name, RC number, email…"
          className={`${inputCls} pl-9`}
        />
      </div>

      {/* Loading */}
      {loading && producers.length === 0 && (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-(--green-pale)" />
        </div>
      )}

      {/* Empty state */}
      {!loading && producers.length === 0 && (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <BadgeCheck size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-[14px] text-white/40">
            {statusFilter === "PENDING"
              ? "No verification requests waiting for review."
              : "No producers match this filter."}
          </p>
        </div>
      )}

      {/* Queue */}
      <div className="space-y-3">
        {producers.map((p) => {
          const sc = statusConfig[p.verificationStatus];
          const isOpen = expanded === p.id;
          const isPending = ["SUBMITTED", "UNDER_REVIEW"].includes(
            p.verificationStatus,
          );
          const docsList = (
            Object.entries(p.documents) as [
              keyof ComplianceProducer["documents"],
              string | null,
            ][]
          ).filter(([, url]) => !!url);

          return (
            <motion.div
              key={p.id}
              layout
              className={`rounded-2xl border bg-white/3 overflow-hidden ${p.verificationStatus === "SUBMITTED" ? "border-amber-500/15" : "border-white/[0.07]"}`}
            >
              <div className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center shrink-0">
                  <Building2 size={17} className="text-white/50" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-semibold text-white truncate">
                      {p.businessName}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${sc.badge}`}
                    >
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-1 text-[12px] text-white/40">
                    <span className="flex items-center gap-1">
                      <Mail size={11} /> {p.contact.email}
                    </span>
                    {p.state && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {p.state}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> Submitted {fmtDate(p.submittedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package size={11} /> {p.productCount} products
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setExpanded(isOpen ? null : p.id)}
                    className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all"
                  >
                    {isOpen ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                  {isPending && (
                    <>
                      <button
                        onClick={() =>
                          setActionModal({ producer: p, decision: "APPROVED" })
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/15 transition-colors"
                      >
                        <CheckCircle size={11} /> Approve
                      </button>
                      <button
                        onClick={() =>
                          setActionModal({ producer: p, decision: "REJECTED" })
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15 transition-colors"
                      >
                        <XCircle size={11} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Rejection note banner */}
              {p.verificationStatus === "REJECTED" && p.verificationNote && (
                <div className="mx-5 mb-3 flex items-start gap-2.5 p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                  <AlertTriangle
                    size={13}
                    className="text-red-400 shrink-0 mt-0.5"
                  />
                  <p className="text-[12px] text-white/60 leading-relaxed">
                    {p.verificationNote}
                  </p>
                </div>
              )}

              {/* Expanded detail — business info + documents */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-white/6 pt-4">
                      {/* Business details */}
                      <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2">
                        Business Details
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        {[
                          {
                            label: "RC / CAC Number",
                            value: p.rcNumber ?? "—",
                            icon: Hash,
                          },
                          {
                            label: "NAFDAC Number",
                            value: p.nafdacNumber ?? "Not provided",
                            icon: FileText,
                          },
                          {
                            label: "Business Phone",
                            value: p.businessPhone ?? p.contact.phone ?? "—",
                            icon: Phone,
                          },
                          {
                            label: "Website",
                            value: p.website ?? "—",
                            icon: Globe,
                          },
                          {
                            label: "State of Operation",
                            value: p.state ?? "—",
                            icon: MapPin,
                          },
                          {
                            label: "Contact Person",
                            value: p.contact.name || "—",
                            icon: Building2,
                          },
                          {
                            label: "Producer Since",
                            value: fmtDate(p.contact.joinedAt),
                            icon: Calendar,
                          },
                          {
                            label: "Current Tier",
                            value:
                              p.tier === "VERIFIED"
                                ? "Tier 2 — Verified"
                                : "Tier 1 — Unverified",
                            icon: BadgeCheck,
                          },
                        ].map((f) => (
                          <div
                            key={f.label}
                            className="bg-white/4 border border-white/6 rounded-xl p-3"
                          >
                            <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                              <f.icon size={10} /> {f.label}
                            </p>
                            <p className="text-[13px] font-medium text-white truncate">
                              {f.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Documents */}
                      <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2">
                        Submitted Documents
                      </p>
                      {docsList.length === 0 ? (
                        <p className="text-[12px] text-white/30 mb-4">
                          No documents on file.
                        </p>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-2 mb-4">
                          {docsList.map(([key, url]) => (
                            <a
                              key={key}
                              href={url ?? "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/6 hover:border-white/20 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-(--green-mid)/15 flex items-center justify-center shrink-0">
                                <FileText
                                  size={14}
                                  className="text-(--green-pale)"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-white truncate">
                                  {DOC_LABELS[key]}
                                </p>
                                <p className="text-[11px] text-white/35">
                                  View document
                                </p>
                              </div>
                              <ExternalLink
                                size={12}
                                className="text-white/25 group-hover:text-white/60 shrink-0"
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {isPending && (
                          <>
                            <button
                              onClick={() =>
                                setActionModal({
                                  producer: p,
                                  decision: "APPROVED",
                                })
                              }
                              className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors"
                            >
                              <CheckCircle size={13} /> Approve Verification
                            </button>
                            <button
                              onClick={() =>
                                setActionModal({
                                  producer: p,
                                  decision: "REJECTED",
                                })
                              }
                              className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                            >
                              <XCircle size={13} /> Reject Application
                            </button>
                            {p.verificationStatus === "SUBMITTED" && (
                              <button
                                onClick={() =>
                                  setActionModal({
                                    producer: p,
                                    decision: "UNDER_REVIEW",
                                  })
                                }
                                className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                              >
                                <Clock size={13} /> Mark Under Review
                              </button>
                            )}
                          </>
                        )}
                        {p.verificationStatus === "REJECTED" && (
                          <button
                            onClick={() =>
                              setActionModal({
                                producer: p,
                                decision: "UNDER_REVIEW",
                              })
                            }
                            className="inline-flex items-center gap-1.5 text-[12px] font-medium px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                          >
                            <Clock size={13} /> Re-open for Review
                          </button>
                        )}
                      </div>
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
