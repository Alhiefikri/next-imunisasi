import { requireAdmin } from "@/lib/auth-utils";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireAdmin();
  return <div>Dashboard</div>;
}
