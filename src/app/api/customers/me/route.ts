import { NextResponse } from "next/server";

import { proxyWithStorefrontContext } from "@/lib/storefront/proxy-route.server";
import { storefrontApiErrorResponse } from "@/lib/storefront/api-response.server";
import { readRequestHost } from "@/lib/qos/proxy.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const host = readRequestHost(request);
    if (!host) {
      return NextResponse.json(
        { error: "Host header is required.", field: "host" },
        { status: 400 },
      );
    }

    const upstreamRequest = new Request(
      new URL(`/api/customers/me?host=${encodeURIComponent(host)}`, request.url),
      request,
    );

    return proxyWithStorefrontContext(upstreamRequest, "/api/public/customers/me", {
      includeStorefrontContext: true,
      forwardSearchParams: true,
    });
  } catch (error) {
    return storefrontApiErrorResponse(error, "QOS customer session failed.");
  }
}
