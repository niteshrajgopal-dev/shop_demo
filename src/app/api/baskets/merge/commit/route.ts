import { proxyWithStorefrontContext } from "@/lib/storefront/proxy-route.server";
import { storefrontApiErrorResponse } from "@/lib/storefront/api-response.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    return proxyWithStorefrontContext(request, "/api/public/baskets/merge/commit", {
      forwardSearchParams: true,
      includeStorefrontContext: true,
    });
  } catch (error) {
    return storefrontApiErrorResponse(error, "QOS basket merge failed.");
  }
}
