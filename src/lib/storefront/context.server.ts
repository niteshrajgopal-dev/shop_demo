import { cookies, headers } from "next/headers";

import { readQosApiBaseUrl, readDevStorefrontFallback } from "@/lib/qos/config.server";
import { StorefrontResolutionError } from "@/lib/storefront/errors";
import type {
  StorefrontManifestApiResponse,
  StorefrontManifestResponse,
} from "@/lib/storefront/manifest-types";
import {
  resolveStorefrontPrimaryNav,
  resolveStorefrontThemePreset,
  type StorefrontShellNavItem,
  type StorefrontThemePreset,
} from "@/lib/storefront/theme-presets";
import { readRequestHost } from "@/lib/qos/proxy.server";

export const LOCATION_COOKIE_NAME = "qos.location";

export type StorefrontContext = {
  apiBaseUrl: string;
  hostname: string;
  storefrontPublicId: string;
  locationPublicId: string;
  tenantPublicId: string;
  brandName: string;
  manifest: StorefrontManifestResponse;
  themePreset: StorefrontThemePreset;
  primaryNav: StorefrontShellNavItem[];
  tabNav: StorefrontShellNavItem[];
  testProductPublicId?: string;
};

type ManifestCacheEntry = {
  manifest: StorefrontManifestResponse;
  expiresAt: number;
};

const MANIFEST_CACHE_TTL_MS = 60_000;
const manifestCache = new Map<string, ManifestCacheEntry>();

function isLocalDevHost(hostname: string) {
  const host = hostname.split(":")[0]?.toLowerCase() ?? "";
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost");
}

async function fetchManifestByHostname(apiBaseUrl: string, hostname: string) {
  const cacheKey = hostname.toLowerCase();
  const cached = manifestCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.manifest;
  }

  const response = await fetch(
    new URL(
      `/api/public/storefronts/manifest?host=${encodeURIComponent(hostname)}&contractVersion=1`,
      `${apiBaseUrl}/`,
    ),
    {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    },
  );

  const payload = (await response.json()) as StorefrontManifestApiResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new StorefrontResolutionError(
      payload.error ?? "This storefront hostname is not configured.",
      response.status,
      response.status === 404 ? "host_not_configured" : "manifest_unavailable",
    );
  }

  manifestCache.set(cacheKey, {
    manifest: payload.manifest,
    expiresAt: Date.now() + MANIFEST_CACHE_TTL_MS,
  });

  return payload.manifest;
}

async function fetchManifestByStorefrontPublicId(
  apiBaseUrl: string,
  storefrontPublicId: string,
) {
  const response = await fetch(
    new URL(
      `/api/public/storefronts/${encodeURIComponent(storefrontPublicId)}/manifest?contractVersion=1`,
      `${apiBaseUrl}/`,
    ),
    {
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );

  const payload = (await response.json()) as StorefrontManifestApiResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new StorefrontResolutionError(
      payload.error ?? "Unable to load storefront manifest.",
      response.status,
      "manifest_unavailable",
    );
  }

  return payload.manifest;
}

async function readSelectedLocationPublicId(
  manifest: StorefrontManifestResponse,
  devFallbackLocationPublicId?: string,
) {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCATION_COOKIE_NAME)?.value?.trim();

  if (cookieValue) {
    const matched = manifest.locations.some(
      (location) => location.locationPublicId === cookieValue,
    );
    if (matched) {
      return cookieValue;
    }
  }

  if (devFallbackLocationPublicId) {
    const matched = manifest.locations.some(
      (location) => location.locationPublicId === devFallbackLocationPublicId,
    );
    if (matched) {
      return devFallbackLocationPublicId;
    }
  }

  const first = manifest.locations[0]?.locationPublicId?.trim();
  if (!first) {
    throw new StorefrontResolutionError(
      "No branch is configured for this storefront.",
      500,
      "misconfigured",
    );
  }

  return first;
}

async function resolveManifest(apiBaseUrl: string, hostname: string) {
  try {
    return await fetchManifestByHostname(apiBaseUrl, hostname);
  } catch (error) {
    const devFallback = readDevStorefrontFallback();
    if (
      devFallback &&
      isLocalDevHost(hostname) &&
      error instanceof StorefrontResolutionError
    ) {
      return fetchManifestByStorefrontPublicId(apiBaseUrl, devFallback.storefrontPublicId);
    }

    throw error;
  }
}

export async function resolveStorefrontContextFromHeaders(): Promise<StorefrontContext> {
  const headerStore = await headers();
  const hostname =
    headerStore.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headerStore.get("host")?.trim() ||
    "";

  if (!hostname) {
    throw new StorefrontResolutionError(
      "Missing host header for storefront resolution.",
      400,
      "misconfigured",
    );
  }

  return resolveStorefrontContext(hostname);
}

export async function resolveStorefrontContext(hostname: string): Promise<StorefrontContext> {
  const apiBaseUrl = readQosApiBaseUrl();
  const devFallback = readDevStorefrontFallback();
  const manifest = await resolveManifest(apiBaseUrl, hostname);
  const locationPublicId = await readSelectedLocationPublicId(
    manifest,
    devFallback?.locationPublicId,
  );

  const themePreset = resolveStorefrontThemePreset(manifest);
  const primaryNav = resolveStorefrontPrimaryNav(manifest, themePreset);

  const testProductPublicId =
    process.env.QOS_TEST_PRODUCT_PUBLIC_ID?.trim() || devFallback?.testProductPublicId;

  return {
    apiBaseUrl,
    hostname,
    storefrontPublicId: manifest.storefrontPublicId,
    locationPublicId,
    tenantPublicId: manifest.tenantPublicId,
    brandName: manifest.brand.name,
    manifest,
    themePreset,
    primaryNav,
    tabNav: themePreset.tabNav,
    testProductPublicId,
  };
}

export async function resolveStorefrontContextFromRequest(
  request: Request,
): Promise<StorefrontContext> {
  const hostname = readRequestHost(request);
  if (!hostname) {
    throw new StorefrontResolutionError(
      "Missing host header for storefront resolution.",
      400,
      "misconfigured",
    );
  }

  return resolveStorefrontContext(hostname);
}

export async function tryResolveStorefrontContextFromRequest(
  request: Request,
): Promise<StorefrontContext | null> {
  try {
    return await resolveStorefrontContextFromRequest(request);
  } catch {
    return null;
  }
}
