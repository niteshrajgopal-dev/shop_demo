import { proxyWithStorefrontContext } from "@/lib/storefront/proxy-route.server";
import { storefrontApiErrorResponse } from "@/lib/storefront/api-response.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    return proxyWithStorefrontContext(request, "/api/public/baskets/account/current", {
      forwardSearchParams: true,
      includeStorefrontContext: true,
    });
  } catch (error) {
    return storefrontApiErrorResponse(error, "QOS basket integration failed.");
  }
}
