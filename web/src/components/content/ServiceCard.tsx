import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n";
import type { ServiceListItem } from "@/lib/types";
import { formatPrice, localized } from "@/lib/utils";

const KNOWN_ICONS: IconName[] = [
  "smartphone",
  "laptop",
  "truck",
  "shield-check",
  "credit-card",
  "tv",
  "wrench",
];

type ServiceCardProps = {
  locale: Locale;
  service: ServiceListItem;
  priceLabel: string;
  detailsLabel: string;
};

export function ServiceCard({ locale, service, priceLabel, detailsLabel }: ServiceCardProps) {
  const icon: IconName =
    service.icon && (KNOWN_ICONS as string[]).includes(service.icon)
      ? (service.icon as IconName)
      : "wrench";

  return (
    <article className="card group flex flex-col p-6 transition-shadow hover:shadow-card-hover">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary">
        <Icon name={icon} size={26} />
      </span>
      <h3 className="mt-5 text-lg">{localized(locale, service.title, service.title_ur)}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
        {localized(locale, service.summary, service.summary_ur)}
      </p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        {service.price_from !== null ? (
          <span className="text-sm font-semibold text-dark">
            {priceLabel} {formatPrice(service.price_from, locale)}
          </span>
        ) : (
          <span />
        )}
        <Link
          href={`/${locale}/services/${service.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-700"
        >
          {detailsLabel}
          <Icon name="arrow-right" size={15} className="rtl:rotate-180" />
        </Link>
      </div>
    </article>
  );
}
