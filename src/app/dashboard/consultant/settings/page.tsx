import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ConsultantSettingsPage } from "@/components/dashboard/consultant/settings-page";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as { role?: string })?.role;
  if (role !== "CONSULTANT") redirect("/dashboard");

  return <ConsultantSettingsPage />;
}
