import { cn } from "@/lib/cn";
import { Bean } from "@/components/brand/bean";
import { STAMPS_PER_CARD } from "@/lib/stores/loyalty";

/**
 * The bean-stamp card. Geometry is taken from the bean language foundation:
 * a bean-shaped outline that fills with a latte tint once stamped.
 */
export function StampCard({
  stamps,
  total = STAMPS_PER_CARD,
  size = "md",
  className,
}: {
  stamps: number;
  total?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const filled = Math.max(0, Math.min(stamps, total));
  const dimensions = {
    sm: "h-8 w-6",
    md: "h-10 w-[30px]",
    lg: "h-14 w-[42px]",
  }[size];

  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role="img"
      aria-label={`${filled} of ${total} stamps collected`}
    >
      {Array.from({ length: total }, (_, index) => {
        const isFilled = index < filled;
        return (
          <span
            key={index}
            aria-hidden="true"
            className={cn(
              "grid place-items-center rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-[1.5px]",
              "transition-[background-color,border-color,opacity] duration-std ease-brand",
              dimensions,
              isFilled
                ? "border-espresso bg-[color-mix(in_oklab,var(--color-latte),var(--color-cream)_30%)] opacity-100"
                : "border-latte opacity-50",
            )}
          >
            {isFilled ? <Bean className="w-[46%]" /> : null}
          </span>
        );
      })}
    </div>
  );
}

/** Compact progress read-out for the header and the loyalty tile. */
export function StampProgress({
  stamps,
  total = STAMPS_PER_CARD,
  className,
}: {
  stamps: number;
  total?: number;
  className?: string;
}) {
  const remaining = Math.max(0, total - stamps);

  return (
    <p className={cn("t-body-s text-muted", className)}>
      <span className="font-mono text-fg">
        {stamps}/{total}
      </span>{" "}
      {remaining === 0
        ? "— card complete, reward ready."
        : `— ${remaining} more cup${remaining > 1 ? "s" : ""} to a free coffee.`}
    </p>
  );
}
