import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import type { ConsultationType } from "@/types";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock,
  FlaskConical,
  Leaf,
  Loader2,
  Pill,
  Stethoscope,
  X,
} from "lucide-react";
import { BOOKABLE_DAYS_AHEAD, isWorkingDay } from "@/lib/booking-config";
import {
  useConsultantAvailability,
  customerApi,
} from "@/hooks/dashboard-hooks";

type BookingStep = "browse" | "slot" | "notes" | "confirm" | "success";
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

export function BookingFlow() {
  const [_, setTab] = useState<"upcoming" | "browse">("upcoming");
  const [selected, setSelected] = useState<Practitioner | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>("browse");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedSlotIso, setSelectedSlotIso] = useState<string>("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  // Verifying-payment overlay state, shown while we confirm a return from
  // Paystack checkout (see the ?ref= handling in the effect below).

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

  function resetBooking() {
    setSelected(null);
    setBookingStep("browse");
    setSelectedDay(null);
    setSelectedSlotIso("");
    setBookingNotes("");
    setTab("upcoming");
  }

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

  const SLOT_TAKEN_MESSAGE =
    "This time slot has already been reserved. Please select a different time or date.";

  const dateISO = selectedDay ? selectedDay.toISOString().slice(0, 10) : null;

  const {
    data: availData,
    loading: availLoading,
    mutate: refetchAvailability,
  } = useConsultantAvailability(selected?.id ?? null, dateISO);
  const slots = availData?.slots ?? [];
  const selectedSlot = slots.find((s) => s.iso === selectedSlotIso);

  async function confirmBooking() {
    if (!selected || !selectedSlotIso) return;

    // Client-side interception — never call the API for a slot we already
    // know is gone from the last availability fetch.
    if (!selectedSlot || !selectedSlot.available) {
      setBookingError(SLOT_TAKEN_MESSAGE);
      refetchAvailability();
      return;
    }

    setSubmitting(true);
    setBookingError(null);
    try {
      const result = await customerApi.bookConsultation({
        consultantId: selected.id,
        type: selected.type,
        scheduledAt: selectedSlotIso,
        notes: bookingNotes,
      });

      if (!result?.authorizationUrl) {
        throw new Error("Payment could not be started. Please try again.");
      }

      // Redirect the browser to the real Paystack checkout page. This is
      // the step that was entirely missing before — the "Confirm & Pay"
      // button previously never navigated anywhere; it just called the
      // booking API (which itself auto-confirmed with no payment) and
      // showed a fake success screen. Booking is only ever finalized
      // after the user actually completes checkout and we verify it on
      // return (see the useEffect above) or via webhook.
      window.location.href = result.authorizationUrl;
    } catch (err: unknown) {
      console.error("[confirmBooking]", err);
      setSubmitting(false);
      const msg =
        err instanceof Error
          ? err.message
          : "Could not start payment. Please try again.";
      setBookingError(msg);
      if (msg === SLOT_TAKEN_MESSAGE) refetchAvailability();
    }
  }

  return (
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
            <>
              {/* Modal header */}
              <div className="flex items-center gap-3 p-5 border-b border-white/[0.07]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 ${AVATAR_COLORS[0]}`}
                >
                  {initials(selected.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-white">
                    {selected.name}
                  </p>
                  <p className="text-[12px] text-white/40">
                    {typeConfig[selected.type].label}
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
                      Select an available time slot for your 30-minute session.
                    </p>

                    <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
                      {bookableDays.map((d) => {
                        const active =
                          selectedDay?.toDateString() === d.toDateString();
                        return (
                          <button
                            key={d.toISOString()}
                            onClick={() => {
                              setSelectedDay(d);
                              setSelectedSlotIso("");
                              setBookingError(null);
                            }}
                            className={`shrink-0 w-14 py-2 rounded-lg border text-center transition-colors ${active ? "bg-(--green-mid) border-(--green-mid) text-white" : "bg-white/3 border-white/8 text-white/60 hover:border-white/20"}`}
                          >
                            <span className="block text-[9px] uppercase tracking-wide opacity-70">
                              {d.toLocaleDateString("en-NG", {
                                weekday: "short",
                              })}
                            </span>
                            <span className="block text-[13px] font-serif font-semibold">
                              {d.getDate()}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {availLoading ? (
                      <div className="py-6 text-center text-[13px] text-white/40">
                        <Loader2
                          size={15}
                          className="animate-spin inline-block mr-2"
                        />{" "}
                        Checking availability…
                      </div>
                    ) : slots.length === 0 ? (
                      <p className="py-4 text-center text-[13px] text-white/40 mb-5">
                        {availData?.note ?? "No slots available this day."}
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mb-5">
                        {slots.map((slot) => (
                          <button
                            key={slot.iso}
                            disabled={!slot.available}
                            onClick={() =>
                              slot.available && setSelectedSlotIso(slot.iso)
                            }
                            title={
                              !slot.available ? "Already booked" : undefined
                            }
                            className={`text-left p-3 rounded-xl border text-[13px] transition-all ${
                              !slot.available
                                ? "border-white/5 bg-white/1.5 text-white/20 cursor-not-allowed line-through"
                                : slot.iso === selectedSlotIso
                                  ? "border-(--green-mid) bg-(--green-mid)/15 text-white"
                                  : "border-white/8 bg-white/3 text-white/60 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            <Calendar size={12} className="mb-1 opacity-60" />
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {bookingError && (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                        <AlertTriangle
                          size={14}
                          className="text-red-400 shrink-0 mt-0.5"
                        />
                        <p className="text-[12px] text-red-300">
                          {bookingError}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[13px] text-white/40 mb-5">
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} /> 30-minute session
                      </span>
                      <span className="font-semibold text-white">
                        ₦{CONSULTATION_PRICES[selected.type].toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => setBookingStep("notes")}
                      disabled={!selectedSlotIso}
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
                      Let <span className="text-white">{selected.name}</span>{" "}
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
                      This is shared privately with your practitioner before the
                      session.
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
                        className="flex-1 h-11 bg-(--green-mid) hover:bg-[var(--green-light) text-white font-medium rounded-xl transition-colors"
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
                        { label: "Practitioner", value: selected.name },
                        {
                          label: "Specialty",
                          value: typeConfig[selected.type].label,
                        },
                        {
                          label: "Date & Time",
                          value: selectedSlot?.label ?? "",
                        },
                        { label: "Duration", value: "30 minutes · Video call" },
                        {
                          label: "Fee",
                          value: `₦${CONSULTATION_PRICES[selected.type].toLocaleString()}`,
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
                    {bookingError && (
                      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                        <AlertTriangle
                          size={15}
                          className="text-red-400 shrink-0 mt-0.5"
                        />
                        <p className="text-[13px] text-red-300">
                          {bookingError}
                        </p>
                      </div>
                    )}

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
                            Redirecting to payment…
                          </>
                        ) : (
                          <>
                            Continue to Payment — ₦
                            {CONSULTATION_PRICES[
                              selected.type
                            ].toLocaleString()}
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-white/25 text-center mt-3">
                      You&apos;ll be redirected to Paystack&apos;s secure
                      checkout. Your session is only confirmed — and your
                      meeting link generated — once payment succeeds.
                    </p>
                  </div>
                )}
              </div>
            </>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
