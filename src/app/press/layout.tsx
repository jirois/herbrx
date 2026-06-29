import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press & Media — HerbRx",
  description:
    "Press releases, media coverage, brand assets, and contact for journalists and media partners.",
};

export default function PressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
