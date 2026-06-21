import type { Metadata } from "next";
import { ContactPage } from "@/components/contact/contact-page";

export const metadata: Metadata = {
  title: "Contact Us — HerbRx",
  description:
    "Get in touch with the HerbRx team for consultations, safety review requests, producer support, and general enquiries.",
};

export default function Contact() {
  return <ContactPage />;
}
