import { NextResponse } from "next/server";

import { resolveStorefrontContextFromRequest } from "@/lib/storefront/context.server";
import { storefrontApiErrorResponse } from "@/lib/storefront/api-response.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const context = await resolveStorefrontContextFromRequest(request);
    if (!context.testProductPublicId) {
      return NextResponse.json(
        {
          error:
            "QOS_TEST_PRODUCT_PUBLIC_ID is not configured for sandbox checkout.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      productPublicId: context.testProductPublicId,
    });
  } catch (error) {
    return storefrontApiErrorResponse(error, "QOS checkout integration failed.");
  }
}
