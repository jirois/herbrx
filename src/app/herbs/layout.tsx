import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Herb Directory — HerbRx",
  description:
    "Science-backed safety profiles for Nigerian medicinal plants — benefits, risks, drug interactions, and local names.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
