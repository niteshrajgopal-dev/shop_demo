import { proxyWithStorefrontContext } from "@/lib/storefront/proxy-route.server";
import { storefrontApiErrorResponse } from "@/lib/storefront/api-response.server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ publicKey: string }> },
) {
  try {
    const { publicKey } = await context.params;
    const locale = new URL(request.url).searchParams.get("locale") ?? "en";

    const upstreamRequest = new Request(
      new URL(
        `/api/menus/${encodeURIComponent(publicKey)}?locale=${encodeURIComponent(locale)}`,
        request.url,
      ),
      request,
    );

    return proxyWithStorefrontContext(
      upstreamRequest,
      `/api/public/menus/${encodeURIComponent(publicKey)}`,
      { forwardSearchParams: true },
    );
  } catch (error) {
    return storefrontApiErrorResponse(error, "QOS menu integration failed.");
  }
}
