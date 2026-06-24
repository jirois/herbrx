import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersManagementPage } from "@/components/dashboard/admin/users-management-page";

export const metadata = { title: "User Management — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as { role?: string })?.role !== "ADMIN")
    redirect("/dashboard");
  return <UsersManagementPage />;
}
