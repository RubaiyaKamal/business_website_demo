import { Icon } from "@/components/ui/Icon";
import { SITE } from "@/lib/site";
import type { PublicSettings } from "@/lib/types";

type WhatsAppButtonProps = {
  settings: PublicSettings | null;
  label: string;
};

export function WhatsAppButton({ settings, label }: WhatsAppButtonProps) {
  const number = (settings?.whatsapp_number || "923365447805").replace(/[^\d]/g, "");
  const href = `https://wa.me/${number}?text=${encodeURIComponent(
    `Hello ${SITE.shortName}, I would like to know more about your products and services.`,
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 end-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:ring-offset-0"
      aria-label={label}
      title={label}
    >
      <Icon name="whatsapp" size={30} />
    </a>
  );
}
