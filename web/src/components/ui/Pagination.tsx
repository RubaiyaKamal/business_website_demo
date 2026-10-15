import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { interpolate } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
  previousLabel: string;
  nextLabel: string;
  pageOfTemplate: string;
};

function buildHref(
  basePath: string,
  page: number,
  query: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  query = {},
  previousLabel,
  nextLabel,
  pageOfTemplate,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav className="mt-10 flex items-center justify-between gap-4" aria-label="Pagination">
      <PageLink
        href={buildHref(basePath, currentPage - 1, query)}
        disabled={!hasPrev}
        label={previousLabel}
        icon="arrow-left"
      />
      <span className="text-sm font-medium text-slate-500">
        {interpolate(pageOfTemplate, { page: currentPage, total: totalPages })}
      </span>
      <PageLink
        href={buildHref(basePath, currentPage + 1, query)}
        disabled={!hasNext}
        label={nextLabel}
        icon="arrow-right"
        iconEnd
      />
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  icon,
  iconEnd = false,
}: {
  href: string;
  disabled: boolean;
  label: string;
  icon: "arrow-left" | "arrow-right";
  iconEnd?: boolean;
}) {
  const content = (
    <>
      {!iconEnd ? <Icon name={icon} size={16} /> : null}
      <span>{label}</span>
      {iconEnd ? <Icon name={icon} size={16} /> : null}
    </>
  );

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn("btn-outline pointer-events-none opacity-40")}
      >
        {content}
      </span>
    );
  }

  return (
    <Link href={href} className="btn-outline">
      {content}
    </Link>
  );
}
