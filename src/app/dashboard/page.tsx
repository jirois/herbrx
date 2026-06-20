import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  getSeedOrders,
  getDashboardStats,
  getRevenueByDay,
  getTopProducts,
} from "@/lib/dashboard-data";
import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = { title: "Dashboard — HerbRx" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard");

  const orders = getSeedOrders();
  const stats = getDashboardStats(orders);
  const revenue = getRevenueByDay(orders, 90);
  const topProducts = getTopProducts(orders, 5);
  const user = {
    ...session.user,
    email: session.user.email ?? "",
  };

  return (
    <DashboardOverview
      user={user}
      orders={orders}
      stats={stats}
      revenue={revenue}
      topProducts={topProducts}
    />
  );
}
