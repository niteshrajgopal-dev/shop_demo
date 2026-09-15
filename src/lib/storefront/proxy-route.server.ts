import { resolveStorefrontContextFromRequest } from "@/lib/storefront/context.server";
import { proxyQosRequest } from "@/lib/qos/proxy.server";

type ProxyWithStorefrontOptions = {
  forwardSearchParams?: boolean;
  includeStorefrontContext?: boolean;
};

export async function proxyWithStorefrontContext(
  request: Request,
  upstreamPath: string,
  options: ProxyWithStorefrontOptions = {},
) {
  const context = await resolveStorefrontContextFromRequest(request);

  return proxyQosRequest({
    upstreamPath,
    request,
    forwardSearchParams: options.forwardSearchParams ?? false,
    includeStorefrontContext: options.includeStorefrontContext ?? false,
    storefrontContext: context,
  });
}
