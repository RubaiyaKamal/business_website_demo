import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminLabels } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth-server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireAdmin(locale);
  const labels = adminLabels(locale);

  return (
    <AdminShell locale={locale} user={user} labels={labels}>
      {children}
    </AdminShell>
  );
}
