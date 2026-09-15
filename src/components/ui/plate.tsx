import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Mark } from "@/components/brand/mark";
import type { PlateTone } from "@/lib/ui/plate-tone";

/**
 * Art-directed imagery surface. The design export ships photography as tonal
 * plates with a grain overlay rather than stock imagery, so this is the real
 * treatment: warm, cinematic, shallow, golden — never bright corporate stock.
 */

const tones: Record<PlateTone, { surface: string; wash: string; onDark: boolean }> = {
  espresso: {
    surface: "bg-[linear-gradient(150deg,#3a2c2a,#241b1a_60%)]",
    wash:
      "bg-[radial-gradient(circle_at_28%_22%,rgba(203,183,146,0.42),transparent_52%),radial-gradient(circle_at_78%_82%,rgba(0,0,0,0.55),transparent_58%)]",
    onDark: true,
  },
  connection: {
    surface: "bg-[linear-gradient(160deg,#4a3836,#2b2120_65%)]",
    wash:
      "bg-[radial-gradient(circle_at_68%_28%,rgba(203,183,146,0.34),transparent_55%),radial-gradient(circle_at_20%_88%,rgba(0,0,0,0.5),transparent_60%)]",
    onDark: true,
  },
  origin: {
    surface: "bg-[linear-gradient(135deg,#332624,#1c1514_70%)]",
    wash:
      "bg-[radial-gradient(circle_at_50%_18%,rgba(203,183,146,0.5),transparent_48%),radial-gradient(circle_at_85%_92%,rgba(0,0,0,0.55),transparent_55%)]",
    onDark: true,
  },
  paper: {
    surface: "pat-paper",
    wash:
      "bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(74,56,54,0.16),transparent_60%)]",
    onDark: false,
  },
};

export function Plate({
  tone = "espresso",
  kicker,
  caption,
  badge,
  watermark = false,
  className,
  children,
  rounded = "lg",
}: {
  tone?: PlateTone;
  /** Small mono line above the caption — the art-direction key. */
  kicker?: string;
  caption?: string;
  badge?: string;
  /** Oversized Mark, bled off the corner. */
  watermark?: boolean;
  className?: string;
  children?: ReactNode;
  rounded?: "md" | "lg" | "none";
}) {
  const { surface, wash, onDark } = tones[tone];
  const radius = rounded === "none" ? "" : rounded === "md" ? "rounded-md" : "rounded-lg";

  return (
    <div
      className={cn(
        "relative isolate flex flex-col justify-end overflow-hidden border border-line",
        radius,
        surface,
        className,
      )}
    >
      <div aria-hidden="true" className={cn("absolute inset-0 mix-blend-overlay opacity-50", wash)} />

      {watermark ? (
        <Mark
          onDark={onDark}
          className={cn(
            "pointer-events-none absolute -top-8 -right-10 z-0 w-40 rotate-6",
            onDark ? "opacity-[0.14]" : "opacity-[0.16]",
          )}
        />
      ) : null}

      {badge ? (
        <span className="t-overline absolute top-3.5 left-3.5 z-10 rounded-full bg-latte px-2.5 py-1.5 text-[10px] tracking-[0.1em] text-espresso">
          {badge}
        </span>
      ) : null}

      {children ? <div className="relative z-10">{children}</div> : null}

      {kicker || caption ? (
        <div
          className={cn(
            "relative z-10 px-6 py-5",
            onDark && "bg-[linear-gradient(to_top,rgba(20,14,13,0.85),transparent)]",
          )}
        >
          {kicker ? (
            <div className={cn("t-overline", onDark ? "text-latte" : "text-mocha")}>{kicker}</div>
          ) : null}
          {caption ? (
            <p
              className={cn(
                "mt-2 font-serif text-[19px] leading-tight tracking-[-0.01em]",
                onDark ? "text-cream" : "text-espresso",
              )}
            >
              {caption}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Product-bag stand-in. Uses the packaging silhouette from the brand guide's
 * "Brand applications" panel: a kraft or espresso bag with the wordmark.
 */
export function BagPlate({
  tone = "espresso",
  label,
  sublabel,
  className,
}: {
  tone?: PlateTone;
  label: string;
  sublabel?: string;
  className?: string;
}) {
  const { surface, wash, onDark } = tones[tone];

  return (
    <div
      className={cn(
        "relative isolate grid place-items-center overflow-hidden border border-line",
        "rounded-lg",
        surface,
        className,
      )}
    >
      <div aria-hidden="true" className={cn("absolute inset-0 mix-blend-overlay opacity-45", wash)} />
      <div
        aria-hidden="true"
        className="pat-Mark-repeat absolute inset-0 opacity-[0.07] mix-blend-soft-light"
      />
      {/* The bag itself: a flat-bottom silhouette with a folded top seam. */}
      <div
        className={cn(
          "relative z-10 flex w-[46%] min-w-28 flex-col items-center gap-3 rounded-[4px_4px_10px_10px] px-4 pt-7 pb-8 shadow-lg",
          onDark ? "bg-cream/94" : "bg-espresso",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-3 top-2 h-[3px] rounded-full",
            onDark ? "bg-espresso/20" : "bg-cream/20",
          )}
        />
        <Mark
          onDark={!onDark}
          className={cn("w-6", onDark ? "" : "")}
        />
        <span
          className={cn(
            "font-serif text-[13px] leading-tight tracking-[-0.01em]",
            onDark ? "text-espresso" : "text-cream",
          )}
        >
          flowers
        </span>
        <span
          className={cn(
            "t-overline text-center text-[8px] leading-relaxed",
            onDark ? "text-mocha" : "text-latte",
          )}
        >
          {label}
        </span>
        {sublabel ? (
          <span
            className={cn(
              "font-mono text-[8px] tracking-[0.12em] uppercase",
              onDark ? "text-muted" : "text-cream/55",
            )}
          >
            {sublabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
