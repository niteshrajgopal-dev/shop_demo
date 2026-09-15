export const STOREFRONT_MANIFEST_CONTRACT_VERSION = 1;

export type StorefrontManifestNavigationItem = {
  id: string;
  labelKey: string;
  href: string;
};

export type StorefrontManifestContentBlock = {
  id: string;
  type: string;
  schemaVersion?: number;
  visible?: boolean;
  props: Record<string, unknown>;
};

export type StorefrontManifestLocation = {
  locationPublicId: string;
  slug: string;
  name: string;
};

export type StorefrontManifestPublishedCollection = {
  locationPublicId: string;
  menuPublicId: string;
  publicMenuKey: string | null;
};

export type StorefrontManifestFeatures = {
  localeSelector: boolean;
};

export type StorefrontManifestResponse = {
  contractVersion: typeof STOREFRONT_MANIFEST_CONTRACT_VERSION;
  storefrontPublicId: string;
  releasePublicId: string;
  releaseVersion: number;
  tenantPublicId: string;
  brand: {
    publicId: string;
    name: string;
  };
  primaryHostname: string;
  defaultLocale: string;
  supportedLocales: string[];
  theme: Record<string, unknown>;
  navigation: StorefrontManifestNavigationItem[];
  contentBlocks: StorefrontManifestContentBlock[];
  locations: StorefrontManifestLocation[];
  publishedCollections: StorefrontManifestPublishedCollection[];
  features: StorefrontManifestFeatures;
};

export type StorefrontManifestApiResponse = {
  manifest: StorefrontManifestResponse;
};

export type StorefrontHostContextResponse = {
  contractVersion: 1;
  hostname: string;
  tenantPublicId: string;
  storefrontPublicId: string;
  brandPublicId: string;
  brandName: string;
  releasePublicId: string | null;
  releaseVersion: number | null;
  domainType: "platform_subdomain" | "custom_domain";
  domainLifecycleStatus: "provisioning" | "active" | "inactive";
  domainVerificationStatus: "pending" | "verified" | "failed";
};

export type StorefrontHostApiResponse = {
  host: StorefrontHostContextResponse;
};
