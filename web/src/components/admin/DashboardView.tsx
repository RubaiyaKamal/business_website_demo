"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getDashboardStats } from "@/lib/api-client";
import type { AdminLabels } from "@/lib/admin";
import { adminNav } from "@/lib/admin";
import { formatDate } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types";

type Props = {
  locale: string;
  labels: AdminLabels;
  userName: string;
};

const CARDS: { key: keyof DashboardStats; labelKey: keyof AdminLabels; icon: IconName }[] = [
  { key: "services", labelKey: "totalServices", icon: "wrench" },
  { key: "projects", labelKey: "totalProjects", icon: "briefcase" },
  { key: "blog_posts", labelKey: "totalPosts", icon: "newspaper" },
  { key: "testimonials", labelKey: "totalTestimonials", icon: "star" },
  { key: "inquiries_new", labelKey: "newInquiries", icon: "inbox" },
  { key: "inquiries_total", labelKey: "totalInquiries", icon: "mail" },
];

export function DashboardView({ locale, labels, userName }: Props) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : labels.error),
      );
  }, [labels.error]);

  const nav = adminNav(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {labels.welcome}, {userName}
        </h1>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {CARDS.map((card) => (
          <div key={card.key} className="rounded-xl border border-black/5 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon name={card.icon} size={20} />
              </span>
              <span className="text-3xl font-bold">
                {stats ? String(stats[card.key]) : "—"}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink/60">{labels[card.labelKey]}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-black/5 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
            <h2 className="font-semibold">{labels.recentInquiries}</h2>
            <Link
              href={`/${locale}/admin/inquiries`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {labels.inquiries}
            </Link>
          </div>
          {stats && stats.recent_inquiries.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink/50">{labels.noInquiries}</p>
          ) : (
            <ul className="divide-y divide-black/5">
              {stats?.recent_inquiries.map((item) => (
                <li key={item.id} className="flex items-start gap-3 px-5 py-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-ink/50">
                    <Icon name="mail" size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.subject}</p>
                    <p className="truncate text-xs text-ink/50">
                      {item.name} · {item.email}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-ink/40">
                    {formatDate(item.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-black/5 bg-white p-5">
          <h2 className="mb-4 font-semibold">{labels.adminTitle}</h2>
          <div className="space-y-2">
            {nav.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink/70 transition hover:bg-surface"
              >
                <Icon name={item.icon as IconName} size={16} />
                {labels[item.labelKey]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
