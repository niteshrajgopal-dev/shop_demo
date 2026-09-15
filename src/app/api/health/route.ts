export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    status: "healthy",
    service: "qos-storefront",
  });
}
