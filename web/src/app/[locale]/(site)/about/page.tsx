import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

const VALUES: { key: string; icon: IconName }[] = [
  { key: "trust", icon: "shield-check" },
  { key: "care", icon: "user" },
  { key: "speed", icon: "bolt" },
];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);

  return (
    <>
      <PageHero title={dict.about.title} subtitle={dict.about.subtitle} />

      <section className="container-page grid gap-12 py-16 lg:grid-cols-2 lg:py-20">
        <div className="space-y-5 text-[15px] leading-7 text-slate-700">
          <h2 className="text-2xl">{dict.about.storyTitle}</h2>
          <p>{dict.about.storyP1}</p>
          <p>{dict.about.storyP2}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href={`/${locale}/services`} className="btn-primary">
              {dict.nav.services}
            </Link>
            <Link href={`/${locale}/contact`} className="btn-outline">
              {dict.common.getInTouch}
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-lg">
              <Icon name="clock" size={20} className="text-primary" />
              {dict.about.hoursTitle}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>{dict.about.hoursWeekdays}</li>
              <li>{dict.about.hoursSunday}</li>
            </ul>
          </div>
          <div className="card space-y-4 p-6">
            <h3 className="flex items-center gap-2 text-lg">
              <Icon name="map-pin" size={20} className="text-primary" />
              {dict.common.visitUs}
            </h3>
            <p className="text-sm text-slate-600">
              {SITE.address.street}, {SITE.address.locality}, {SITE.address.city}{" "}
              {SITE.address.postalCode}
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <a href={SITE.phoneHref} className="inline-flex items-center gap-1.5 text-primary">
                <Icon name="phone" size={16} />
                {SITE.phoneDisplay}
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-1.5 text-primary"
              >
                <Icon name="mail" size={16} />
                {SITE.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <h2 className="text-center text-3xl">{dict.about.valuesTitle}</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {VALUES.map((value) => (
              <div key={value.key} className="card p-6 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary">
                  <Icon name={value.icon} size={24} />
                </span>
                <h3 className="mt-4 text-lg">
                  {dict.about.values[`${value.key}Title` as keyof typeof dict.about.values]}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {dict.about.values[`${value.key}Text` as keyof typeof dict.about.values]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
