import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EditorDashboard } from "@/components/dashboard/editor/editor-dashboard";

export const metadata = { title: "Editorial Review - HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as { role?: string })?.role;
  if (role !== "EDITOR" && role !== "ADMIN") redirect("/dashboard");
  return <EditorDashboard />;
}
