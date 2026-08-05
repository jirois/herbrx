"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  ChevronRight,
  Loader2,
  Star,
  Leaf,
  Stethoscope,
  FlaskConical,
  Pill,
  User,
  Mail,
  MessageSquare,
  ArrowLeft,
  Shield,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";
import {
  useConsultantDirectory,
  useConsultantAvailability,
  bookingApi,
} from "@/hooks/dashboard-hooks";
import { BOOKABLE_DAYS_AHEAD, isWorkingDay } from "@/lib/booking-config";

// ── Types ─────────
type ConsultationType =
  | "HERBALIST"
  | "NATUROPATH"
  | "TOXICOLOGIST"
  | "PHARMACIST";
type BookingStep =
  | "type"
  | "practitioner"
  | "slot"
  | "details"
  | "confirm"
  | "success";

interface Practitioner {
  id: string;
  name: string;
  title?: string;
  type: ConsultationType;
  specialties?: string[];
  rating?: number;
  reviewCount?: number;
  bio?: string;
  languages?: string[];
  nextAvailable?: string;
  price?: number;
  initials?: string;
  color?: string;
  licenseNumber?: string;
  yearsExperience?: number;
}

// interface BookingSessionUser {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
// }

const SLOT_TAKEN_MESSAGE =
  "This time slot has already been reserved. Please select a different time or date.";

// ── Data ───────────────────
const CONSULTATION_TYPES = [
  {
    type: "HERBALIST" as ConsultationType,
    icon: Leaf,
    label: "Herbalist",
    tagline: "Traditional & evidence-based herbal guidance",
    desc: "For questions about specific herbs, safe usage, Nigerian medicinal plants, and herb-based wellness plans.",
    price: "from ₦5,000",
    color: "border-green-500/25 bg-green-500/5",
    iconColor: "text-green-400",
    accent: "bg-green-500/15",
  },
  {
    type: "PHARMACIST" as ConsultationType,
    icon: Pill,
    label: "Pharmacist",
    tagline: "Drug-herb interaction review",
    desc: "For checking if herbal products are safe alongside your prescription medications.",
    price: "from ₦3,500",
    color: "border-amber-500/25 bg-amber-500/5",
    iconColor: "text-amber-400",
    accent: "bg-amber-500/15",
  },
  {
    type: "NATUROPATH" as ConsultationType,
    icon: Stethoscope,
    label: "Naturopath",
    tagline: "Integrative wellness consultation",
    desc: "For holistic health plans combining conventional and natural medicine approaches.",
    price: "from ₦6,500",
    color: "border-blue-500/25 bg-blue-500/5",
    iconColor: "text-blue-400",
    accent: "bg-blue-500/15",
  },
  {
    type: "TOXICOLOGIST" as ConsultationType,
    icon: FlaskConical,
    label: "Toxicologist",
    tagline: "Expert herb safety & adverse reaction review",
    desc: "For concerns about product safety, adverse reactions, contamination, or overdose risk.",
    price: "from ₦7,500",
    color: "border-purple-500/25 bg-purple-500/5",
    iconColor: "text-purple-400",
    accent: "bg-purple-500/15",
  },
];

const STEPS: { key: BookingStep; label: string }[] = [
  { key: "type", label: "Service" },
  { key: "practitioner", label: "Practitioner" },
  { key: "slot", label: "Date & Time" },
  { key: "details", label: "Your Details" },
  { key: "confirm", label: "Confirm" },
];

const CONSULTATION_PRICES: Record<ConsultationType, number> = {
  HERBALIST: 5000,
  NATUROPATH: 6500,
  TOXICOLOGIST: 7500,
  PHARMACIST: 3500,
};

const AVATAR_COLORS = [
  "bg-[#C8DABB] text-[#2D5A3D]",
  "bg-[#F5E8CE] text-[#B8832A]",
  "bg-[#C2DDD5] text-[#1A6B5A]",
  "bg-[#DDD0C8] text-[#5A3A2A]",
];

const inputCls =
  "w-full h-11 px-4 bg-white/[0.06] border border-white/[0.1] rounded-xl text-[14px] text-white placeholder:text-white/30 outline-none focus:border-[var(--green-mid)] focus:bg-white/[0.08] transition-all";
const labelCls = "block text-[13px] font-medium text-white/60 mb-1.5";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={11}
          fill={n <= Math.round(rating) ? "currentColor" : "none"}
          className={
            n <= Math.round(rating) ? "text-(--gold)" : "text-white/20"
          }
        />
      ))}
    </span>
  );
}

// ── Component ──────
export function BookingPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState<BookingStep>("type");

  const [selectedType, setSelectedType] = useState<ConsultationType | null>(
    null,
  );
  const [selectedConsultant, setSelectedConsultant] =
    useState<Practitioner | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const { data: directoryData, loading: directoryLoading } =
    useConsultantDirectory(selectedType ?? undefined);
  const consultants = (directoryData?.consultants ??
    []) as unknown as Practitioner[];

  const days = useMemo(() => {
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
  const {
    data: availData,
    loading: availLoading,
    mutate: refetchAvailability,
  } = useConsultantAvailability(selectedConsultant?.id ?? null, dateISO);
  const slots = availData?.slots ?? [];
  const selectedSlot = slots.find((s) => s.iso === selectedSlotIso);

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const isGuest = !session?.user;

  function chooseType(t: ConsultationType) {
    setSelectedType(t);
    setSelectedConsultant(null);
    setStep("practitioner");
  }

  function choosePractitioner(p: Practitioner) {
    setSelectedConsultant(p);
    setSelectedDay(days[0]);
    setSelectedSlotIso(null);
    setStep("slot");
  }

  function pickDay(d: Date) {
    setSelectedDay(d);
    setSelectedSlotIso(null);
    setBookingError(null);
  }

  function pickSlot(iso: string, available: boolean) {
    if (!available) return; // greyed-out slots are unclickable, not just styled that way
    setBookingError(null);
    setSelectedSlotIso(iso);
  }

  async function handleConfirm() {
    if (!selectedConsultant || !selectedSlotIso || !selectedType) return;

    // Client-side interception: if the slot we last fetched says taken,
    // stop here — never call the API for a slot we already know is gone.
    if (!selectedSlot || !selectedSlot.available) {
      setBookingError(SLOT_TAKEN_MESSAGE);
      refetchAvailability();
      return;
    }

    setSubmitting(true);
    setBookingError(null);
    try {
      const result = await bookingApi.create({
        consultantId: selectedConsultant.id,
        type: selectedType,
        scheduledAt: selectedSlotIso,
        notes,
      });

      if (!result?.authorizationUrl) {
        throw new Error("Payment could not be started. Please try again.");
      }

      // Redirect to the real Paystack checkout page — booking is only ever
      // finalized once the user actually completes payment and it's
      // verified on return (see /dashboard/customer/consultations) or via
      // webhook. Previously this button just showed a fake success screen
      // with no payment ever taking place.
      window.location.href = result.authorizationUrl;
    } catch (err: unknown) {
      console.error("[handleConfirm]", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Could not start payment. Please try again.";
      setBookingError(msg);
      if (msg === SLOT_TAKEN_MESSAGE) refetchAvailability();
      setSubmitting(false);
    }
  }

  const canProceedDetails = isGuest ? !!(guestName && guestEmail) : true;
  const price = selectedType ? CONSULTATION_PRICES[selectedType] : 0;

  return (
    <div className="min-h-screen bg-[#0F1117] text-white">
      {/* Top nav */}
      <header className="border-b border-white/[0.07] bg-[#0F1117]/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 mr-6">
            <div className="w-8 h-8 rounded-full bg-(--green-mid) flex items-center justify-center font-serif italic font-semibold text-[14px] text-white">
              Hx
            </div>
            <span className="font-serif text-[16px] font-semibold text-white">
              HerbRx
            </span>
          </Link>
          <div className="flex items-center gap-1 overflow-x-auto">
            {STEPS.map((s, i) => {
              const done = i < currentStepIndex;
              const active = s.key === step;
              return (
                <div key={s.key} className="flex items-center shrink-0">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${active ? "bg-(--green-mid) text-white" : done ? "text-green-400" : "text-white/30"}`}
                  >
                    {done && <CheckCircle size={12} />}
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`w-4 h-px mx-1 ${done ? "bg-green-500/40" : "bg-white/8"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {/* ── Step: Type ── */}
          {step === "type" && (
            <motion.div
              key="type"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="text-center mb-10">
                <h1 className="font-serif text-[clamp(26px,4vw,40px)] font-semibold text-white mb-3">
                  Book a Consultation
                </h1>
                <p className="text-[16px] text-white/50 max-w-md mx-auto">
                  30-minute sessions with certified herbal health practitioners.
                  What kind of help do you need?
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {CONSULTATION_TYPES.map((ct) => (
                  <motion.button
                    key={ct.type}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => chooseType(ct.type)}
                    className={`text-left p-6 rounded-2xl border transition-all hover:shadow-lg ${ct.color} ${selectedType === ct.type ? "ring-2 ring-(--green-mid)" : ""}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${ct.accent} flex items-center justify-center mb-4`}
                    >
                      <ct.icon size={20} className={ct.iconColor} />
                    </div>
                    <h3 className="font-serif text-[18px] font-semibold text-white mb-1">
                      {ct.label}
                    </h3>
                    <p
                      className={`text-[12px] font-semibold mb-2 ${ct.iconColor}`}
                    >
                      {ct.tagline}
                    </p>
                    <p className="text-[13px] text-white/50 leading-relaxed mb-3">
                      {ct.desc}
                    </p>
                    <p className="text-[12px] text-white/40">
                      {ct.price} · 30 min · Video call
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step: Practitioner ── */}
          {step === "practitioner" && (
            <motion.div
              key="practitioner"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => setStep("type")}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="font-serif text-[22px] font-semibold text-white">
                    Choose Your Practitioner
                  </h2>
                  <p className="text-[13px] text-white/45 mt-0.5">
                    All practitioners are certified and background-checked
                  </p>
                </div>
              </div>

              {directoryLoading && consultants.length === 0 ? (
                <div className="py-16 text-center text-white/40 text-[13px]">
                  <Loader2
                    size={18}
                    className="animate-spin inline-block mr-2"
                  />{" "}
                  Loading practitioners…
                </div>
              ) : consultants.length === 0 ? (
                <div className="py-16 text-center text-white/40 text-[13px]">
                  No practitioners available for this specialty right now —
                  please check back soon.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {(consultants as Practitioner[]).map((p, i) => (
                    <motion.button
                      key={p.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => choosePractitioner(p)}
                      className={`text-left p-6 rounded-2xl border transition-all hover:border-white/25 bg-white/4 ${selectedConsultant?.id === p.id ? "border-(--green-mid) bg-(--green-mid)/8" : "border-white/8"}`}
                    >
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
                            {p.licenseNumber ??
                              CONSULTATION_TYPES.find(
                                (ct) => ct.type === p.type,
                              )?.label}
                          </p>
                          {p.rating && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Stars rating={p.rating} />
                              <span className="text-[11px] text-white/30">
                                {p.rating.toFixed(1)} ({p.reviewCount})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {p.bio && (
                        <p className="text-[13px] text-white/55 leading-relaxed mb-3">
                          {p.bio}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-white/6">
                        <div className="text-[12px] text-white/35">
                          {p.yearsExperience
                            ? `${p.yearsExperience} years experience`
                            : "Verified HerbRx consultant"}
                        </div>
                        <div className="text-[14px] font-semibold text-white">
                          ₦
                          {CONSULTATION_PRICES[
                            p.type as ConsultationType
                          ]?.toLocaleString()}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step: Slot ── */}
          {step === "slot" && selectedConsultant && (
            <motion.div
              key="slot"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="max-w-xl mx-auto"
            >
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => setStep("practitioner")}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="font-serif text-[22px] font-semibold text-white">
                    Pick a Time
                  </h2>
                  <p className="text-[13px] text-white/45 mt-0.5">
                    With {selectedConsultant.name} · 30 min · ₦
                    {price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
                {days.map((d) => {
                  const active =
                    selectedDay?.toDateString() === d.toDateString();
                  return (
                    <button
                      key={d.toISOString()}
                      onClick={() => pickDay(d)}
                      className={`shrink-0 w-16 py-2.5 rounded-xl border text-center transition-colors ${active ? "bg-(--green-mid) border-(--green-mid) text-white" : "bg-white/3 border-white/8 text-white/60 hover:border-white/20"}`}
                    >
                      <span className="block text-[10px] uppercase tracking-wide opacity-70">
                        {d.toLocaleDateString("en-NG", { weekday: "short" })}
                      </span>
                      <span className="block text-[15px] font-serif font-semibold">
                        {d.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {availLoading ? (
                <div className="py-8 text-center text-[13px] text-white/40">
                  <Loader2
                    size={16}
                    className="animate-spin inline-block mr-2"
                  />{" "}
                  Checking availability…
                </div>
              ) : slots.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-white/40">
                  {availData?.note ?? "No slots available this day."}
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                  {slots.map((slot) => {
                    const active = slot.iso === selectedSlotIso;
                    return (
                      <button
                        key={slot.iso}
                        disabled={!slot.available}
                        onClick={() => pickSlot(slot.iso, slot.available)}
                        title={!slot.available ? "Already booked" : undefined}
                        className={`p-3.5 rounded-xl border text-left text-[13px] transition-all ${
                          !slot.available
                            ? "border-white/5 bg-white/1.5 text-white/20 cursor-not-allowed line-through"
                            : active
                              ? "border-(--green-mid) bg-(--green-mid)/15 text-white"
                              : "border-white/8 bg-white/3 text-white/60 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <Calendar size={12} className="mb-1.5 opacity-60" />
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {bookingError && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 mb-5">
                  <AlertCircle
                    size={15}
                    className="text-red-400 shrink-0 mt-0.5"
                  />
                  <p className="text-[13px] text-red-300">{bookingError}</p>
                </div>
              )}

              <div className="mb-6">
                <label className={labelCls}>
                  Anything you&pos;d like to discuss? (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. I take Metformin and want to know if I can safely use Bitter Leaf extract…"
                  rows={4}
                  className={`${inputCls} h-auto py-3 resize-none`}
                />
                <p className="text-[11px] text-white/30 mt-1.5">
                  Shared privately with your practitioner before the session.
                </p>
              </div>

              <button
                onClick={() => setStep("details")}
                disabled={!selectedSlotIso}
                className="w-full h-12 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Continue <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ── Step: Details ── */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="max-w-md mx-auto"
            >
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => setStep("slot")}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="font-serif text-[22px] font-semibold text-white">
                  Your Details
                </h2>
              </div>

              {session?.user ? (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-(--green-mid)/10 border border-(--green-mid)/25 mb-6">
                  <div className="w-11 h-11 rounded-full bg-(--green-mid)/40 flex items-center justify-center font-bold text-[14px] text-white shrink-0">
                    {(session.user as { firstName: string }).firstName?.[0]}
                    {(session.user as { lastName: string }).lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">
                      {(session.user as { firstName: string }).firstName}{" "}
                      {(session.user as { lastName: string }).lastName}
                    </p>
                    <p className="text-[13px] text-white/50">
                      {session.user.email}
                    </p>
                    <p className="text-[11px] text-(--green-pale)] mt-0.5">
                      ✓ Logged in — your booking will be saved to your account
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/8 border border-blue-500/15 mb-2">
                    <User size={15} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-white/50 leading-relaxed">
                      Consultations require an account so we can confirm your
                      booking and send your meeting link.{" "}
                      <Link
                        href="/login"
                        className="text-blue-400 hover:text-white transition-colors"
                      >
                        Sign in
                      </Link>{" "}
                      or{" "}
                      <Link
                        href="/register"
                        className="text-blue-400 hover:text-white transition-colors"
                      >
                        create an account
                      </Link>{" "}
                      to continue — your selected time will be saved.
                    </p>
                  </div>
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                      />
                      <input
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Your full name"
                        className={`${inputCls} pl-9`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                      />
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={`${inputCls} pl-9`}
                      />
                    </div>
                    <p className="text-[11px] text-white/30 mt-1.5">
                      You&pos;ll be asked to confirm this when you sign in to
                      pay.
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep("confirm")}
                disabled={!canProceedDetails}
                className="w-full h-12 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Review Booking <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ── Step: Confirm ── */}
          {step === "confirm" && selectedConsultant && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="max-w-lg mx-auto"
            >
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => setStep("details")}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="font-serif text-[22px] font-semibold text-white">
                  Confirm Booking
                </h2>
              </div>

              <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden mb-5">
                <div className="flex items-center gap-4 p-5 border-b border-white/6">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-[15px] shrink-0 ${AVATAR_COLORS[0]}`}
                  >
                    {initials(selectedConsultant.name)}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">
                      {selectedConsultant.name}
                    </p>
                    <p className="text-[12px] text-white/45">
                      {
                        CONSULTATION_TYPES.find(
                          (ct) => ct.type === selectedType,
                        )?.label
                      }
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {[
                    {
                      icon: <Pill size={13} />,
                      label: "Service",
                      value:
                        CONSULTATION_TYPES.find(
                          (ct) => ct.type === selectedType,
                        )?.label ?? "",
                    },
                    {
                      icon: <Calendar size={13} />,
                      label: "Date & Time",
                      value: selectedSlot?.label ?? "",
                    },
                    {
                      icon: <Clock size={13} />,
                      label: "Duration",
                      value: "30 minutes",
                    },
                    {
                      icon: <Video size={13} />,
                      label: "Format",
                      value: "Video call (link sent after payment)",
                    },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="flex items-center gap-1.5 text-[12px] text-white/35">
                        {f.icon} {f.label}
                      </span>
                      <span className="text-[13px] text-white font-medium text-right">
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between px-5 py-4 bg-white/3 border-t border-white/6">
                  <span className="text-[13px] text-white/50">Total</span>
                  <span className="text-[22px] font-serif font-semibold text-white">
                    ₦{price.toLocaleString()}
                  </span>
                </div>
              </div>

              {notes && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/4 border border-white/[0.07] mb-5">
                  <MessageSquare
                    size={14}
                    className="text-white/30 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1">
                      Your Notes
                    </p>
                    <p className="text-[13px] text-white/60 leading-relaxed">
                      {notes}
                    </p>
                  </div>
                </div>
              )}

              {bookingError && (
                <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-5">
                  <AlertCircle
                    size={15}
                    className="text-red-400 shrink-0 mt-0.5"
                  />
                  <p className="text-[13px] text-red-300">{bookingError}</p>
                </div>
              )}

              <div className="flex gap-3 flex-wrap mb-6">
                {[
                  {
                    icon: <Shield size={12} />,
                    text: "Secure Paystack payment",
                  },
                  {
                    icon: <BadgeCheck size={12} />,
                    text: "Certified practitioners",
                  },
                  { icon: <Video size={12} />, text: "HD video call included" },
                ].map((b) => (
                  <span
                    key={b.text}
                    className="inline-flex items-center gap-1.5 text-[11px] text-white/40 bg-white/4 border border-white/[0.07] px-3 py-1.5 rounded-lg"
                  >
                    {b.icon} {b.text}
                  </span>
                ))}
              </div>

              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full h-12 bg-(--green-deep) hover:bg-(--green-mid) disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-[15px]"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Redirecting
                    to payment…
                  </>
                ) : (
                  <>Confirm & Pay ₦{price.toLocaleString()} →</>
                )}
              </button>
              <p className="text-[11px] text-white/25 text-center mt-3">
                Payment processed securely via Paystack. No subscription — pay
                per session.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
