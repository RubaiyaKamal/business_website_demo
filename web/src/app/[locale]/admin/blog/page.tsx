import { ResourceManager } from "@/components/admin/ResourceManager";
import { RESOURCES, adminLabels } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth-server";

export default async function AdminBlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);
  return <ResourceManager resource={RESOURCES.blog} labels={adminLabels(locale)} />;
}
