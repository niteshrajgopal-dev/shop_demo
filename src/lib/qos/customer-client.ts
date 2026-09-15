import { qosFetchJson } from "@/lib/qos/api-client";
import type { CustomerMeResponse } from "@/lib/qos/types";

export async function fetchCurrentCustomer() {
  return qosFetchJson<CustomerMeResponse>("/api/customers/me");
}
