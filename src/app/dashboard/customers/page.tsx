import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getSeedOrders } from "@/lib/dashboard-data";
import type { Metadata } from "next";
import { CustomersPage } from "@/components/dashboard/customers-page";

export const metadata: Metadata = { title: "Customers — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/customers");
  const orders = getSeedOrders();
  return <CustomersPage orders={orders} />;
}
