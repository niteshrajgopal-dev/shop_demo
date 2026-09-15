import { qosFetchJson, QosRequestError } from "@/lib/qos/api-client";
import type {
  AccountBasketResponse,
  AnonymousBasketResponse,
} from "@/lib/qos/types";

const BASKET_QUERY = "?contractVersion=1";

export async function fetchCurrentCustomerSignedIn() {
  try {
    await qosFetchJson("/api/customers/me");
    return true;
  } catch {
    return false;
  }
}

export async function fetchAnonymousBasket() {
  return qosFetchJson<AnonymousBasketResponse>(`/api/baskets/current${BASKET_QUERY}`);
}

export async function createAnonymousBasket(locale: "en" | "ar" = "en") {
  return qosFetchJson<AnonymousBasketResponse>(`/api/baskets${BASKET_QUERY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ locale }),
  });
}

export async function fetchAccountBasket() {
  return qosFetchJson<AccountBasketResponse>(`/api/baskets/account/current${BASKET_QUERY}`);
}

export async function upsertAnonymousBasketLine(input: {
  productPublicId: string;
  quantity: number;
  expectedVersion: number;
  mutationId?: string;
}) {
  return qosFetchJson<AnonymousBasketResponse>(`/api/baskets/current/lines${BASKET_QUERY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function updateAnonymousBasketLine(
  linePublicId: string,
  input: {
    quantity: number;
    expectedVersion: number;
    mutationId?: string;
  },
) {
  return qosFetchJson<AnonymousBasketResponse>(
    `/api/baskets/current/lines/${encodeURIComponent(linePublicId)}${BASKET_QUERY}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
}

export async function removeAnonymousBasketLine(
  linePublicId: string,
  input: {
    expectedVersion: number;
    mutationId?: string;
  },
) {
  return qosFetchJson<AnonymousBasketResponse>(
    `/api/baskets/current/lines/${encodeURIComponent(linePublicId)}${BASKET_QUERY}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
}

export async function upsertAccountBasketLine(input: {
  productPublicId: string;
  quantity: number;
  expectedVersion: number;
  mutationId?: string;
}) {
  return qosFetchJson<AccountBasketResponse>(`/api/baskets/account/current/lines${BASKET_QUERY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function removeAccountBasketLine(
  linePublicId: string,
  input: {
    expectedVersion: number;
    mutationId?: string;
  },
) {
  return qosFetchJson<AccountBasketResponse>(
    `/api/baskets/account/current/lines/${encodeURIComponent(linePublicId)}${BASKET_QUERY}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
}

export async function ensureActiveBasket(locale: "en" | "ar" = "en") {
  const signedIn = await fetchCurrentCustomerSignedIn();

  if (signedIn) {
    const response = await fetchAccountBasket();
    return { basket: response.basket, signedIn: true as const };
  }

  try {
    const response = await fetchAnonymousBasket();
    return { basket: response.basket, signedIn: false as const };
  } catch (error) {
    if (error instanceof QosRequestError && (error.statusCode === 404 || error.statusCode === 401)) {
      const created = await createAnonymousBasket(locale);
      return { basket: created.basket, signedIn: false as const };
    }
    throw error;
  }
}
