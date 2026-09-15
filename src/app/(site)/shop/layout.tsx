import { requireHospitalityReferenceRoute } from "@/lib/storefront/require-hospitality-reference";

export default async function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireHospitalityReferenceRoute();
  return children;
}
