import { NextResponse } from "next/server";

import { readQosApiBaseUrl } from "@/lib/qos/config.server";
import { resolveStorefrontContextFromRequest } from "@/lib/storefront/context.server";
import type { StorefrontContext } from "@/lib/storefront/context.server";

type ProxyQosRequestOptions = {
  upstreamPath: string;
  request: Request;
  includeStorefrontContext?: boolean;
  forwardSearchParams?: boolean;
  storefrontContext?: StorefrontContext;
};

function rewriteSetCookieHeader(cookie: string) {
  return cookie
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part && !part.toLowerCase().startsWith("domain="))
    .join("; ");
}

async function buildUpstreamUrl(
  upstreamPath: string,
  request: Request,
  includeStorefrontContext: boolean,
  forwardSearchParams: boolean,
  storefrontContext?: StorefrontContext,
) {
  const context =
    storefrontContext ??
    (includeStorefrontContext
      ? await resolveStorefrontContextFromRequest(request)
      : null);

  const apiBaseUrl = context?.apiBaseUrl ?? readQosApiBaseUrl();

  const upstreamUrl = new URL(upstreamPath, `${apiBaseUrl}/`);

  if (includeStorefrontContext && context) {
    upstreamUrl.searchParams.set("contractVersion", "1");
    upstreamUrl.searchParams.set("storefrontPublicId", context.storefrontPublicId);
    upstreamUrl.searchParams.set("locationPublicId", context.locationPublicId);
  }

  if (forwardSearchParams) {
    const incomingUrl = new URL(request.url);
    incomingUrl.searchParams.forEach((value, key) => {
      if (includeStorefrontContext && upstreamUrl.searchParams.has(key)) {
        return;
      }
      upstreamUrl.searchParams.set(key, value);
    });
  }

  return upstreamUrl;
}

function readStorefrontOrigin(request: Request) {
  const origin = request.headers.get("origin")?.trim();
  if (origin) {
    return origin;
  }

  const host = readRequestHost(request);
  if (!host) {
    return null;
  }

  const forwardedProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";

  return `${forwardedProto}://${host}`;
}

function readAnonCsrfToken(request: Request) {
  const cookie = request.headers.get("cookie");
  if (!cookie) {
    return null;
  }

  const match = cookie.match(/(?:^|;\s*)qos_anon_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function buildForwardHeaders(request: Request) {
  const headers = new Headers();
  headers.set("Accept", request.headers.get("accept") ?? "application/json");

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const cookie = request.headers.get("cookie");
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  const csrfToken = readAnonCsrfToken(request);
  if (csrfToken) {
    headers.set("X-QOS-CSRF-Token", csrfToken);
  }

  const origin = readStorefrontOrigin(request);
  if (origin) {
    headers.set("Origin", origin);
    if (!request.headers.get("referer")) {
      headers.set("Referer", `${origin}/`);
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    headers.set("Referer", referer);
  }

  return headers;
}

export async function proxyQosRequest({
  upstreamPath,
  request,
  includeStorefrontContext = false,
  forwardSearchParams = false,
  storefrontContext,
}: ProxyQosRequestOptions) {
  const upstreamUrl = await buildUpstreamUrl(
    upstreamPath,
    request,
    includeStorefrontContext,
    forwardSearchParams,
    storefrontContext,
  );

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers: buildForwardHeaders(request),
    body,
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  responseHeaders.set("Cache-Control", "private, no-store");

  const upstreamContentType = upstreamResponse.headers.get("content-type");
  if (upstreamContentType) {
    responseHeaders.set("Content-Type", upstreamContentType);
  }

  for (const cookie of upstreamResponse.headers.getSetCookie()) {
    responseHeaders.append("Set-Cookie", rewriteSetCookieHeader(cookie));
  }

  const responseBody = await upstreamResponse.text();

  return new NextResponse(responseBody, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export function readRequestHost(request: Request) {
  return (
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host")?.trim() ||
    ""
  );
}
