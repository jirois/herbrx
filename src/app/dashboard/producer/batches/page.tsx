import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BatchCOAPage } from "@/components/dashboard/producer/batch-coa-page";

export const metadata = { title: "Batch & COA Submissions — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <BatchCOAPage />;
}
