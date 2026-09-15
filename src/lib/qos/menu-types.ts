export type PublicMenuLocale = "en" | "ar";

export type PublicMenuProduct = {
  productPublicId: string;
  sortOrder: number;
  displayName: string;
  description: string | null;
  price: {
    amountMinor: number;
    currency: string;
    inheritanceMode: "inherited" | "override";
  };
  mediaAssetId: string | null;
  eligibility: {
    available: boolean;
  };
};

export type PublicMenuSection = {
  publicId: string;
  sortOrder: number;
  displayName: string;
  description: string | null;
  products: PublicMenuProduct[];
};

export type PublicMenuResponse = {
  contractVersion: 1;
  publicKey: string;
  tenantPublicId: string;
  menuPublicId: string;
  locationPublicId: string;
  releaseVersion: number;
  locale: PublicMenuLocale;
  currency: string;
  displayName: string;
  description: string | null;
  sections: PublicMenuSection[];
};

export type PublicMenuApiResponse = {
  menu: PublicMenuResponse;
};

export type {
  StorefrontManifestApiResponse,
  StorefrontManifestLocation,
  StorefrontManifestPublishedCollection,
  StorefrontManifestResponse,
} from "@/lib/storefront/manifest-types";

export type MenuLoadSuccess = {
  status: "ok";
  menu: PublicMenuResponse;
  branchName: string;
  branchPublicId: string;
};

export type MenuLoadError = {
  status: "error";
  error: string;
  field?: string;
};

export type MenuLoadResult = MenuLoadSuccess | MenuLoadError;
