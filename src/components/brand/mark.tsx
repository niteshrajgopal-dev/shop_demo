const MARK_VIEWBOX = "0 0 64 64";

type MarkProps = {
  className?: string;
  onDark?: boolean;
  title?: string;
};

function FlowerPaths({ onDark = false }: { onDark?: boolean }) {
  const stem = onDark ? "#bbf7d0" : "#14532d";
  const petals = onDark
    ? ["#f472b6", "#ec4899", "#86efac", "#bbf7d0"]
    : ["#ec4899", "#f472b6", "#86efac", "#bbf7d0"];

  return (
    <>
      <circle cx="32" cy="32" r="10" fill={stem} />
      <circle cx="44" cy="22" r="8" fill={petals[0]} />
      <circle cx="44" cy="42" r="8" fill={petals[1]} />
      <circle cx="20" cy="22" r="7" fill={petals[2]} />
      <circle cx="20" cy="42" r="7" fill={petals[3]} />
    </>
  );
}

export function MarkSprite() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <symbol id="flower-mark" viewBox={MARK_VIEWBOX}>
        <FlowerPaths />
      </symbol>
    </svg>
  );
}

export function Mark({ className = "", onDark = false, title }: MarkProps) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={`h-[1.375em] w-[1.375em] shrink-0 ${className}`}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <FlowerPaths onDark={onDark} />
    </svg>
  );
}

export function MarkSpinner({ className = "" }: { className?: string }) {
  return (
    <span role="status" aria-label="Loading" className="inline-flex">
      <Mark className={`animate-mark-spin ${className}`} />
    </span>
  );
}

export function MarkDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`divider-mark ${className}`} aria-hidden="true">
      <Mark className="w-4" />
    </div>
  );
}
