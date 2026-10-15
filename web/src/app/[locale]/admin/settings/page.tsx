import { SettingsForm } from "@/components/admin/SettingsForm";
import { adminLabels } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth-server";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);
  return <SettingsForm labels={adminLabels(locale)} />;
}
