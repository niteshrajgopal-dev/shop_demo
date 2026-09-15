import { proxyQosRequest } from "@/lib/qos/proxy.server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ all: string[] }>;
};

async function handleAuth(request: Request, context: RouteContext) {
  const { all } = await context.params;
  const suffix = all.join("/");

  return proxyQosRequest({
    upstreamPath: `/api/auth/${suffix}`,
    request,
    forwardSearchParams: true,
  });
}

export async function GET(request: Request, context: RouteContext) {
  return handleAuth(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handleAuth(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleAuth(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return handleAuth(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleAuth(request, context);
}
