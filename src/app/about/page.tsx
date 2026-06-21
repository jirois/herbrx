import type { Metadata } from "next";
import { AboutPage } from "@/components/about/about-page";

export const metadata: Metadata = {
  title: "About HerbRx — Our Story, Mission & Team",
  description:
    "Learn how HerbRx is making herbal health safe for every Nigerian through science-backed reviews, expert consultations, and multi-language resources.",
};

export default function About() {
  return <AboutPage />;
}
