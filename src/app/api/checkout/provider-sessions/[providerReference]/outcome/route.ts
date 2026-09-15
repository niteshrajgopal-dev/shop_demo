import { proxyWithStorefrontContext } from "@/lib/storefront/proxy-route.server";
import { storefrontApiErrorResponse } from "@/lib/storefront/api-response.server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ providerReference: string }> },
) {
  try {
    const { providerReference } = await context.params;
    return proxyWithStorefrontContext(
      request,
      `/api/public/checkout/provider-sessions/${encodeURIComponent(providerReference)}/outcome`,
      { forwardSearchParams: true, includeStorefrontContext: true },
    );
  } catch (error) {
    return storefrontApiErrorResponse(error, "QOS checkout integration failed.");
  }
}
