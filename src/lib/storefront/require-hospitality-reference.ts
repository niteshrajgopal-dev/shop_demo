import { redirect } from "next/navigation";

import { resolveStorefrontContextFromHeaders } from "@/lib/storefront/context.server";
import { isHospitalityTheme } from "@/lib/storefront/hospitality-home-copy";

export async function requireHospitalityReferenceRoute() {
  const context = await resolveStorefrontContextFromHeaders();

  if (!isHospitalityTheme(context.themePreset.id)) {
    redirect("/menu");
  }

  return context;
}
