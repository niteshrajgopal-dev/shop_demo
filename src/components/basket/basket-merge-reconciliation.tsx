"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { BasketMergeDialog } from "@/components/basket/basket-merge-dialog";
import { reconcileBasketsAfterSignIn } from "@/lib/auth/post-sign-in-reconciliation";
import { resolveSafeReturnPath } from "@/lib/auth/return-url";
import type { BasketMergePreviewResponse } from "@/lib/qos/types";
import {
  selectCustomerSignedIn,
  useCustomerSession,
} from "@/lib/stores/customer-session";
import { useQosBasket } from "@/lib/stores/qos-basket";

const PENDING_MERGE_CHECK_KEY = "qos-pending-merge-check";

export function BasketMergeReconciliation() {
  const router = useRouter();
  const signedIn = useCustomerSession(selectCustomerSignedIn);
  const sessionStatus = useCustomerSession((state) => state.status);
  const hydrate = useQosBasket((state) => state.hydrate);

  const [preview, setPreview] = useState<BasketMergePreviewResponse | null>(null);
  const [pendingReturnTo, setPendingReturnTo] = useState<string | null>(null);
  const startedRef = useRef(false);

  const finishReconciliation = useCallback(
    async (returnTo?: string | null) => {
      await hydrate();
      setPreview(null);
      setPendingReturnTo(null);
      startedRef.current = false;

      if (returnTo) {
        router.push(returnTo);
        router.refresh();
      }
    },
    [hydrate, router],
  );

  useEffect(() => {
    if (!signedIn || sessionStatus !== "ready" || startedRef.current || preview) {
      return;
    }

    const pendingReturnRaw = sessionStorage.getItem(PENDING_MERGE_CHECK_KEY);
    if (!pendingReturnRaw) {
      return;
    }

    sessionStorage.removeItem(PENDING_MERGE_CHECK_KEY);
    startedRef.current = true;

    const returnTo = resolveSafeReturnPath(pendingReturnRaw);

    void (async () => {
      try {
        const result = await reconcileBasketsAfterSignIn();

        if (result.kind === "needs-dialog") {
          setPendingReturnTo(returnTo);
          setPreview(result.preview);
          return;
        }

        await finishReconciliation(result.kind === "auto-committed" ? returnTo : null);
      } catch {
        startedRef.current = false;
      }
    })();
  }, [signedIn, sessionStatus, preview, finishReconciliation]);

  if (!preview) {
    return null;
  }

  return (
    <BasketMergeDialog
      open
      preview={preview}
      onClose={() => void finishReconciliation(pendingReturnTo)}
      onComplete={() => void finishReconciliation(pendingReturnTo)}
    />
  );
}
