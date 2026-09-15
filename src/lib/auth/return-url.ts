const DEFAULT_RETURN_PATH = "/checkout";

const ALLOWED_RETURN_PREFIXES = [
  "/checkout",
  "/menu",
  "/order",
  "/sign-in",
  "/",
] as const;

export function resolveSafeReturnPath(raw: string | null | undefined) {
  const value = raw?.trim();
  if (!value) {
    return DEFAULT_RETURN_PATH;
  }

  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return DEFAULT_RETURN_PATH;
  }

  if (value.includes("\\") || value.includes("\0")) {
    return DEFAULT_RETURN_PATH;
  }

  const normalized = value.split("?")[0]?.split("#")[0] ?? value;
  if (normalized.includes("..")) {
    return DEFAULT_RETURN_PATH;
  }

  const allowed = ALLOWED_RETURN_PREFIXES.some((prefix) => {
    if (prefix === "/") {
      return normalized === "/";
    }

    return normalized === prefix || normalized.startsWith(`${prefix}/`);
  });

  return allowed ? value : DEFAULT_RETURN_PATH;
}

export function buildAuthCallbackUrl(returnPath: string) {
  if (typeof window === "undefined") {
    return resolveSafeReturnPath(returnPath);
  }

  return `${window.location.origin}${resolveSafeReturnPath(returnPath)}`;
}
