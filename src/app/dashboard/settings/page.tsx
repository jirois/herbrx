import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { DashboardSettings } from "@/components/dashboard/dashboarding-settings";

export const metadata: Metadata = { title: "Settings — HerbRx Dashboard" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/settings");
  return (
    <DashboardSettings
      user={{
        ...session.user,
        email: session.user.email || "",
        name: session.user.name || "",
      }}
    />
  );
}
