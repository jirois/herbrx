import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProductsManagementPage } from "@/components/dashboard/producer/products-management-page";

export const metadata = { title: "My Products — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as { role?: string })?.role;
  if (role !== "PRODUCER" && role !== "ADMIN") redirect("/dashboard");
  return <ProductsManagementPage />;
}
