import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VerificationPage } from "@/components/dashboard/producer/verification-page";

export const metadata = { title: "Get HerbRx Verified — Seal of Safety" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as { role?: string })?.role;
  if (role !== "PRODUCER" && role !== "ADMIN") redirect("/dashboard");
  return <VerificationPage />;
}
