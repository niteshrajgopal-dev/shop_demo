"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchCheckoutOutcomeByProviderSession,
  CheckoutOutcomeRequestError,
} from "@/lib/qos/checkout-outcome-client";
import {
  PENDING_CHECKOUT_OUTCOME_STATUSES,
  type CheckoutPaymentOutcomeResponse,
} from "@/lib/qos/types";

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 12;

export type CheckoutOutcomeViewState =
  | { kind: "loading"; attempt: number }
  | { kind: "missing_session" }
  | { kind: "unauthenticated" }
  | { kind: "not_found" }
  | { kind: "misconfigured" }
  | { kind: "error"; message: string }
  | { kind: "outcome"; outcome: CheckoutPaymentOutcomeResponse; polling: boolean };

function isPendingStatus(status: CheckoutPaymentOutcomeResponse["status"]) {
  return PENDING_CHECKOUT_OUTCOME_STATUSES.has(status);
}

export function useCheckoutOutcome(sessionId: string) {
  const trimmedSessionId = sessionId.trim();
  const [attempt, setAttempt] = useState(0);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [state, setState] = useState<CheckoutOutcomeViewState>({
    kind: "loading",
    attempt: 0,
  });
  const schedulePollRef = useRef(false);

  const refresh = useCallback(() => {
    schedulePollRef.current = false;
    setAttempt(0);
    setReloadNonce((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    schedulePollRef.current = false;

    async function loadOutcome() {
      if (!trimmedSessionId.startsWith("cs_")) {
        setState({
          kind: "error",
          message: "This checkout reference is not valid.",
        });
        return;
      }

      setState({ kind: "loading", attempt });

      try {
        const { outcome } = await fetchCheckoutOutcomeByProviderSession(trimmedSessionId);
        if (cancelled) {
          return;
        }

        const shouldPoll =
          isPendingStatus(outcome.status) && attempt < MAX_POLL_ATTEMPTS;

        setState({ kind: "outcome", outcome, polling: shouldPoll });

        if (shouldPoll) {
          schedulePollRef.current = true;
          window.setTimeout(() => {
            if (!cancelled && schedulePollRef.current) {
              setAttempt((value) => value + 1);
            }
          }, POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof CheckoutOutcomeRequestError) {
          if (error.statusCode === 401 || error.statusCode === 403) {
            setState({ kind: "unauthenticated" });
            return;
          }

          if (error.statusCode === 404) {
            setState({ kind: "not_found" });
            return;
          }

          if (error.statusCode === 500 && error.message.includes("QOS checkout integration")) {
            setState({ kind: "misconfigured" });
            return;
          }
        }

        setState({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to confirm checkout status.",
        });
      }
    }

    void loadOutcome();

    return () => {
      cancelled = true;
      schedulePollRef.current = false;
    };
  }, [attempt, reloadNonce, trimmedSessionId]);

  return { state, refresh };
}
