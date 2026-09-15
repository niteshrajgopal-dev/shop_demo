export type QosDevStorefrontFallback = {
  storefrontPublicId: string;
  locationPublicId: string;
  testProductPublicId?: string;
};

/** @deprecated Use resolveStorefrontContextFromRequest instead. */
export type QosServerConfig = {
  apiBaseUrl: string;
  storefrontPublicId: string;
  locationPublicId: string;
  testProductPublicId?: string;
};

function requireEnv(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`${name} is required for QOS integration.`);
  }

  return trimmed;
}

export function readQosApiBaseUrl(): string {
  return requireEnv("QOS_API_BASE_URL", process.env.QOS_API_BASE_URL).replace(/\/+$/, "");
}

export function readDevStorefrontFallback(): QosDevStorefrontFallback | null {
  const storefrontPublicId = process.env.QOS_STOREFRONT_PUBLIC_ID?.trim();
  const locationPublicId = process.env.QOS_LOCATION_PUBLIC_ID?.trim();

  if (!storefrontPublicId || !locationPublicId) {
    return null;
  }

  return {
    storefrontPublicId,
    locationPublicId,
    testProductPublicId: process.env.QOS_TEST_PRODUCT_PUBLIC_ID?.trim() || undefined,
  };
}

/** Local-dev escape hatch only. Runtime tenant resolution uses host + manifest. */
export function readQosServerConfig(): QosServerConfig {
  const fallback = readDevStorefrontFallback();
  if (!fallback) {
    throw new Error(
      "QOS_STOREFRONT_PUBLIC_ID and QOS_LOCATION_PUBLIC_ID are required for legacy config reads.",
    );
  }

  return {
    apiBaseUrl: readQosApiBaseUrl(),
    storefrontPublicId: fallback.storefrontPublicId,
    locationPublicId: fallback.locationPublicId,
    testProductPublicId: fallback.testProductPublicId,
  };
}

export function tryReadQosServerConfig(): QosServerConfig | null {
  try {
    return readQosServerConfig();
  } catch {
    return null;
  }
}
