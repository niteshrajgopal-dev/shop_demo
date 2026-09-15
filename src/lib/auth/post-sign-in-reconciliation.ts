import {
  commitBasketMerge,
  fetchBasketMergePreview,
  isMergePreviewUnavailable,
  pickAutoMergeDecision,
  shouldPromptBasketMerge,
} from "@/lib/qos/basket-merge-client";
import type { BasketMergePreviewResponse } from "@/lib/qos/types";

export type PostSignInReconciliationResult =
  | { kind: "none" }
  | { kind: "auto-committed" }
  | { kind: "needs-dialog"; preview: BasketMergePreviewResponse };

const RECONCILE_LOCK_KEY = "qos-basket-merge-lock";

export async function reconcileBasketsAfterSignIn(): Promise<PostSignInReconciliationResult> {
  if (typeof window !== "undefined" && sessionStorage.getItem(RECONCILE_LOCK_KEY)) {
    return { kind: "none" };
  }

  if (typeof window !== "undefined") {
    sessionStorage.setItem(RECONCILE_LOCK_KEY, "1");
  }

  try {
    const { preview } = await fetchBasketMergePreview();

    if (!shouldPromptBasketMerge(preview)) {
      await commitBasketMerge({ preview, decision: "keep_account" });
      return { kind: "auto-committed" };
    }

    const autoDecision = pickAutoMergeDecision(preview);
    if (autoDecision) {
      await commitBasketMerge({ preview, decision: autoDecision });
      return { kind: "auto-committed" };
    }

    return { kind: "needs-dialog", preview };
  } catch (error) {
    if (isMergePreviewUnavailable(error)) {
      return { kind: "none" };
    }

    throw error;
  } finally {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(RECONCILE_LOCK_KEY);
    }
  }
}
