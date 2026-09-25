import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StaffPage } from "@/components/dashboard/admin/staff-page";

export const metadata = { title: "Writers & Editors — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as { role?: string })?.role !== "ADMIN")
    redirect("/dashboard");
  return <StaffPage />;
}
