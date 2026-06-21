import type { Metadata } from "next";
import { ServicesPage } from "@/components/services/services-page";

export const metadata: Metadata = {
  title: "Services — HerbRx",
  description:
    "Safety reviews, expert consultations, educational resources, and producer consultancy — all the herbal health services you need, in your language.",
};

export default function Services() {
  return <ServicesPage />;
}
