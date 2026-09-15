import { resolveStorefrontContextFromHeaders } from "@/lib/storefront/context.server";
import { readQosApiBaseUrl } from "@/lib/qos/config.server";
import type {
  MenuLoadResult,
  PublicMenuApiResponse,
  PublicMenuLocale,
} from "@/lib/qos/menu-types";

async function fetchQosJson<T>(path: string): Promise<T> {
  const apiBaseUrl = readQosApiBaseUrl();
  const response = await fetch(new URL(path, `${apiBaseUrl}/`), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const payload = (await response.json()) as T & { error?: string; field?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? `QOS request failed (${response.status}).`);
  }

  return payload;
}

export async function loadPublishedMenu(
  locale: PublicMenuLocale = "en",
): Promise<MenuLoadResult> {
  try {
    const context = await resolveStorefrontContextFromHeaders();
    const branch = context.manifest.locations.find(
      (location) => location.locationPublicId === context.locationPublicId,
    );

    const collection = context.manifest.publishedCollections.find(
      (entry) => entry.locationPublicId === context.locationPublicId,
    );

    const publicMenuKey = collection?.publicMenuKey?.trim();
    if (!publicMenuKey) {
      return {
        status: "error",
        error: "No published menu is configured for this branch.",
        field: "publicMenuKey",
      };
    }

    const menuPayload = await fetchQosJson<PublicMenuApiResponse>(
      `/api/public/menus/${encodeURIComponent(publicMenuKey)}?locale=${encodeURIComponent(locale)}`,
    );

    return {
      status: "ok",
      menu: menuPayload.menu,
      branchName: branch?.name ?? context.locationPublicId,
      branchPublicId: context.locationPublicId,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unable to load published menu.",
    };
  }
}
