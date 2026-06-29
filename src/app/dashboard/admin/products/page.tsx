import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminProductsPage } from "@/components/dashboard/admin/admin-products-page";

export const metadata = { title: "Product Management — HerbRx Admin" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as { role?: string })?.role !== "ADMIN")
    redirect("/dashboard");
  return <AdminProductsPage />;
}
