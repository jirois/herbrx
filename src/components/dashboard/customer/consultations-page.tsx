"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  Calendar,
  Clock,
  CheckCircle,
  X,
  ChevronRight,
  Video,
  Star,
  ArrowRight,
  Loader2,
  User,
  Stethoscope,
  Leaf,
  FlaskConical,
  Pill,
} from "lucide-react";
import type { ConsultationType, ConsultationStatus } from "@/types";

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

// ── Mock data ─────
const PRACTITIONERS: Practitioner[] = [
  {
    id: "p1",
    name: "Dr. Adaeze Okonkwo",
    title: "B.Pharm, MSc Pharmacognosy",
    type: "HERBALIST",
    specialties: [
      "Herbal Safety",
      "Drug-Herb Interactions",
      "Nigerian Medicinal Plants",
    ],
    rating: 4.9,
    reviewCount: 127,
    languages: ["English", "Igbo"],
    bio: "12 years evaluating Nigerian medicinal plants. Specialist in herbal safety assessments and drug-herb interaction counselling.",
    nextAvailable: "Thu 26 Jun · 10:00 AM",
    price: 5000,
    initials: "AO",
    color: "bg-[#C8DABB] text-[#2D5A3D]",
  },
  {
    id: "p2",
    name: "Dr. Emeka Nwosu",
    title: "MBChB, Dip. Naturopathic Medicine",
    type: "NATUROPATH",
    specialties: ["Integrative Medicine", "Gut Health", "Hormonal Balance"],
    rating: 4.7,
    reviewCount: 84,
    languages: ["English", "Yoruba"],
    bio: "Integrative medicine physician combining conventional diagnostics with evidence-based naturopathic protocols.",
    nextAvailable: "Fri 27 Jun · 2:00 PM",
    price: 6500,
    initials: "EN",
    color: "bg-[#F5E8CE] text-[#B8832A]",
  },
  {
    id: "p3",
    name: "Dr. Fatimah Al-Hassan",
    title: "PhD Toxicology (ABU)",
    type: "TOXICOLOGIST",
    specialties: [
      "Herb Toxicology",
      "Poisoning Management",
      "Adulteration Detection",
    ],
    rating: 4.8,
    reviewCount: 56,
    languages: ["English", "Hausa"],
    bio: "Toxicology PhD from ABU Zaria. Expert in herbal product contamination, adverse reactions, and emergency protocols.",
    nextAvailable: "Mon 30 Jun · 9:00 AM",
    price: 7500,
    initials: "FA",
    color: "bg-[#C2DDD5] text-[#1A6B5A]",
  },
  {
    id: "p4",
    name: "Pharm. Segun Adeleke",
    title: "B.Pharm, MPCN",
    type: "PHARMACIST",
    specialties: [
      "Prescription Review",
      "Herbal Supplements",
      "Self-Medication Safety",
    ],
    rating: 4.6,
    reviewCount: 211,
    languages: ["English", "Yoruba", "Pidgin"],
    bio: "Registered pharmacist with 8 years in clinical practice. Specialises in counselling patients on safe supplement use alongside prescription medications.",
    nextAvailable: "Thu 26 Jun · 3:30 PM",
    price: 3500,
    initials: "SA",
    color: "bg-[#DDD0C8] text-[#5A3A2A]",
  },
];

const AVAILABLE_SLOTS = [
  "Thu 26 Jun · 10:00 AM",
  "Thu 26 Jun · 11:30 AM",
  "Thu 26 Jun · 3:30 PM",
  "Fri 27 Jun · 9:00 AM",
  "Fri 27 Jun · 2:00 PM",
  "Mon 30 Jun · 9:00 AM",
  "Mon 30 Jun · 11:00 AM",
  "Mon 30 Jun · 3:00 PM",
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "bk1",
    practitionerId: "p1",
    practitionerName: "Dr. Adaeze Okonkwo",
    type: "HERBALIST",
    status: "CONFIRMED",
    scheduledAt: "Thu 26 Jun · 10:00 AM",
    meetingUrl: "https://meet.herbrx.ng/session/bk1",
    bookedAt: "2025-06-20",
  },
  {
    id: "bk2",
    practitionerId: "p4",
    practitionerName: "Pharm. Segun Adeleke",
    type: "PHARMACIST",
    status: "COMPLETED",
    scheduledAt: "Mon 16 Jun · 9:30 AM",
    notes:
      "Reviewed interaction between Metformin and Bitter Leaf extract. Advised caution and glucose monitoring.",
    bookedAt: "2025-06-14",
  },
];

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
  const [tab, setTab] = useState<"upcoming" | "browse">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [selected, setSelected] = useState<Practitioner | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>("browse");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<ConsultationType | "ALL">("ALL");

  const filteredPractitioners =
    filterType === "ALL"
      ? PRACTITIONERS
      : PRACTITIONERS.filter((p) => p.type === filterType);

  function startBooking(p: Practitioner) {
    setSelected(p);
    setBookingStep("slot");
    setTab("browse");
  }

  async function confirmBooking() {
    if (!selected || !selectedSlot) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    const newBooking: Booking = {
      id: `bk${Date.now()}`,
      practitionerId: selected.id,
      practitionerName: selected.name,
      type: selected.type,
      status: "CONFIRMED",
      scheduledAt: selectedSlot,
      meetingUrl: `https://meet.herbrx.ng/session/${Date.now()}`,
      bookedAt: new Date().toISOString().split("T")[0],
    };
    setBookings((prev) => [newBooking, ...prev]);
    setSubmitting(false);
    setBookingStep("success");
  }

  function resetBooking() {
    setSelected(null);
    setBookingStep("browse");
    setSelectedSlot("");
    setBookingNotes("");
    setTab("upcoming");
  }

  return (
    <DashboardShell
      heading="Consultations"
      subheading="Book micro-consultations with certified herbalists, naturopaths, toxicologists, and pharmacists."
    >
      {/*  // ── Booking flow overlay ───── */}
      <AnimatePresence>
        {selected && bookingStep !== "browse" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) resetBooking();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="bg-[#1A2030] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              {/* Success */}
              {bookingStep === "success" ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <h3 className="font-serif text-[22px] font-semibold text-white mb-2">
                    Session Booked!
                  </h3>
                  <p className="text-[14px] text-white/50 mb-1">
                    Your consultation with{" "}
                    <span className="text-white font-medium">
                      {selected.name}
                    </span>{" "}
                    is confirmed.
                  </p>
                  <p className="text-[14px] text-(--green-pale) font-medium mb-6">
                    {selectedSlot}
                  </p>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 text-[13px] text-white/50 mb-6">
                    <Video size={14} className="text-blue-400 shrink-0" />A
                    video meeting link has been sent to your email.
                  </div>
                  <button
                    onClick={resetBooking}
                    className="w-full h-11 bg-(--green-mid) hover:bg-(--green-light) text-white font-medium rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Modal header */}
                  <div className="flex items-center gap-3 p-5 border-b border-white/[0.07]">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 ${selected.color}`}
                    >
                      {selected.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-white">
                        {selected.name}
                      </p>
                      <p className="text-[12px] text-white/40">
                        {selected.title}
                      </p>
                    </div>
                    <button
                      onClick={resetBooking}
                      className="text-white/30 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="p-5">
                    {/* Step: pick slot */}
                    {bookingStep === "slot" && (
                      <div>
                        <p className="text-[13px] text-white/50 mb-4">
                          Select an available time slot for your 30-minute
                          session.
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-5">
                          {AVAILABLE_SLOTS.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => setSelectedSlot(slot)}
                              className={`text-left p-3 rounded-xl border text-[13px] transition-all ${selectedSlot === slot ? "border-(--green-mid) bg-(--green-mid)/15 text-white" : "border-white/8 bg-white/3 text-white/60 hover:border-white/20 hover:text-white"}`}
                            >
                              <Calendar size={12} className="mb-1 opacity-60" />
                              {slot}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-[13px] text-white/40 mb-5">
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} /> 30-minute session
                          </span>
                          <span className="font-semibold text-white">
                            ₦{selected.price.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => setBookingStep("notes")}
                          disabled={!selectedSlot}
                          className="w-full h-11 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          Continue <ChevronRight size={15} />
                        </button>
                      </div>
                    )}

                    {/* Step: notes */}
                    {bookingStep === "notes" && (
                      <div>
                        <p className="text-[13px] text-white/50 mb-4">
                          Let{" "}
                          <span className="text-white">{selected.name}</span>{" "}
                          know what you&apos;d like to discuss.
                        </p>
                        <textarea
                          value={bookingNotes}
                          onChange={(e) => setBookingNotes(e.target.value)}
                          placeholder="e.g. I'm taking Metformin for Type 2 diabetes and want to understand if I can safely use Bitter Leaf extract alongside it…"
                          rows={5}
                          className="w-full px-4 py-3 bg-white/6 border border-white/10 rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none focus:border-(--green-mid) resize-none transition-colors"
                        />
                        <p className="text-[11px] text-white/30 mt-2 mb-5">
                          This is shared privately with your practitioner before
                          the session.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setBookingStep("slot")}
                            className="h-11 px-5 border border-white/10 text-white/50 hover:text-white rounded-xl text-[14px] transition-colors"
                          >
                            ← Back
                          </button>
                          <button
                            onClick={() => setBookingStep("confirm")}
                            className="flex-1 h-11 bg-(--green-mid) hover:bg-(--green-light) text-white font-medium rounded-xl transition-colors"
                          >
                            Review Booking →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step: confirm */}
                    {bookingStep === "confirm" && (
                      <div>
                        <p className="text-[13px] text-white/50 mb-4">
                          Confirm your booking details.
                        </p>
                        <div className="space-y-3 mb-5">
                          {[
                            {
                              label: "Practitioner",
                              value: `${selected.name} · ${selected.title}`,
                            },
                            {
                              label: "Specialty",
                              value: typeConfig[selected.type].label,
                            },
                            { label: "Date & Time", value: selectedSlot },
                            {
                              label: "Duration",
                              value: "30 minutes · Video call",
                            },
                            {
                              label: "Fee",
                              value: `₦${selected.price.toLocaleString()}`,
                            },
                          ].map((f) => (
                            <div
                              key={f.label}
                              className="flex items-start justify-between gap-4 py-2 border-b border-white/5"
                            >
                              <span className="text-[12px] text-white/35">
                                {f.label}
                              </span>
                              <span className="text-[13px] text-white font-medium text-right">
                                {f.value}
                              </span>
                            </div>
                          ))}
                          {bookingNotes && (
                            <div className="pt-1">
                              <p className="text-[12px] text-white/35 mb-1">
                                Your Notes
                              </p>
                              <p className="text-[13px] text-white/60 leading-relaxed">
                                {bookingNotes}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setBookingStep("notes")}
                            className="h-11 px-5 border border-white/10 text-white/50 hover:text-white rounded-xl text-[14px] transition-colors"
                          >
                            ← Back
                          </button>
                          <button
                            onClick={confirmBooking}
                            disabled={submitting}
                            className="flex-1 h-11 bg-(--green-deep) hover:bg-(--green-mid) disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            {submitting ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />{" "}
                                Booking…
                              </>
                            ) : (
                              <>
                                Confirm & Pay ₦{selected.price.toLocaleString()}
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-white/25 text-center mt-3">
                          Payment processed securely via Paystack
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                const practitioner = PRACTITIONERS.find(
                  (p) => p.id === b.practitionerId,
                );
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
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-[15px] shrink-0 ${practitioner?.color ?? "bg-white/10 text-white"}`}
                      >
                        {practitioner?.initials ?? <User size={18} />}
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
                            &qout;{b.notes} &qout;
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
            {filteredPractitioners.map((p, i) => {
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
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-[15px] shrink-0 ${p.color}`}
                    >
                      {p.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-white">
                        {p.name}
                      </p>
                      <p className="text-[12px] text-white/40">{p.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Stars rating={p.rating} />
                        <span className="text-[11px] text-white/35">
                          {p.rating} ({p.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Type badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium self-start px-2.5 py-1 rounded-full bg-white/6 ${tc.color} mb-3`}
                  >
                    {tc.icon} {tc.label}
                  </span>

                  <p className="text-[13px] text-white/50 leading-relaxed mb-4 flex-1">
                    {p.bio}
                  </p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.specialties.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] text-white/40 bg-white/5 border border-white/[0.07] px-2 py-0.5 rounded-lg"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Languages */}
                  <div className="flex items-center gap-1.5 text-[12px] text-white/35 mb-4">
                    🗣 {p.languages.join(", ")}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/6">
                    <div>
                      <p className="text-[11px] text-white/30">
                        Next available
                      </p>
                      <p className="text-[12px] text-(--green-pale) font-medium">
                        {p.nextAvailable}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-white/30">
                        30-min session
                      </p>
                      <p className="text-[15px] font-semibold text-white">
                        ₦{p.price.toLocaleString()}
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
            })}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
