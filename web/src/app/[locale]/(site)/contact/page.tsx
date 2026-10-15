import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/layout/PageHero";
import { Icon } from "@/components/ui/Icon";
import { getPublicSettings, getServices } from "@/lib/api";
import { whatsappLink } from "@/lib/env";
import { getDictionary, resolveLocale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);
  return { title: dict.contact.title, description: dict.contact.subtitle };
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const dict = getDictionary(locale);
  const { service } = await searchParams;

  const [settings, services] = await Promise.all([getPublicSettings(), getServices(1, 50)]);

  const email = settings?.contact_email || SITE.email;
  const phone = settings?.contact_phone || SITE.phoneDisplay;
  const street = settings?.address_street || SITE.address.street;
  const city = settings?.address_city || SITE.address.city;
  const mapSrc =
    settings?.google_maps_embed_url ||
    `https://www.google.com/maps?q=${encodeURIComponent(SITE.mapsQuery)}&output=embed`;

  const serviceOptions = services.items.map((item) => ({
    id: item.id,
    title: item.title,
  }));
  const defaultServiceId =
    service && serviceOptions.some((option) => String(option.id) === service) ? service : "";

  return (
    <>
      <PageHero title={dict.contact.title} subtitle={dict.contact.subtitle} />
      <section className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.35fr]">
        <div className="space-y-6">
          <div className="card space-y-4 p-6">
            <h2 className="text-lg">{dict.contact.infoTitle}</h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Icon name="map-pin" size={18} className="mt-0.5 shrink-0 text-primary" />
                <span className="text-slate-600">
                  {street}, {city}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="phone" size={18} className="shrink-0 text-primary" />
                <a href={SITE.phoneHref} className="text-slate-600 hover:text-primary">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="mail" size={18} className="shrink-0 text-primary" />
                <a href={`mailto:${email}`} className="text-slate-600 hover:text-primary">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="whatsapp" size={18} className="mt-0.5 shrink-0 text-primary" />
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-primary"
                >
                  {dict.common.chatOnWhatsApp}
                </a>
              </li>
            </ul>
          </div>

          <div className="card overflow-hidden">
            <h2 className="px-6 pt-6 text-lg">{dict.contact.mapTitle}</h2>
            <iframe
              title={dict.contact.mapTitle}
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="mt-4 h-64 w-full border-0"
            />
          </div>
        </div>

        <ContactForm
          labels={dict.contact}
          serviceOptions={serviceOptions}
          serviceLabel={dict.contact.formService}
          serviceNoneLabel={dict.contact.formServiceNone}
          sendingLabel={dict.common.sending}
          defaultServiceId={defaultServiceId}
        />
      </section>
    </>
  );
}
