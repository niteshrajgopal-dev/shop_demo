import { cn } from "@/lib/cn";

/**
 * The iconography foundation: thin-to-medium monoline, subtly rounded, warm.
 * Path data is copied verbatim from design/extracted/foundations.html.
 */

export const ICON_PATHS = {
  coffee: (
    <>
      <path d="M5 8h11v4a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8Z" />
      <path d="M16 9h2.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 3.5c-.6.8-.6 1.7 0 2.5M12 3.5c-.6.8-.6 1.7 0 2.5" />
    </>
  ),
  bean: (
    <>
      <ellipse cx="12" cy="12" rx="6" ry="8.5" />
      <path d="M12 4c-3 3 2.6 6-.3 10.5C9 18 13.5 20 12 20" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="5.5" r="2.2" />
      <circle cx="12" cy="18.5" r="2.2" />
      <circle cx="5.5" cy="12" r="2.2" />
      <circle cx="18.5" cy="12" r="2.2" />
    </>
  ),
  cup: (
    <>
      <path d="M6 8h10v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V8Z" />
      <path d="M16 9h1.6a2 2 0 0 1 0 4H16" />
      <path d="M4 21h14" />
    </>
  ),
  location: (
    <>
      <path d="M12 21s6.5-5.5 6.5-10a6.5 6.5 0 0 0-13 0C5.5 15.5 12 21 12 21Z" />
      <circle cx="12" cy="11" r="2.4" />
    </>
  ),
  bag: (
    <>
      <path d="M6 8h12l-1 11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  account: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  loyalty: <path d="M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.2l5.4-.8L12 3.5Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  delivery: (
    <>
      <path d="M3 13h11V7H3v6Z" />
      <path d="M14 10h3.5L20 13v3h-6" />
      <circle cx="7" cy="17" r="1.8" />
      <circle cx="16.5" cy="17" r="1.8" />
    </>
  ),
  pickup: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20V9l5-4 5 4v11" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10h16M8 4v4M16 4v4" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  heart: <path d="M12 20s-7-4.4-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.6 12 20 12 20Z" />,
  bookmark: <path d="M7 4h10v16l-5-3.5L7 20V4Z" />,
} as const;

export type IconName = keyof typeof ICON_PATHS;

export const ICON_NAMES = Object.keys(ICON_PATHS) as IconName[];

export function Icon({
  name,
  className,
  title,
  strokeWidth = 1.6,
}: {
  name: IconName;
  className?: string;
  title?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("h-6 w-6", className)}
    >
      {title ? <title>{title}</title> : null}
      {ICON_PATHS[name]}
    </svg>
  );
}
