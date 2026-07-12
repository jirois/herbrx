"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  CreditCard,
  Building2,
  Truck,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { formatNaira, cn } from "@/lib/utils";
import { ProductImage } from "@/components/ui/product-image";
import type { OrderCustomer } from "@/types";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

type PaymentMethod = "card" | "transfer" | "cod";

type FieldProps = {
  label: string;
  id: keyof OrderCustomer;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  className?: string;
  children?: React.ReactNode;

  update: (field: keyof OrderCustomer, value: string) => void;
};

const paymentOptions = [
  {
    id: "card" as PaymentMethod,
    label: "Card / Bank / USSD",
    desc: "All channels via Paystack",
    icon: <CreditCard size={18} />,
  },
  {
    id: "transfer" as PaymentMethod,
    label: "Bank Transfer",
    desc: "Direct transfer — confirm in 1hr",
    icon: <Building2 size={18} />,
  },
  {
    id: "cod" as PaymentMethod,
    label: "Pay on Delivery",
    desc: "Cash / POS — Lagos only",
    icon: <Truck size={18} />,
  },
];

interface FieldError {
  [k: string]: string;
}

function validate(d: Partial<OrderCustomer>): FieldError {
  const e: FieldError = {};
  if (!d.firstName?.trim()) e.firstName = "Required";
  if (!d.lastName?.trim()) e.lastName = "Required";
  if (!d.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
    e.email = "Valid email required";
  if (!d.phone?.match(/^(\+234|0)[789][01]\d{8}$/))
    e.phone = "Valid Nigerian number required";
  if (!d.address?.trim()) e.address = "Delivery address required";
  if (!d.city?.trim()) e.city = "City required";
  if (!d.state) e.state = "State required";
  return e;
}

// Field helper (declare outside component to avoid recreation on render)
const Field = ({
  label,
  id,
  type = "text",
  placeholder,
  value,
  error,
  className,
  children,
  update,
}: FieldProps) => (
  <div className={className}>
    <label
      htmlFor={id}
      className="block text-[13px] font-medium text-(--text-body) mb-1.5"
    >
      {label}
    </label>
    {children ?? (
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => update && update(id, e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          "w-full px-4 py-3 rounded-xl border text-[14px] bg-white text-(--text-dark)",
          "placeholder:text-(--text-muted) outline-none transition-all duration-200",
          error
            ? "border-red-400 focus:ring-2 focus:ring-red-200"
            : "border-(--cream-dark) focus:border-(--green-mid) focus:ring-2 focus:ring-(--green-pale)",
        )}
      />
    )}
    {error && <p className="text-[12px] text-red-500 mt-1">⚠ {error}</p>}
  </div>
);

// Paystack inline popup types
declare global {
  interface Window {
    PaystackPop?: {
      setup(opts: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        metadata?: Record<string, unknown>;
        onClose: () => void;
        callback: (res: { reference: string; status: string }) => void;
      }): { openIframe(): void };
    };
  }
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { user } = useAuth();
  const paystackLoaded = useRef(false);

  // Pre-fill form from auth session
  const [form, setForm] = useState<Partial<OrderCustomer>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  // Keep state sync updated if auth loading finishes late
  const customer = {
    firstName: form.firstName || user?.firstName || "",
    lastName: form.lastName || user?.lastName || "",
    email: form.email || user?.email || "",
    phone: form.phone || user?.phone || "",
    address: form.address,
    city: form.city,
    state: form.state,
  };

  // const customer = { ...prefill, ...form };

  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "initializing" | "processing" | "verifying"
  >("idle");

  // Load Paystack inline JS once
  useEffect(() => {
    if (paystackLoaded.current || typeof window === "undefined") return;
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      paystackLoaded.current = true;
    };
    document.body.appendChild(script);
    return () => {
      /* leave loaded */
    };
  }, []);

  function update(field: keyof OrderCustomer, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field])
      setErrors((e) => {
        const n = { ...e };
        delete n[field];
        return n;
      });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    try {
      if (payment === "card") {
        await handlePaystack();
      } else {
        await handleManualOrder();
      }
    } catch (err: unknown) {
      console.error("[Checkout]", err);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Something went wrong. Please try again.";
      setErrors({
        _global: message,
      });
      setLoading(false);
      setStatus("idle");
    }
  }

  // ── Paystack card flow ───────
  async function handlePaystack() {
    setStatus("initializing");

    const res = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: form,
        items,
        subtotal,
        shipping,
        total,
      }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error ?? "Payment initialization failed");

    const { orderId, reference } = data;

    // Open Paystack popup
    setStatus("processing");

    if (!window.PaystackPop)
      throw new Error("Paystack script not loaded. Please refresh.");

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
      email: form.email!,
      amount: total * 100, // kobo
      ref: reference,
      metadata: {
        orderId,
        customer_name: `${form.firstName} ${form.lastName}`,
      },
      onClose: () => {
        setLoading(false);
        setStatus("idle");
      },
      callback: async (response) => {
        if (response.status === "success") {
          await completeOrder(orderId, response.reference);
        } else {
          setErrors({
            _global: "Payment was not completed. Please try again.",
          });
          setLoading(false);
          setStatus("idle");
        }
      },
    });

    handler.openIframe();
  }

  // ── Verify + complete ───
  async function completeOrder(orderId: string, reference: string) {
    setStatus("verifying");

    const verifyRes = await fetch(
      `/api/paystack/verify?reference=${reference}`,
    );
    const verifyData = await verifyRes.json();

    if (!verifyData.paid) {
      throw new Error(
        "Payment verification failed. Contact support with your reference: " +
          reference,
      );
    }

    // Persist to localStorage for success page
    localStorage.setItem(
      "herbrx_last_order",
      JSON.stringify({
        id: orderId,
        paystackRef: reference,
        items,
        customer: form,
        subtotal,
        shipping,
        total,
        paymentMethod: "card",
        paymentStatus: "paid",
        status: "confirmed",
        createdAt: new Date().toISOString(),
      }),
    );

    clearCart();
    router.push(`/checkout/success?order=${orderId}`);
  }

  // ── COD / Transfer flow ────
  async function handleManualOrder() {
    setStatus("processing");
    // Slight delay to simulate server round-trip
    await new Promise((r) => setTimeout(r, 800));

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    localStorage.setItem(
      "herbrx_last_order",
      JSON.stringify({
        id: orderId,
        items,
        customer: form,
        subtotal,
        shipping,
        total,
        paymentMethod: payment,
        paymentStatus: "pending",
        status: "pending",
        createdAt: new Date().toISOString(),
      }),
    );

    clearCart();
    router.push(`/checkout/success?order=${orderId}`);
  }

  const statusLabel = {
    idle: `Place Order — ${formatNaira(total)}`,
    initializing: "Initializing payment…",
    processing: "Opening payment…",
    verifying: "Verifying payment…",
  }[status];

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors._global && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
        >
          <span>⚠️</span> {errors._global}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        {/* ── Left column ── */}
        <div className="space-y-7">
          {/* Contact */}
          <section className="bg-white rounded-2xl border border-(--cream-dark) p-7">
            <h2 className="font-serif text-[20px] font-semibold text-(--green-deep) mb-5">
              Contact Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="First Name"
                id="firstName"
                value={customer.firstName}
                error={errors.firstName}
                update={update}
              />
              <Field
                label="Last Name"
                id="lastName"
                placeholder="Okafor"
                value={customer.lastName ?? ""}
                error={errors.lastName}
                update={update}
              />

              <Field
                label="Email Address"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={customer.email ?? ""}
                error={errors.email}
                update={update}
              />
              <Field
                label="Phone Number"
                id="phone"
                type="tel"
                placeholder="08012345678"
                value={customer.phone ?? ""}
                error={errors.phone}
                update={update}
              />
            </div>
          </section>

          {/* Delivery */}
          <section className="bg-white rounded-2xl border border-(--cream-dark) p-7">
            <h2 className="font-serif text-[20px] font-semibold text-(--green-deep) mb-5">
              Delivery Address
            </h2>
            <div className="space-y-4">
              <Field
                label="Street Address"
                id="address"
                placeholder="12 Herbert Macaulay Way"
                value={customer.address ?? ""}
                error={errors.address}
                update={update}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="City / Town"
                  id="city"
                  placeholder="Lagos"
                  value={customer.city ?? ""}
                  error={errors.city}
                  update={update}
                />
                <Field
                  label="State"
                  id="state"
                  value={customer.state ?? ""}
                  error={errors.state}
                  update={update}
                >
                  <div className="relative">
                    <select
                      id="state"
                      value={customer.state}
                      onChange={(e) => update("state", e.target.value)}
                      className={cn(
                        "w-full appearance-none px-4 py-3 pr-9 rounded-xl border text-[14px] bg-white text-(--text-dark) outline-none transition-all cursor-pointer",
                        errors.state
                          ? "border-red-400 focus:ring-2 focus:ring-red-200"
                          : "border-(--cream-dark) focus:border-(--green-mid) focus:ring-2 focus:ring-(--green-pale)",
                      )}
                    >
                      <option value="">Select state</option>
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                    />
                  </div>
                </Field>
              </div>
            </div>
          </section>

          {/* Payment method */}
          <section className="bg-white rounded-2xl border border-(--cream-dark) p-7">
            <h2 className="font-serif text-[20px] font-semibold text-(--green-deep) mb-5">
              Payment Method
            </h2>
            <div className="space-y-3">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.id}
                  htmlFor={`pay-${opt.id}`}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all select-none",
                    payment === opt.id
                      ? "border-(--green-mid) bg-(--green-pale)/15"
                      : "border-(--cream-dark) hover:border-(--green-pale)",
                  )}
                >
                  <input
                    type="radio"
                    id={`pay-${opt.id}`}
                    name="payment"
                    value={opt.id}
                    checked={payment === opt.id}
                    onChange={() => setPayment(opt.id)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0",
                      payment === opt.id
                        ? "bg-(--green-pale) text-(--green-mid)"
                        : "bg-(--cream-dark) text-(--text-muted)",
                    )}
                  >
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[14px] text-(--text-dark)">
                      {opt.label}
                    </p>
                    <p className="text-[12px] text-(--text-muted)">
                      {opt.desc}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                      payment === opt.id
                        ? "border-(--green-mid)"
                        : "border-(--cream-dark)",
                    )}
                  >
                    {payment === opt.id && (
                      <div className="w-2 h-2 rounded-full bg-(--green-mid)" />
                    )}
                  </div>
                </label>
              ))}
            </div>

            {payment === "transfer" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-[13px] text-amber-800"
              >
                <strong>Bank transfer details:</strong>
                <br />
                Bank: Opay Nigeria · Account: 8034906770
                <br />
                Name: HerbRx Ltd · Use your order ID as reference.
                <br />
                Orders confirmed within 1 business hour.
              </motion.div>
            )}

            {payment === "cod" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-[13px] text-blue-800"
              >
                Pay on delivery is available within Lagos only.
                <br />
                Our rider will call you before arrival. Cash or POS accepted.
              </motion.div>
            )}
          </section>
        </div>

        {/* ── Right: Order Summary ── */}
        <div>
          <div className="bg-white rounded-2xl border border-(--cream-dark) p-6 sticky top-24">
            <h2 className="font-serif text-[20px] font-semibold text-(--green-deep) mb-5">
              Order Summary
            </h2>

            <div className="space-y-3 mb-5 max-h-65 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${item.product.gradientFrom}, ${item.product.gradientTo})`,
                    }}
                  >
                    <ProductImage
                      src={item.product.imageUrl}
                      emoji={item.product.emoji}
                      size="w-10 h-10"
                      theme="light"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-(--text-dark) truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[12px] text-(--text-muted)">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-[13px] font-semibold text-(--green-mid) shrink-0">
                    {formatNaira(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-[14px] border-t border-(--cream-dark) pt-4 mb-5">
              <div className="flex justify-between text-(--text-body)">
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-(--text-body)">
                <span>Shipping</span>
                <span
                  className={
                    shipping === 0 ? "text-(--green-mid) font-medium" : ""
                  }
                >
                  {shipping === 0 ? "Free 🎉" : formatNaira(shipping)}
                </span>
              </div>
              <div className="flex justify-between font-serif text-[20px] font-semibold text-(--green-deep) pt-2 border-t border-(--cream-dark)">
                <span>Total</span>
                <span>{formatNaira(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full flex items-center justify-center gap-2.5 bg-(--green-deep) hover:bg-(--green-mid) text-white py-4 rounded-full font-medium text-[15px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {statusLabel}
                </>
              ) : (
                statusLabel
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[12px] text-(--text-muted) mt-3">
              <Shield size={12} />
              Secured by Paystack · SSL encrypted
            </div>

            <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-(--cream-dark)">
              {["Visa", "Mastercard", "Verve", "GTB", "USSD"].map((p) => (
                <span
                  key={p}
                  className="text-[10px] bg-(--cream-dark) text-(--text-muted) px-2 py-0.5 rounded font-medium"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
