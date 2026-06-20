import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { AccountSettings } from "@/components/account/account-settings";

export const metadata: Metadata = { title: "Account Settings" };

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/account/settings");

  const user = {
    ...session.user,
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    image: session.user.image ?? undefined,
  };

  return <AccountSettings user={user} />;
}
