import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getSeedOrders } from "@/lib/dashboard-data";
import type { Metadata } from "next";
import { TransactionsPage } from "@/components/dashboard/transactions-page";

export const metadata: Metadata = { title: "Transactions — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/transactions");
  const orders = getSeedOrders();
  return <TransactionsPage orders={orders} />;
}
