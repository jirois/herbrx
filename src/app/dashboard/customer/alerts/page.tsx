import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata = { title: "Customer Safety Alerts — HerbRx" };

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <DashboardShell
      heading="Customer Safety Alerts"
      subheading="This section is under active development."
    >
      <div className="flex items-center justify-center h-64 rounded-2xl border border-white/[0.07] bg-white/3">
        <div className="text-center">
          <div className="text-[40px] mb-3">🚧</div>
          <p className="text-white/60 text-[14px]">
            Coming soon — full implementation in progress.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
