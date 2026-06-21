import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderSuccessContent } from "@/components/checkout/order-success";

export const metadata: Metadata = { title: "Order Confirmed — Thank You!" };

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-(--cream) flex items-center justify-center">
          <div className="text-(--text-muted) text-[15px]">
            Loading your order…
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
