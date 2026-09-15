"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/card";
import { Sheet } from "@/components/ui/sheet";
import { commitBasketMerge, fetchBasketMergePreview } from "@/lib/qos/basket-merge-client";
import { storefrontMessage } from "@/lib/locale/messages";
import { formatMoneyMinor } from "@/lib/qos/money";
import { QosRequestError } from "@/lib/qos/api-client";
import type {
  BasketContextResponse,
  BasketMergeDecision,
  BasketMergeLineValidation,
  BasketMergePreviewResponse,
} from "@/lib/qos/types";
import { useQosBasket } from "@/lib/stores/qos-basket";
import { useStorefrontLocale } from "@/lib/stores/storefront-locale";

type BasketMergeDialogProps = {
  open: boolean;
  preview: BasketMergePreviewResponse;
  onClose: () => void;
  onComplete: () => void;
};

type DialogStep = "choose" | "review-merge" | "confirm-keep" | "confirm-replace";

function BasketLinesSummary({
  title,
  basket,
  productLabels,
  locale,
}: {
  title: string;
  basket: BasketContextResponse;
  productLabels: Record<string, string>;
  locale: "en" | "ar";
}) {
  const itemLabel =
    basket.itemCount === 1
      ? storefrontMessage(locale, "item")
      : storefrontMessage(locale, "items");

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-line p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="t-label">{title}</h3>
        <p className="font-mono text-[11px] text-muted">
          {basket.itemCount} {itemLabel}
        </p>
      </div>
      {basket.lines.length === 0 ? (
        <p className="t-caption text-muted">{storefrontMessage(locale, "emptyBasket")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {basket.lines.map((line) => (
            <li key={line.linePublicId} className="flex justify-between gap-3 text-[13px]">
              <span className="min-w-0 truncate">
                {productLabels[line.productPublicId] ?? line.productPublicId} × {line.quantity}
              </span>
              <span className="ltr-isolate shrink-0 font-mono tabular-nums">
                {formatMoneyMinor(
                  line.unitPrice.amountMinor * line.quantity,
                  basket.currency,
                  basket.locale,
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="ltr-isolate font-mono text-[12px] text-muted">
        {storefrontMessage(locale, "subtotal")}{" "}
        {formatMoneyMinor(
          basket.provisionalSubtotalMinor,
          basket.currency,
          basket.locale,
        )}
      </p>
    </div>
  );
}

function ValidationNotices({
  validations,
  productLabels,
}: {
  validations: BasketMergeLineValidation[];
  productLabels: Record<string, string>;
}) {
  const warnings = validations.filter((validation) => validation.status !== "ok");
  if (warnings.length === 0) {
    return null;
  }

  return (
    <Notice tone="warning" title="Review warnings">
      <ul className="mt-2 flex flex-col gap-1 text-[13px]">
        {warnings.map((validation) => (
          <li key={`${validation.productPublicId}:${validation.status}`}>
            {formatValidationMessage(validation, productLabels)}
          </li>
        ))}
      </ul>
    </Notice>
  );
}

function formatValidationMessage(
  validation: BasketMergeLineValidation,
  productLabels: Record<string, string>,
) {
  const label = productLabels[validation.productPublicId] ?? validation.productPublicId;

  switch (validation.status) {
    case "unavailable":
      return `${label} is no longer available on this menu.`;
    case "price_changed":
      return `${label} has an updated price on the published menu.`;
    case "quantity_exceeds_limit":
      return `${label} exceeds the basket quantity limit (${validation.combinedQuantity} requested, max ${validation.maxLineQuantity}).`;
    default:
      return `${label} needs review before merge.`;
  }
}

export function BasketMergeDialog({
  open,
  preview: initialPreview,
  onClose,
  onComplete,
}: BasketMergeDialogProps) {
  const productLabels = useQosBasket((state) => state.productLabels);
  const hydrate = useQosBasket((state) => state.hydrate);
  const locale = useStorefrontLocale((state) => state.locale);

  const [preview, setPreview] = useState(initialPreview);
  const [step, setStep] = useState<DialogStep>("choose");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mergeOutcome = preview.proposedOutcomes.merge;

  const blockingMerge = useMemo(
    () =>
      preview.lineValidations.some(
        (validation) =>
          validation.status === "unavailable" ||
          (validation.status === "quantity_exceeds_limit" && validation.source === "both"),
      ),
    [preview.lineValidations],
  );

  async function refreshPreview() {
    const response = await fetchBasketMergePreview();
    setPreview(response.preview);
    setError(null);
  }

  async function submitDecision(decision: BasketMergeDecision) {
    setBusy(true);
    setError(null);

    try {
      await commitBasketMerge({ preview, decision });
      await hydrate();
      onComplete();
    } catch (commitError) {
      if (commitError instanceof QosRequestError && commitError.statusCode === 409) {
        try {
          await refreshPreview();
          setError("Basket versions changed. Review the updated preview and try again.");
        } catch {
          setError("Basket merge conflict. Sign in again and retry.");
        }
      } else {
        setError(
          commitError instanceof Error
            ? commitError.message
            : "Unable to complete basket reconciliation.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  const footer =
    step === "choose" ? (
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          block
          size="lg"
          disabled={busy}
          onClick={() => setStep("review-merge")}
        >
          {storefrontMessage(locale, "mergeReview")}
        </Button>
        <Button
          type="button"
          block
          variant="secondary"
          disabled={busy}
          onClick={() => {
            if (preview.accountBasket.itemCount > 0) {
              setStep("confirm-replace");
              return;
            }
            void submitDecision("replace_with_anonymous");
          }}
        >
          {storefrontMessage(locale, "mergeUseCurrent")}
        </Button>
        <Button
          type="button"
          block
          variant="secondary"
          disabled={busy}
          onClick={() => {
            if (preview.anonymousBasket.itemCount > 0) {
              setStep("confirm-keep");
              return;
            }
            void submitDecision("keep_account");
          }}
        >
          {storefrontMessage(locale, "mergeKeepSaved")}
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-sm text-[13.5px] text-muted transition-colors duration-fast hover:text-fg"
        >
          {storefrontMessage(locale, "mergeCancel")}
        </button>
      </div>
    ) : step === "review-merge" ? (
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          block
          size="lg"
          loading={busy}
          loadingLabel="Applying merge…"
          disabled={blockingMerge}
          onClick={() => void submitDecision("merge")}
        >
          {storefrontMessage(locale, "mergeConfirm")}
        </Button>
        <Button type="button" block variant="secondary" disabled={busy} onClick={() => setStep("choose")}>
          {storefrontMessage(locale, "mergeCancel")}
        </Button>
      </div>
    ) : step === "confirm-keep" ? (
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          block
          size="lg"
          loading={busy}
          loadingLabel="Keeping saved basket…"
          onClick={() => void submitDecision("keep_account")}
        >
          {storefrontMessage(locale, "mergeDiscardCurrent")}
        </Button>
        <Button type="button" block variant="secondary" disabled={busy} onClick={() => setStep("choose")}>
          {storefrontMessage(locale, "mergeCancel")}
        </Button>
      </div>
    ) : (
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          block
          size="lg"
          loading={busy}
          loadingLabel="Replacing saved basket…"
          onClick={() => void submitDecision("replace_with_anonymous")}
        >
          {storefrontMessage(locale, "mergeReplaceSaved")}
        </Button>
        <Button type="button" block variant="secondary" disabled={busy} onClick={() => setStep("choose")}>
          {storefrontMessage(locale, "mergeCancel")}
        </Button>
      </div>
    );

  return (
    <Sheet
      open={open}
      onClose={busy ? () => undefined : onClose}
      title={storefrontMessage(locale, "mergeTitle")}
      description={storefrontMessage(locale, "mergeDescription")}
      footer={footer}
      side="bottom"
    >
      <div className="flex flex-col gap-5">
        <Notice tone="info">
          QOS applies your choice on the server. Nothing changes until you confirm an action.
        </Notice>

        {step === "choose" ? (
          <>
            <BasketLinesSummary
              title={storefrontMessage(locale, "currentBasket")}
              basket={preview.anonymousBasket}
              productLabels={productLabels}
              locale={locale}
            />
            <BasketLinesSummary
              title={storefrontMessage(locale, "savedBasket")}
              basket={preview.accountBasket}
              productLabels={productLabels}
              locale={locale}
            />
          </>
        ) : null}

        {step === "review-merge" ? (
          <>
            <BasketLinesSummary
              title={storefrontMessage(locale, "proposedMerge")}
              basket={mergeOutcome}
              productLabels={productLabels}
              locale={locale}
            />
            <ValidationNotices
              validations={preview.lineValidations}
              productLabels={productLabels}
            />
          </>
        ) : null}

        {step === "confirm-keep" ? (
          <Notice tone="warning" title="Discard current basket items?">
            Keeping your saved account basket will remove the {preview.anonymousBasket.itemCount}{" "}
            item{preview.anonymousBasket.itemCount === 1 ? "" : "s"} from this browser session.
          </Notice>
        ) : null}

        {step === "confirm-replace" ? (
          <Notice tone="warning" title="Replace saved basket contents?">
            Using your current browser basket will replace the {preview.accountBasket.itemCount}{" "}
            saved item{preview.accountBasket.itemCount === 1 ? "" : "s"} in your account basket.
          </Notice>
        ) : null}

        {error ? (
          <Notice tone="error" title="Basket reconciliation failed">
            {error}
          </Notice>
        ) : null}
      </div>
    </Sheet>
  );
}
