import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getSeedOrders, getTopProducts } from "@/lib/dashboard-data";
import { products } from "@/data/products";
import type { Metadata } from "next";
import { ProductsDashboard } from "@/components/dashboard/products-dashboard";

export const metadata: Metadata = { title: "Products — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/products");
  const orders = getSeedOrders();
  const topProds = getTopProducts(orders, 20);
  return <ProductsDashboard products={products} topProducts={topProds} />;
}
