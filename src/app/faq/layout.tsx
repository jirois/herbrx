import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "FAQ — HerbRx",
  description:
    "Answers to the most common questions about HerbRx services, safety reviews, consultations, and the producer programme.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
