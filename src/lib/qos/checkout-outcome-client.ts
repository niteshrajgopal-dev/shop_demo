import type {
  CheckoutOutcomeApiError,
  CheckoutOutcomeApiResponse,
} from "@/lib/qos/types";

export class CheckoutOutcomeRequestError extends Error {
  readonly statusCode: number;
  readonly field?: string;

  constructor(message: string, statusCode: number, field?: string) {
    super(message);
    this.name = "CheckoutOutcomeRequestError";
    this.statusCode = statusCode;
    this.field = field;
  }
}

export async function fetchCheckoutOutcomeByProviderSession(
  providerReference: string,
): Promise<CheckoutOutcomeApiResponse> {
  const encodedReference = encodeURIComponent(providerReference.trim());
  const response = await fetch(
    `/api/checkout/provider-sessions/${encodedReference}/outcome`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    },
  );

  const payload = (await response.json()) as
    | CheckoutOutcomeApiResponse
    | CheckoutOutcomeApiError;

  if (!response.ok) {
    const errorPayload = payload as CheckoutOutcomeApiError;
    throw new CheckoutOutcomeRequestError(
      errorPayload.error || "Unable to load checkout outcome.",
      response.status,
      errorPayload.field,
    );
  }

  return payload as CheckoutOutcomeApiResponse;
}
