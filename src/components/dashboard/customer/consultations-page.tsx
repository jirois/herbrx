"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  useConsultations,
  customerApi,
  useConsultantDirectory,
  useConsultantAvailability,
} from "@/hooks/dashboard-hooks";
import { BOOKABLE_DAYS_AHEAD, isWorkingDay } from "@/lib/booking-config";
import {
  Calendar,
  Clock,
  Video,
  Star,
  ArrowRight,
  Loader2,
  User,
  Stethoscope,
  Leaf,
  FlaskConical,
  Pill,
  AlertTriangle,
} from "lucide-react";
import type { ConsultationType, ConsultationStatus } from "@/types";
import { BookingFlow } from "@/components/ui/booking-step";

// ── Types ─────
interface Practitioner {
  id: string;
  name: string;
  title: string;
  type: ConsultationType;
  specialties: string[];
  rating: number;
  reviewCount: number;
  bio: string;
  languages: string[];
  nextAvailable: string;
  price: number;
  initials: string;
  color: string;
  licenseNumber?: string;
  yearsExperience?: number;
}

interface Booking {
  id: string;
  practitionerId: string;
  practitionerName: string;
  type: ConsultationType;
  status: ConsultationStatus;
  scheduledAt: string;
  meetingUrl?: string;
  notes?: string;
  bookedAt: string;
}

interface ConsultationRecord {
  id: string;
  practitionerId?: string;
  practitionerName?: string;
  type: ConsultationType;
  status: ConsultationStatus;
  scheduledAt?: string;
  meetingUrl?: string;
  notes?: string;
  createdAt?: string;
}

const AVATAR_COLORS = [
  "bg-[#C8DABB] text-[#2D5A3D]",
  "bg-[#F5E8CE] text-[#B8832A]",
  "bg-[#C2DDD5] text-[#1A6B5A]",
  "bg-[#DDD0C8] text-[#5A3A2A]",
];
const CONSULTATION_PRICES: Record<ConsultationType, number> = {
  HERBALIST: 5000,
  NATUROPATH: 6500,
  TOXICOLOGIST: 7500,
  PHARMACIST: 8500,
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ── Config ──
const typeConfig: Record<
  ConsultationType,
  { icon: React.ReactNode; label: string; color: string }
> = {
  HERBALIST: {
    icon: <Leaf size={14} />,
    label: "Herbalist",
    color: "text-green-400",
  },
  NATUROPATH: {
    icon: <Stethoscope size={14} />,
    label: "Naturopath",
    color: "text-blue-400",
  },
  TOXICOLOGIST: {
    icon: <FlaskConical size={14} />,
    label: "Toxicologist",
    color: "text-purple-400",
  },
  PHARMACIST: {
    icon: <Pill size={14} />,
    label: "Pharmacist",
    color: "text-amber-400",
  },
};

const statusConfig: Record<
  ConsultationStatus,
  { badge: string; label: string }
> = {
  REQUESTED: { badge: "bg-amber-500/15 text-amber-400", label: "Pending" },
  CONFIRMED: { badge: "bg-green-500/15 text-green-400", label: "Confirmed" },
  COMPLETED: { badge: "bg-white/10 text-white/40", label: "Completed" },
  CANCELLED: { badge: "bg-red-500/15 text-red-400", label: "Cancelled" },
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={11}
          className={
            n <= Math.round(rating)
              ? "text-(--gold) fill-(--gold)"
              : "text-white/20"
          }
        />
      ))}
    </span>
  );
}

type BookingStep = "browse" | "slot" | "notes" | "confirm" | "success";

// ── Component ─────
export function ConsultationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: consultData, mutate: refetchConsults } = useConsultations();
  const [hasSynced, setHasSynced] = useState(false);
  const [tab, setTab] = useState<"upcoming" | "browse">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Practitioner | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>("browse");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedSlotIso, setSelectedSlotIso] = useState<string>("");
  // const [bookingNotes, setBookingNotes] = useState("");
  // const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ConsultationType | "ALL">("ALL");
  // Verifying-payment overlay state, shown while we confirm a return from
  // Paystack checkout (see the ?ref= handling in the effect below).
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const { data: directoryData, loading: directoryLoading } =
    useConsultantDirectory(filterType !== "ALL" ? filterType : undefined);
  const filteredPractitioners: Practitioner[] = (directoryData?.consultants ??
    []) as unknown as Practitioner[];

  const bookableDays = useMemo(() => {
    const out: Date[] = [];
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    while (out.length < BOOKABLE_DAYS_AHEAD) {
      if (isWorkingDay(d)) out.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return out;
  }, []);

  const dateISO = selectedDay ? selectedDay.toISOString().slice(0, 10) : null;
  const { data: availData } = useConsultantAvailability(
    selected?.id ?? null,
    dateISO,
  );
  const slots = availData?.slots ?? [];

  // Sync real DB consultations into local state on load, and again after
  // every mutation (hasSynced reset to false before each refetch).

  if (consultData?.consultations && !hasSynced) {
    const shaped: Booking[] = (
      consultData.consultations as unknown as Array<
        ConsultationRecord & { consultantId?: string; consultantName?: string }
      >
    ).map((c) => ({
      id: c.id,
      practitionerId: c.consultantId ?? c.practitionerId ?? "",
      practitionerName:
        c.consultantName ?? c.practitionerName ?? "Practitioner",
      type: c.type,
      status: c.status,
      scheduledAt: c.scheduledAt
        ? new Date(c.scheduledAt).toLocaleString("en-NG", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          })
        : "",
      meetingUrl: c.meetingUrl ?? undefined,
      notes: c.notes ?? undefined,
      bookedAt: c.createdAt
        ? new Date(c.createdAt).toISOString().split("T")[0]
        : "",
    }));
    setBookings(shaped);
    setHasSynced(true);
  }

  // ── Handle return from Paystack checkout ───
  // Paystack's callback_url points back here with ?ref=<reference>.

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;
    // Schedule state updates asynchronously to avoid synchronous setState inside effect
    Promise.resolve().then(() => {
      setVerifying(true);
      setVerifyError(null);
    });
    customerApi
      .verifyConsultationPayment(ref)
      .then(() => {
        setHasSynced(false);
        return refetchConsults();
      })
      .then(() => {
        setVerifying(false);
        setTab("upcoming");
        // Clean the ?ref= param out of the URL so re-rendering/refreshing
        // doesn't re-trigger verification.
        router.replace("/dashboard/customer/consultations");
      })
      .catch((err: unknown) => {
        console.error("[Payment verify]", err);
        setVerifying(false);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setVerifyError(
          errorMessage ||
            "We could not confirm your payment. If you were charged, please contact support.",
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function startBooking(p: Practitioner) {
    setSelected(p);
    setSelectedDay(bookableDays[0]);
    setSelectedSlotIso("");
    setBookingStep("slot");
    setTab("browse");
    setBookingError(null);
  }

  return (
    <DashboardShell
      heading="Consultations"
      subheading="Book micro-consultations with certified herbalists, naturopaths, toxicologists, and pharmacists."
    >
      <BookingFlow />

      {/* Verifying payment overlay — shown immediately on return from Paystack checkout */}
      <AnimatePresence>
        {verifying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center p-4"
          >
            <div className="bg-[#1A2030] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center">
              <Loader2
                size={32}
                className="animate-spin text-(--green-pale) mx-auto mb-4"
              />
              <p className="text-[15px] font-semibold text-white mb-1">
                Confirming your payment…
              </p>
              <p className="text-[13px] text-white/50">
                Please don&apos;t close this page.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {verifyError && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] font-medium text-white">{verifyError}</p>
            <p className="text-[12px] text-white/40 mt-0.5">
              If money left your account but this isn&apos;t reflected, contact
              support with your payment reference and we&apos;ll confirm
              manually.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/4 border border-white/[0.07] rounded-xl p-1 w-fit">
        {(
          [
            ["upcoming", "My Sessions"],
            ["browse", "Browse Practitioners"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all ${tab === key ? "bg-(--green-mid) text-white shadow" : "text-white/50 hover:text-white"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Upcoming sessions ── */}
      {tab === "upcoming" && (
        <div>
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 rounded-2xl border border-white/[0.07] bg-white/2">
              <Calendar size={36} className="text-white/20 mb-3" />
              <p className="text-white/40 text-[14px] mb-3">
                No sessions booked yet
              </p>
              <button
                onClick={() => setTab("browse")}
                className="text-[13px] text-(--green-pale) hover:text-white flex items-center gap-1"
              >
                Browse practitioners <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b, i) => {
                const sc = statusConfig[b.status];
                const tc = typeConfig[b.type];
                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden"
                  >
                    <div className="flex items-start gap-4 p-5">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-[15px] shrink-0 ${b.practitionerName ? AVATAR_COLORS[i % AVATAR_COLORS.length] : "bg-white/10 text-white"}`}
                      >
                        {b.practitionerName ? (
                          initials(b.practitionerName)
                        ) : (
                          <User size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-[15px] font-semibold text-white">
                            {b.practitionerName}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${sc.badge}`}
                          >
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[12px] text-white/40 flex-wrap">
                          <span
                            className={`flex items-center gap-1 ${tc.color}`}
                          >
                            {tc.icon} {tc.label}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> {b.scheduledAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> 30 min
                          </span>
                        </div>
                        {b.notes && (
                          <p className="mt-2 text-[13px] text-white/50 leading-relaxed italic">
                            &rdquo{b.notes}&ldquo
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {b.status === "CONFIRMED" && b.meetingUrl && (
                          <a
                            href={b.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-xl bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors"
                          >
                            <Video size={14} /> Join Session
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          <button
            onClick={() => setTab("browse")}
            className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-(--green-pale) hover:text-white transition-colors"
          >
            <Calendar size={14} /> Book another session <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* ── Browse practitioners ── */}
      {tab === "browse" && (
        <div>
          {/* Type filter */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {(
              [
                "ALL",
                "HERBALIST",
                "NATUROPATH",
                "TOXICOLOGIST",
                "PHARMACIST",
              ] as const
            ).map((t) => {
              const tc = t === "ALL" ? null : typeConfig[t];
              return (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-xl border transition-all ${filterType === t ? "bg-(--green-mid) text-white border-(--green-mid)" : "border-white/8 text-white/50 hover:text-white bg-white/4"}`}
                >
                  {tc?.icon} {t === "ALL" ? "All Types" : tc?.label}
                </button>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {directoryLoading && filteredPractitioners.length === 0 ? (
              <div className="sm:col-span-2 py-16 text-center text-white/40 text-[13px]">
                <Loader2 size={18} className="animate-spin inline-block mr-2" />{" "}
                Loading practitioners…
              </div>
            ) : filteredPractitioners.length === 0 ? (
              <div className="sm:col-span-2 py-16 text-center text-white/40 text-[13px]">
                No practitioners available for this specialty right now.
              </div>
            ) : (
              filteredPractitioners.map((p, i) => {
                const tc = typeConfig[p.type];
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white/4 border border-white/8 rounded-2xl p-6 flex flex-col hover:border-white/20 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-[15px] shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                      >
                        {initials(p.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-white">
                          {p.name}
                        </p>
                        <p className="text-[12px] text-white/40">
                          {p.licenseNumber ? p.licenseNumber : tc.label}
                        </p>
                        {p.rating != null && (
                          <div className="flex items-center gap-2 mt-1">
                            <Stars rating={p.rating} />
                            <span className="text-[11px] text-white/35">
                              {p.rating.toFixed(1)} ({p.reviewCount} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Type badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium self-start px-2.5 py-1 rounded-full bg-white/6 ${tc.color} mb-3`}
                    >
                      {tc.icon} {tc.label}
                    </span>

                    <p className="text-[13px] text-white/50 leading-relaxed mb-4 flex-1">
                      {p.bio ?? "Verified HerbRx consultant."}
                    </p>

                    {p.yearsExperience != null && (
                      <div className="flex items-center gap-1.5 text-[12px] text-white/35 mb-4">
                        {p.yearsExperience} years of experience
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-end pt-4 border-t border-white/6">
                      <div className="text-right">
                        <p className="text-[11px] text-white/30">
                          30-min session
                        </p>
                        <p className="text-[15px] font-semibold text-white">
                          ₦{CONSULTATION_PRICES[p.type].toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => startBooking(p)}
                      className="mt-4 w-full h-10 bg-(--green-mid) hover:bg-(--green-light) text-white text-[13px] font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Video size={14} /> Book Session
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
