import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Safety Reviews — HerbRx",
  description:
    "Independent safety reviews of Nigerian herbal products — COA analysis, lab parameters, and verdicts published openly.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
