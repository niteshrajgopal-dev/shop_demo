type ClassValue = string | number | false | null | undefined;

/** Minimal class joiner — the design system needs no runtime class merging. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
