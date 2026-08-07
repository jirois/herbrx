import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

// Role-specific dashboard components
// import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { CustomerDashboard } from "@/components/dashboard/customer/customer-dashboard";
import { ProducerDashboard } from "@/components/dashboard/producer/producer-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin/admin-dashboard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ConsultantDashboard } from "@/components/dashboard/consultant/consultant-dashboard";

// import { generateSeedOrders } from "@/lib/dashboard-data";

type DashboardUser = {
  firstName: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: "ADMIN" | "CONSULTANT" | "PRODUCER" | "CUSTOMER";
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as DashboardUser;
  const role = user.role ?? "CUSTOMER";

  if (role === "ADMIN") {
    return <AdminDashboard user={user} />;
  }
  // ── Consultant ──────────
  if (role === "CONSULTANT") {
    return <ConsultantDashboard user={user} />;
  }

  if (role === "PRODUCER") {
    return (
      <DashboardShell>
        <ProducerDashboard user={user} tier="UNVERIFIED" />
      </DashboardShell>
    );
  }

  // CUSTOMER (default) — keep legacy merchant overview for now or show new Safe-Health Hub
  // Switch to CustomerDashboard once old merchant data is migrated
  // const data = await generateSeedOrders();

  return (
    <DashboardShell>
      <CustomerDashboard user={user} />
    </DashboardShell>
  );
}
