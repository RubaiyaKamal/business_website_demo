"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { logout } from "@/lib/api-client";
import { adminNav, type AdminLabels } from "@/lib/admin";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

type Props = {
  locale: string;
  user: User;
  labels: AdminLabels;
  children: React.ReactNode;
};

export function AdminShell({ locale, user, labels, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const nav = adminNav(locale);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // ignore — we redirect regardless
    }
    router.push(`/${locale}/login`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">
        <aside
          className={cn(
            "fixed inset-y-0 start-0 z-40 w-64 shrink-0 bg-dark text-white transition-transform lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full lg:translate-x-0",
          )}
        >
          <div className="flex h-16 items-center gap-2 px-5">
            <Icon name="bolt" size={24} className="text-accent" />
            <span className="text-lg font-bold">GreenVolt</span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-xs">{labels.adminTitle}</span>
          </div>
          <nav className="space-y-1 px-3 py-4">
            {nav.map((item) => {
              const active =
                item.href === `/${locale}/admin`
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10",
                  )}
                >
                  <Icon name={item.icon as IconName} size={18} />
                  {labels[item.labelKey]}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto px-3 pb-6">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/75 transition hover:bg-white/10"
            >
              <Icon name="external-link" size={18} />
              {labels.viewSite}
            </Link>
          </div>
        </aside>

        {open && (
          <button
            type="button"
            aria-label={labels.close}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between gap-4 border-b border-black/5 bg-white px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="rounded-lg p-2 text-ink/70 hover:bg-surface lg:hidden"
              aria-label="Toggle navigation"
            >
              <Icon name="menu" size={22} />
            </button>
            <div className="ms-auto flex items-center gap-3">
              <div className="hidden text-end sm:block">
                <p className="text-xs text-ink/50">{labels.signedInAs}</p>
                <p className="text-sm font-semibold">{user.full_name}</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon name="user" size={18} />
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-surface"
              >
                <Icon name="log-out" size={16} />
                <span className="hidden sm:inline">{labels.logout}</span>
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
