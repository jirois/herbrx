import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default function Checkout() {
  return (
    <div className="min-h-screen bg-(--cream)">
      <div className="bg-white border-b border-(--cream-dark)">
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 py-5 flex items-center gap-8">
          <span className="font-serif text-[20px] font-semibold text-(--green-deep)">
            Checkout
          </span>
          <div className="flex items-center gap-2 text-[13px]">
            {["Cart", "Details", "Payment", "Confirm"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                {i > 0 && <span className="text-(--cream-dark)">›</span>}
                <span
                  className={
                    i === 1
                      ? "font-medium text-(--green-deep)"
                      : "text-(--text-muted)"
                  }
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 py-10">
        <CheckoutForm />
      </div>
    </div>
  );
}
