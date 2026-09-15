import { proxyWithStorefrontContext } from "@/lib/storefront/proxy-route.server";
import { storefrontApiErrorResponse } from "@/lib/storefront/api-response.server";

export const dynamic = "force-dynamic";

async function proxyAccountLineRoute(
  request: Request,
  context: { params: Promise<{ linePublicId: string }> },
) {
  const { linePublicId } = await context.params;
  return proxyWithStorefrontContext(
    request,
    `/api/public/baskets/account/current/lines/${encodeURIComponent(linePublicId)}`,
    { forwardSearchParams: true, includeStorefrontContext: true },
  );
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ linePublicId: string }> },
) {
  try {
    return await proxyAccountLineRoute(request, context);
  } catch (error) {
    return storefrontApiErrorResponse(error, "QOS basket integration failed.");
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ linePublicId: string }> },
) {
  try {
    return await proxyAccountLineRoute(request, context);
  } catch (error) {
    return storefrontApiErrorResponse(error, "QOS basket integration failed.");
  }
}
