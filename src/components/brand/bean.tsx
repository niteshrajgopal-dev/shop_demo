/**
 * The bean mark. Path data is copied verbatim from the design export
 * (design/extracted/foundations.html `#bean` symbol) and must not be redrawn.
 */

const BEAN_VIEWBOX = "0 0 64 88";
const BEAN_BODY =
  "M32 3c15 0 26 17 26 41S47 85 32 85 6 68 6 44 17 3 32 3Z";
const BEAN_CREASE = "M32 9c-10 9 8 21-1 35-9 14 9 22 1 31";

/** Renders the reusable `<symbol>` once per document. */
export function BeanSprite() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <symbol id="bean" viewBox={BEAN_VIEWBOX}>
        <path className="bean-body" d={BEAN_BODY} />
        <path className="bean-crease" d={BEAN_CREASE} />
      </symbol>
    </svg>
  );
}

type BeanProps = {
  className?: string;
  /** Flips the crease to espresso so the mark reads on dark surfaces. */
  onDark?: boolean;
  title?: string;
};

export function Bean({ className = "", onDark = false, title }: BeanProps) {
  return (
    <svg
      viewBox={BEAN_VIEWBOX}
      className={`h-[1.375em] w-[1em] shrink-0 ${onDark ? "bean-on-dark" : ""} ${className}`}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path className="bean-body" d={BEAN_BODY} />
      <path className="bean-crease" d={BEAN_CREASE} />
    </svg>
  );
}

/** The circular badge lockup: bean centred in an espresso disc. */
export function BeanBadge({
  size = 104,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-espresso ${className}`}
      style={{ width: size, height: size }}
    >
      <Bean onDark className="w-[44%]" />
    </span>
  );
}

/** Bean loader — 1.6s linear spin, per the bean language foundation. */
export function BeanSpinner({ className = "" }: { className?: string }) {
  return (
    <span role="status" aria-label="Loading" className="inline-flex">
      <Bean className={`animate-bean-spin ${className}`} />
    </span>
  );
}

/** Hairline rule with the bean at its centre. */
export function BeanDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`divider-bean ${className}`} aria-hidden="true">
      <Bean className="w-4" />
    </div>
  );
}
