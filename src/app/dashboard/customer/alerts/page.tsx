import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomerAlertsPage } from "@/components/dashboard/customer/customer-alerts-page";

export const metadata = { title: "Safety Alerts — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <CustomerAlertsPage />;
}
