import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getUserOrders } from "@/lib/orders";
import type { Metadata } from "next";
import { AccountDashboard } from "@/components/account/account-dashboard";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/account");

  const email = session.user.email;
  if (!email) redirect("/login?callbackUrl=/account");

  const user = {
    ...session.user,
    email,
    name: session.user.name ?? "",
    image: session.user.image ?? undefined,
  };
  const recentOrders = getUserOrders(email).slice(0, 3);

  return <AccountDashboard user={user} recentOrders={recentOrders} />;
}
