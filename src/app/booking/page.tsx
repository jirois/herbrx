import type { Metadata } from "next";
import { BookingPage } from "@/components/booking/booking-page";

export const metadata: Metadata = {
  title: "Book a Consultation — HerbRx",
  description:
    "Book a 30-minute video consultation with certified herbalists, naturopaths, toxicologists, and pharmacists. Safe herbal guidance from Nigerian experts.",
};

export default function Page() {
  return <BookingPage />;
}
