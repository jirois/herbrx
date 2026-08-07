import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ConsultantsPage } from "@/components/dashboard/admin/consultants-page";

export const metadata = { title: "Consultants — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as { role: string })?.role !== "ADMIN")
    redirect("/dashboard");
  return <ConsultantsPage />;
}
