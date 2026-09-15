import { resolveStorefrontContextFromRequest } from "@/lib/storefront/context.server";
import { storefrontApiErrorResponse } from "@/lib/storefront/api-response.server";
import { proxyQosRequest } from "@/lib/qos/proxy.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const context = await resolveStorefrontContextFromRequest(request);
    const body = (await request.json().catch(() => ({}))) as { locale?: string };
    const upstreamBody = JSON.stringify({
      storefrontPublicId: context.storefrontPublicId,
      locationPublicId: context.locationPublicId,
      locale: body.locale ?? context.manifest.defaultLocale ?? "en",
    });

    const upstreamRequest = new Request(new URL("/api/baskets?contractVersion=1", request.url), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      body: upstreamBody,
    });

    return proxyQosRequest({
      upstreamPath: "/api/public/baskets",
      request: upstreamRequest,
      forwardSearchParams: true,
      storefrontContext: context,
    });
  } catch (error) {
    return storefrontApiErrorResponse(error, "QOS basket integration failed.");
  }
}
