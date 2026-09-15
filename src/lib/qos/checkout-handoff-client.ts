import { qosFetchJson } from "@/lib/qos/api-client";
import type {
  AccountBasketResponse,
  CheckoutPaymentAttemptResponse,
  CheckoutQuoteResponse,
} from "@/lib/qos/types";

export async function fetchAccountBasket() {
  return qosFetchJson<AccountBasketResponse>("/api/baskets/account/current");
}

export async function upsertAccountBasketLine(input: {
  productPublicId: string;
  quantity: number;
  expectedVersion: number;
  mutationId?: string;
}) {
  return qosFetchJson<AccountBasketResponse>("/api/baskets/account/current/lines", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function issueCheckoutQuote(input: {
  expectedBasketVersion: number;
  operationId: string;
}) {
  return qosFetchJson<CheckoutQuoteResponse>(
    "/api/baskets/account/current/checkout-quote",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
}

export async function createPaymentAttempt(input: {
  operationId: string;
  quotePublicId: string;
  expectedQuoteVersion: number;
  returnPath: string;
  cancelPath: string;
}) {
  return qosFetchJson<CheckoutPaymentAttemptResponse>("/api/checkout/payment-attempts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function startCheckoutFromBasket(basketVersion: number) {
  const quote = await issueCheckoutQuote({
    expectedBasketVersion: basketVersion,
    operationId: crypto.randomUUID(),
  });

  const paymentAttempt = await createPaymentAttempt({
    operationId: crypto.randomUUID(),
    quotePublicId: quote.quote.quotePublicId,
    expectedQuoteVersion: quote.quote.version,
    returnPath: "/checkout/success",
    cancelPath: "/checkout/cancelled",
  });

  return paymentAttempt.paymentAttempt;
}
