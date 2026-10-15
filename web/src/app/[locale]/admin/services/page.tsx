import { ResourceManager } from "@/components/admin/ResourceManager";
import { RESOURCES, adminLabels } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth-server";

export default async function AdminServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);
  return <ResourceManager resource={RESOURCES.services} labels={adminLabels(locale)} />;
}
