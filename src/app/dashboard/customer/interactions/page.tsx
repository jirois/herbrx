import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InteractionEngine } from "@/components/dashboard/customer/interaction-engine";

export const metadata = { title: "Interaction Engine — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <InteractionEngine />;
}
