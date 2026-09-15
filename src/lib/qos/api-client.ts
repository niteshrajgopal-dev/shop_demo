import type { QosApiError } from "@/lib/qos/types";

export class QosRequestError extends Error {
  readonly statusCode: number;
  readonly field?: string;

  constructor(message: string, statusCode: number, field?: string) {
    super(message);
    this.name = "QosRequestError";
    this.statusCode = statusCode;
    this.field = field;
  }
}

export async function qosFetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as T | QosApiError;

  if (!response.ok) {
    const errorPayload = payload as QosApiError;
    throw new QosRequestError(
      errorPayload.error || "QOS request failed.",
      response.status,
      errorPayload.field,
    );
  }

  return payload as T;
}
