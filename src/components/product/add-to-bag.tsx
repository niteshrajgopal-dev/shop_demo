"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChoiceGroup, QuantityStepper } from "@/components/ui/field";
import { Segmented } from "@/components/ui/tabs";
import { Notice } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/lib/stores/cart";
import { formatPrice } from "@/lib/fixtures/quotes-design-reference/brand";
import {
  GRINDS,
  SUBSCRIPTION_FREQUENCIES,
  type Coffee,
  type FrequencyId,
  type GrindId,
} from "@/lib/fixtures/quotes-design-reference/catalog";

type Plan = "one-off" | "subscribe";

/**
 * The product configurator: bag size, grind, one-off vs subscription and
 * quantity, resolving to a single priced line.
 */
export function AddToBag({ coffee }: { coffee: Coffee }) {
  const { toast } = useToast();
  const add = useCart((state) => state.add);
  const setDrawerOpen = useCart((state) => state.setDrawerOpen);

  const [sizeId, setSizeId] = useState(coffee.sizes[0].id);
  const [grind, setGrind] = useState<GrindId>("whole");
  const [plan, setPlan] = useState<Plan>("one-off");
  const [frequency, setFrequency] = useState<FrequencyId>("fortnightly");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const soldOut = coffee.stock === "sold-out";
  const size = coffee.sizes.find((candidate) => candidate.id === sizeId) ?? coffee.sizes[0];
  const frequencyOption =
    SUBSCRIPTION_FREQUENCIES.find((candidate) => candidate.id === frequency) ??
    SUBSCRIPTION_FREQUENCIES[1];

  const unitPrice = useMemo(() => {
    const discount = plan === "subscribe" ? frequencyOption.discount : 0;
    return Math.round(size.price * (1 - discount) * 100) / 100;
  }, [plan, frequencyOption.discount, size.price]);

  const onAdd = () => {
    if (soldOut) return;
    setAdding(true);
    const grindOption = GRINDS.find((candidate) => candidate.id === grind) ?? GRINDS[0];

    // Brief pending state so the control reads as a real action, not a no-op.
    window.setTimeout(() => {
      add(
        {
          kind: "bean",
          slug: coffee.slug,
          name: coffee.name,
          sizeId: size.id,
          sizeLabel: size.label,
          grind: grindOption.id,
          grindLabel: grindOption.label,
          subscription: plan === "subscribe" ? frequencyOption.id : null,
          subscriptionLabel: plan === "subscribe" ? frequencyOption.label : null,
          unitPrice,
        },
        quantity,
      );
      setAdding(false);
      toast({
        title: `${coffee.name} added`,
        body: `${size.label} · ${grindOption.label}${
          plan === "subscribe" ? ` · ${frequencyOption.label}` : ""
        }`,
      });
      setDrawerOpen(true);
    }, 420);
  };

  return (
    <div className="flex flex-col gap-6">
      <Segmented<Plan>
        label="Purchase plan"
        value={plan}
        onChange={setPlan}
        options={[
          { value: "one-off", label: "One-off", hint: "Buy once" },
          {
            value: "subscribe",
            label: "Subscribe",
            hint: `Save up to ${Math.round(SUBSCRIPTION_FREQUENCIES[0].discount * 100)}%`,
          },
        ]}
      />

      {plan === "subscribe" ? (
        <ChoiceGroup<FrequencyId>
          legend="Delivery frequency"
          value={frequency}
          onChange={setFrequency}
          columns={3}
          options={SUBSCRIPTION_FREQUENCIES.map((option) => ({
            value: option.id,
            label: option.label,
            meta: `−${Math.round(option.discount * 100)}%`,
          }))}
        />
      ) : null}

      <ChoiceGroup
        legend="Bag size"
        value={sizeId}
        onChange={setSizeId}
        columns={3}
        options={coffee.sizes.map((option) => ({
          value: option.id,
          label: option.label,
          meta: formatPrice(
            plan === "subscribe"
              ? Math.round(option.price * (1 - frequencyOption.discount) * 100) / 100
              : option.price,
          ),
        }))}
      />

      <ChoiceGroup<GrindId>
        legend="Grind"
        value={grind}
        onChange={setGrind}
        columns={2}
        options={GRINDS.map((option) => ({
          value: option.id,
          label: option.label,
          hint: option.hint,
        }))}
      />

      {grind !== "whole" ? (
        <Notice tone="info">
          Ground to order on the day it ships. Whole bean keeps its aromatics far longer if
          you have a grinder.
        </Notice>
      ) : null}

      {soldOut ? (
        <Notice tone="warning" title="Sold out.">
          This lot has finished. Join the list and we&apos;ll write when the next harvest lands.
        </Notice>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-line pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="t-label">Total</span>
          <span className="font-mono text-[22px] tabular-nums">
            {formatPrice(unitPrice * quantity)}
            {plan === "subscribe" ? (
              <span className="ml-2 font-sans text-[13px] text-muted">
                / {frequencyOption.label.toLowerCase()}
              </span>
            ) : null}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <QuantityStepper value={quantity} onChange={setQuantity} label="Bag quantity" />
          <Button
            size="lg"
            loading={adding}
            loadingLabel="Adding"
            disabled={soldOut}
            onClick={onAdd}
            className="min-w-0 flex-1"
          >
            {soldOut ? "Sold out" : plan === "subscribe" ? "Start subscription" : "Add to bag"}
          </Button>
        </div>

        {plan === "subscribe" ? (
          <p className="t-caption">
            Skip, pause or cancel any time from your account. First bag ships within one
            working day of roasting.
          </p>
        ) : null}
      </div>
    </div>
  );
}
