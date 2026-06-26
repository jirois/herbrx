"use client";

import { useState } from "react";
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
  Phone,
  MessageSquare,
  ArrowLeft,
  Shield,
  BadgeCheck,
  Globe,
} from "lucide-react";

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

const PRACTITIONERS: Practitioner[] = [
  {
    id: "p1",
    name: "Dr. Adaeze Okonkwo",
    title: "B.Pharm, MSc Pharmacognosy",
    type: "HERBALIST",
    specialties: [
      "Nigerian Medicinal Plants",
      "Herbal Safety",
      "Drug-Herb Interactions",
    ],
    rating: 4.9,
    reviewCount: 127,
    languages: ["English", "Igbo"],
    bio: "12 years evaluating Nigerian medicinal plants. Specialist in herbal safety assessments and drug-herb interaction counselling for everyday Nigerians.",
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
    bio: "Integrative medicine physician blending conventional diagnostics with evidence-based naturopathic protocols for long-term wellness.",
    nextAvailable: "Fri 27 Jun · 2:00 PM",
    price: 6500,
    initials: "EN",
    color: "bg-[#F5E8CE] text-[#B8832A]",
  },
  {
    id: "p3",
    name: "Dr. Fatimah Al-Hassan",
    title: "PhD Toxicology (ABU Zaria)",
    type: "TOXICOLOGIST",
    specialties: [
      "Herb Toxicology",
      "Poisoning Management",
      "Adverse Reactions",
    ],
    rating: 4.8,
    reviewCount: 56,
    languages: ["English", "Hausa"],
    bio: "Toxicology PhD from Ahmadu Bello University. Expert in herbal product contamination, adverse reactions, and emergency safety protocols.",
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
    bio: "Registered pharmacist with 8 years in clinical practice. Nigeria's most-reviewed herbal-pharmaceutical interaction specialist.",
    nextAvailable: "Thu 26 Jun · 3:30 PM",
    price: 3500,
    initials: "SA",
    color: "bg-[#DDD0C8] text-[#5A3A2A]",
  },
];

const SLOTS = [
  "Thu 26 Jun · 10:00 AM",
  "Thu 26 Jun · 11:30 AM",
  "Thu 26 Jun · 3:30 PM",
  "Fri 27 Jun · 9:00 AM",
  "Fri 27 Jun · 2:00 PM",
  "Mon 30 Jun · 9:00 AM",
  "Mon 30 Jun · 11:00 AM",
  "Mon 30 Jun · 3:00 PM",
  "Tue 1 Jul · 10:00 AM",
  "Tue 1 Jul · 2:00 PM",
  "Wed 2 Jul · 9:00 AM",
  "Wed 2 Jul · 4:00 PM",
];

const STEPS: { key: BookingStep; label: string }[] = [
  { key: "type", label: "Service" },
  { key: "practitioner", label: "Practitioner" },
  { key: "slot", label: "Date & Time" },
  { key: "details", label: "Your Details" },
  { key: "confirm", label: "Confirm" },
];

const inputCls =
  "w-full h-11 px-4 bg-white/[0.06] border border-white/[0.1] rounded-xl text-[14px] text-white placeholder:text-white/30 outline-none focus:border-[var(--green-mid)] focus:bg-white/[0.08] transition-all";
const labelCls = "block text-[13px] font-medium text-white/60 mb-1.5";

interface BookingSessionUser {
  firstName?: string;
  lastName?: string;
  email?: string;
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
  const user = session?.user as BookingSessionUser | undefined;
  const [step, setStep] = useState<BookingStep>("type");

  const [selectedType, setSelectedType] = useState<ConsultationType | null>(
    null,
  );
  const [selectedPractitioner, setSelectedPractitioner] =
    useState<Practitioner | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState("");

  // Guest fields
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const filteredPractitioners = PRACTITIONERS.filter(
    (p) => !selectedType || p.type === selectedType,
  );

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const isGuest = !session?.user;

  async function handleConfirm() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practitionerId: selectedPractitioner?.id,
          practitionerName: selectedPractitioner?.name,
          type: selectedType,
          scheduledAt: selectedSlot,
          notes,
          guestName: isGuest ? guestName : undefined,
          guestEmail: isGuest ? guestEmail : undefined,
          guestPhone: isGuest ? guestPhone : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMeetingUrl(data.meetingUrl ?? "");
        setStep("success");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  const canProceedDetails = isGuest ? !!(guestName && guestEmail) : true;

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
          {step !== "success" && (
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
          )}
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
                    onClick={() => {
                      setSelectedType(ct.type);
                      setStep("practitioner");
                    }}
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

              <div className="grid sm:grid-cols-2 gap-4">
                {filteredPractitioners.map((p) => (
                  <motion.button
                    key={p.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setSelectedPractitioner(p);
                      setStep("slot");
                    }}
                    className={`text-left p-6 rounded-2xl border transition-all hover:border-white/25 bg-white/4 ${selectedPractitioner?.id === p.id ? "border-(--green-mid) bg-(--green-mid)/8" : "border-white/8"}`}
                  >
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
                        <div className="flex items-center gap-1.5 mt-1">
                          <Stars rating={p.rating} />
                          <span className="text-[11px] text-white/30">
                            {p.rating} ({p.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[13px] text-white/55 leading-relaxed mb-3">
                      {p.bio}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.specialties.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] text-white/40 bg-white/6 border border-white/[0.07] px-2 py-0.5 rounded-lg"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/6">
                      <div className="text-[12px] text-white/35">
                        🗣 {p.languages.join(", ")}
                      </div>
                      <div className="text-right">
                        <div className="text-[14px] font-semibold text-white">
                          ₦{p.price.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-(--green-pale)">
                          Next: {p.nextAvailable}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step: Slot ── */}
          {step === "slot" && (
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
                    With {selectedPractitioner?.name} · 30 min · ₦
                    {selectedPractitioner?.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                {SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3.5 rounded-xl border text-left text-[13px] transition-all ${selectedSlot === slot ? "border-(--green-mid) bg-(--green-mid)/15 text-white" : "border-white/8 bg-white/3 text-white/60 hover:border-white/20 hover:text-white"}`}
                  >
                    <Calendar size={12} className="mb-1.5 opacity-60" />
                    {slot}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className={labelCls}>
                  Anything you&apos;d like to discuss? (optional)
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
                disabled={!selectedSlot}
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

              {user ? (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-(--green-mid)/10 border border-(--green-mid)/25 mb-6">
                  <div className="w-11 h-11 rounded-full bg-(--green-mid)/40 flex items-center justify-center font-bold text-[14px] text-white shrink-0">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[13px] text-white/50">{user.email}</p>
                    <p className="text-[11px] text-(--green-pale) mt-0.5">
                      ✓ Logged in — your booking will be saved to your account
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/8 border border-blue-500/15 mb-5">
                    <User size={15} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-white/50 leading-relaxed">
                      Booking as a guest.{" "}
                      <Link
                        href="/login"
                        className="text-blue-400 hover:text-white transition-colors"
                      >
                        Sign in
                      </Link>{" "}
                      to save sessions to your account and access them from your
                      dashboard.
                    </p>
                  </div>
                  <div>
                    <label className={labelCls}>Full Name *</label>
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
                    <label className={labelCls}>Email Address *</label>
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
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number (optional)</label>
                    <div className="relative">
                      <Phone
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                      />
                      <input
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className={`${inputCls} pl-9`}
                      />
                    </div>
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
          {step === "confirm" && (
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

              {/* Summary card */}
              <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden mb-5">
                {/* Practitioner header */}
                <div className="flex items-center gap-4 p-5 border-b border-white/6">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-[15px] shrink-0 ${selectedPractitioner?.color}`}
                  >
                    {selectedPractitioner?.initials}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">
                      {selectedPractitioner?.name}
                    </p>
                    <p className="text-[12px] text-white/45">
                      {selectedPractitioner?.title}
                    </p>
                  </div>
                </div>

                {/* Booking details */}
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
                      value: selectedSlot,
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
                    {
                      icon: <Globe size={13} />,
                      label: "Languages",
                      value: selectedPractitioner?.languages.join(", ") ?? "",
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

                {/* Price */}
                <div className="flex items-center justify-between px-5 py-4 bg-white/3 border-t border-white/6">
                  <span className="text-[13px] text-white/50">Total</span>
                  <span className="text-[22px] font-serif font-semibold text-white">
                    ₦{selectedPractitioner?.price.toLocaleString()}
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

              {/* Trust badges */}
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
                    <Loader2 size={16} className="animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    Confirm & Pay ₦
                    {selectedPractitioner?.price.toLocaleString()} →
                  </>
                )}
              </button>
              <p className="text-[11px] text-white/25 text-center mt-3">
                Payment processed securely via Paystack. No subscription — pay
                per session.
              </p>
            </motion.div>
          )}

          {/* ── Step: Success ── */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle size={36} className="text-green-400" />
              </motion.div>

              <h2 className="font-serif text-[28px] font-semibold text-white mb-2">
                Booking Confirmed!
              </h2>
              <p className="text-[15px] text-white/50 mb-1">
                Your session with{" "}
                <span className="text-white font-medium">
                  {selectedPractitioner?.name}
                </span>{" "}
                is set.
              </p>
              <p className="text-[15px] text-(--green-pale) font-medium mb-8">
                {selectedSlot}
              </p>

              {meetingUrl && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6 text-left">
                  <Video size={18} className="text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white mb-0.5">
                      Your Video Session Link
                    </p>
                    <a
                      href={meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-blue-400 hover:text-white transition-colors truncate block"
                    >
                      {meetingUrl}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/4 border border-white/[0.07] mb-8 text-left">
                <Mail size={15} className="text-white/40 shrink-0 mt-0.5" />
                <p className="text-[13px] text-white/55 leading-relaxed">
                  A confirmation email with the meeting link and calendar invite
                  has been sent to{" "}
                  <span className="text-white">
                    {session?.user?.email ?? guestEmail}
                  </span>
                  .
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {session?.user ? (
                  <Link
                    href="/dashboard/customer/consultations"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-(--green-mid) hover:bg-(--green-light) text-white font-semibold rounded-xl transition-colors"
                  >
                    View in Dashboard →
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-(--green-mid) hover:bg-(--green-light) text-white font-semibold rounded-xl transition-colors"
                  >
                    Create Account to Track Sessions →
                  </Link>
                )}
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 border border-white/10] text-white/60 hover:text-white rounded-xl transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
