import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FlaggedItemsPage } from "@/components/dashboard/admin/flagged-items-page";

export const metadata = { title: "Flagged Items & Batch Review — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as { role?: string })?.role !== "ADMIN")
    redirect("/dashboard");
  return <FlaggedItemsPage />;
}
