import { InquiryInbox } from "@/components/admin/InquiryInbox";
import { adminLabels } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth-server";

export default async function AdminInquiriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);
  return <InquiryInbox labels={adminLabels(locale)} />;
}
