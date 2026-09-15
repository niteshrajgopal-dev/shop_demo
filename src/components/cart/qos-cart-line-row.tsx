"use client";

import { Mark } from "@/components/brand/mark";
import { QuantityStepper } from "@/components/ui/field";
import { formatMoneyMinor } from "@/lib/qos/money";
import type { BasketLineResponse } from "@/lib/qos/types";
import { useQosBasket } from "@/lib/stores/qos-basket";
import { cn } from "@/lib/cn";

export function QosCartLineRow({
  line,
  currency,
  locale,
  compact = false,
  readOnly = false,
}: {
  line: BasketLineResponse;
  currency: string;
  locale: "en" | "ar";
  compact?: boolean;
  readOnly?: boolean;
}) {
  const productLabels = useQosBasket((state) => state.productLabels);
  const setLineQuantity = useQosBasket((state) => state.setLineQuantity);
  const removeLine = useQosBasket((state) => state.removeLine);
  const status = useQosBasket((state) => state.status);

  const displayName = productLabels[line.productPublicId] ?? line.productPublicId;
  const lineTotalMinor = line.unitPrice.amountMinor * line.quantity;
  const busy = status === "mutating";

  return (
    <li className={cn("flex gap-4 border-b border-line py-4 last:border-b-0", compact && "py-3.5")}>
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-sm border border-line bg-latte-50",
          compact ? "h-14 w-14" : "h-16 w-16",
        )}
      >
        <Mark className={compact ? "w-5" : "w-6"} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[14.5px] font-medium leading-snug">{displayName}</p>
            <p className="ltr-isolate t-caption mt-0.5 font-mono">{line.productPublicId}</p>
          </div>
          <p className="ltr-isolate shrink-0 font-mono text-[13.5px] tabular-nums">
            {formatMoneyMinor(lineTotalMinor, currency, locale)}
          </p>
        </div>

        {readOnly ? (
          <p className="t-caption font-mono">
            {line.quantity} × {formatMoneyMinor(line.unitPrice.amountMinor, currency, locale)}
          </p>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <QuantityStepper
              value={line.quantity}
              onChange={(quantity) => {
                if (busy) {
                  return;
                }
                if (quantity <= 0) {
                  void removeLine(line.linePublicId);
                  return;
                }
                void setLineQuantity(line.linePublicId, quantity);
              }}
              min={0}
              label={`${displayName} quantity`}
            />
            <button
              type="button"
              onClick={() => {
                if (!busy) {
                  void removeLine(line.linePublicId);
                }
              }}
              disabled={busy}
              className="rounded-sm px-2 py-2 text-[13px] text-muted underline decoration-line underline-offset-4 transition-colors duration-fast ease-brand hover:text-error disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
