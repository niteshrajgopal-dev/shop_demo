import { qosFetchJson, QosRequestError } from "@/lib/qos/api-client";
import type {
  BasketMergeCommitApiResponse,
  BasketMergeDecision,
  BasketMergePreviewApiResponse,
  BasketMergePreviewResponse,
} from "@/lib/qos/types";

const MERGE_QUERY = "?contractVersion=1";

export async function fetchBasketMergePreview() {
  return qosFetchJson<BasketMergePreviewApiResponse>(
    `/api/baskets/merge/preview${MERGE_QUERY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{}",
    },
  );
}

export async function commitBasketMerge(input: {
  preview: BasketMergePreviewResponse;
  decision: BasketMergeDecision;
  operationId?: string;
}) {
  const { preview, decision } = input;
  const operationId = input.operationId ?? crypto.randomUUID();

  return qosFetchJson<BasketMergeCommitApiResponse>(
    `/api/baskets/merge/commit${MERGE_QUERY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        decision,
        operationId,
        payloadHash: preview.decisionPayloadHashes[decision],
        anonymousExpectedVersion: preview.anonymousBasket.version,
        accountExpectedVersion: preview.accountBasket.version,
      }),
    },
  );
}

export function shouldPromptBasketMerge(preview: BasketMergePreviewResponse) {
  return preview.anonymousBasket.itemCount > 0;
}

export function pickAutoMergeDecision(
  preview: BasketMergePreviewResponse,
): BasketMergeDecision | null {
  if (preview.anonymousBasket.itemCount === 0) {
    return "keep_account";
  }

  if (preview.accountBasket.itemCount === 0) {
    return null;
  }

  return null;
}

export function isMergePreviewUnavailable(error: unknown) {
  return (
    error instanceof QosRequestError &&
    (error.statusCode === 401 ||
      error.statusCode === 404 ||
      error.statusCode === 410 ||
      error.statusCode === 403)
  );
}
