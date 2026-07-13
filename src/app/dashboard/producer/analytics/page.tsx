import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProducerAnalyticsPage } from "@/components/dashboard/producer/producer-analytics-page";

export const metadata = { title: "Analytics — HerbRx Producer" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as { role?: string })?.role !== "PRODUCER")
    redirect("/dashboard");
  return <ProducerAnalyticsPage />;
}
