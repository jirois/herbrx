import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Safety Guides — HerbRx",
  description:
    "Free evidence-based herbal safety guides in English, Igbo, Yoruba, Hausa, and Pidgin.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
