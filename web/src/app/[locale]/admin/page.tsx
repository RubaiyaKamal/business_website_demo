import { DashboardView } from "@/components/admin/DashboardView";
import { adminLabels } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth-server";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireAdmin(locale);

  return (
    <DashboardView locale={locale} labels={adminLabels(locale)} userName={user.full_name} />
  );
}
