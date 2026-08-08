import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { ProductsDashboard } from "@/components/dashboard/products-dashboard";

export const metadata: Metadata = { title: "Products — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/products");
  if ((session.user as { role?: string })?.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return <ProductsDashboard />;
}
