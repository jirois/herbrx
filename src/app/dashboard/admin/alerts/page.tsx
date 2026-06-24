import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SafetyAlertsPage } from "@/components/dashboard/admin/safety-alerts-page";

export const metadata = { title: "Safety Alert Management — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as { role?: string })?.role;
  if (role !== "ADMIN") redirect("/dashboard");
  return <SafetyAlertsPage />;
}
