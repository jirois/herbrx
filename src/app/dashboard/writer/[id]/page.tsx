import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WriterPostForm } from "@/components/dashboard/writer/writer-post-form";

export const metadata = { title: "Edit Post — HerbRx" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as { role?: string })?.role;
  if (role !== "WRITER" && role !== "ADMIN") redirect("/dashboard");
  const { id } = await params;
  return <WriterPostForm postId={id} />;
}
