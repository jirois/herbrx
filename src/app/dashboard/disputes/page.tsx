import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { DisputesPage } from "@/components/dashboard/disputes-page";

export const metadata: Metadata = { title: "Disputes — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/disputes");
  return <DisputesPage />;
}
