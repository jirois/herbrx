import { redirect } from "next/navigation";

// Batch review lives inside the Flagged Items page (tabbed)
export default function Page() {
  redirect("/dashboard/admin/flags?tab=batches");
}
