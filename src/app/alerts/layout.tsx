import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Safety Alerts — HerbRx",
  description:
    "Real-time warnings about adulterated, counterfeit, or dangerous herbal products in Nigeria.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
