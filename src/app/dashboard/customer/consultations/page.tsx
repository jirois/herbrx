import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ConsultationsPage } from "@/components/dashboard/customer/consultations-page";

export const metadata = { title: "Consultations — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <ConsultationsPage />;
}
