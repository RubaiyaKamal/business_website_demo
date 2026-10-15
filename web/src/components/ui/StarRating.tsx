import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  rating: number;
  className?: string;
  size?: number;
};

export function StarRating({ rating, className, size = 16 }: StarRatingProps) {
  const rounded = Math.round(rating);
  return (
    <div
      className={cn("flex items-center gap-0.5 text-accent", className)}
      role="img"
      aria-label={`${rating} / 5`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Icon
          key={index}
          name="star"
          size={size}
          className={index < rounded ? "fill-accent stroke-accent" : "stroke-slate-300"}
        />
      ))}
    </div>
  );
}
