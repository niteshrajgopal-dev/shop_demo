import { NextResponse } from "next/server";

import { StorefrontResolutionError } from "@/lib/storefront/errors";

export function storefrontApiErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof StorefrontResolutionError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode },
    );
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return NextResponse.json({ error: message }, { status: 500 });
}
