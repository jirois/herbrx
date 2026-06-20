import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getSeedOrders } from "@/lib/dashboard-data";
import type { Metadata } from "next";
import { SettlementsPage } from "@/components/dashboard/settlements-page";

export const metadata: Metadata = { title: "Settlements — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/settlements");
  const orders = getSeedOrders();
  return <SettlementsPage orders={orders} />;
}
