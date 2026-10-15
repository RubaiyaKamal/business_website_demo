import { Icon } from "@/components/ui/Icon";
import { StarRating } from "@/components/ui/StarRating";
import type { Locale } from "@/lib/i18n";
import type { Testimonial } from "@/lib/types";
import { localized } from "@/lib/utils";

type TestimonialCardProps = {
  locale: Locale;
  testimonial: Testimonial;
};

export function TestimonialCard({ locale, testimonial }: TestimonialCardProps) {
  return (
    <figure className="card flex h-full flex-col p-6">
      <Icon name="quote" size={28} className="text-primary/30" />
      <StarRating rating={testimonial.rating} className="mt-3" />
      <blockquote className="mt-4 flex-1 text-sm leading-7 text-slate-700">
        {localized(locale, testimonial.message, testimonial.message_ur)}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 font-semibold text-primary">
          {testimonial.name.charAt(0)}
        </span>
        <span>
          <span className="block text-sm font-semibold text-dark">{testimonial.name}</span>
          {testimonial.role ? (
            <span className="block text-xs text-slate-500">{testimonial.role}</span>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}
