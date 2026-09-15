"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { FilterRail } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/lib/stores/cart";
import { useQosBasket } from "@/lib/stores/qos-basket";
import { formatMoneyMinor } from "@/lib/qos/money";
import type { PublicMenuProduct, PublicMenuResponse } from "@/lib/qos/menu-types";
import { cn } from "@/lib/cn";

type CategoryFilter = "all" | string;

function countMenuProducts(menu: PublicMenuResponse) {
  return menu.sections.reduce((total, section) => total + section.products.length, 0);
}

export function MenuBoard({
  menu,
  openBagOnAdd = false,
}: {
  menu: PublicMenuResponse;
  openBagOnAdd?: boolean;
}) {
  const { toast } = useToast();
  const upsertProduct = useQosBasket((state) => state.upsertProduct);
  const setDrawerOpen = useCart((state) => state.setDrawerOpen);

  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");

  const productTotal = countMenuProducts(menu);

  const visibleSections = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return menu.sections
      .map((section) => ({
        section,
        products: section.products.filter((product) => {
          const inCategory = category === "all" || section.publicId === category;
          const matches =
            !needle ||
            product.displayName.toLowerCase().includes(needle) ||
            (product.description ?? "").toLowerCase().includes(needle);
          return inCategory && matches;
        }),
      }))
      .filter((entry) => entry.products.length > 0);
  }, [category, menu.sections, query]);

  const quickAdd = (product: PublicMenuProduct) => {
    if (!product.eligibility.available) {
      return;
    }

    void upsertProduct({
      productPublicId: product.productPublicId,
      displayName: product.displayName,
    }).then(() => {
      toast({
        title: `${product.displayName} added`,
        body: "Saved to your QOS basket.",
      });
      if (openBagOnAdd) {
        setDrawerOpen(true);
      }
    });
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-4">
        <label className="relative block">
          <span className="sr-only">Search the menu</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the published menu…"
            className="min-h-12 w-full rounded-sm border border-line bg-surface pr-4 pl-4 text-[15px] transition-colors duration-fast ease-brand hover:border-latte placeholder:text-muted/70"
          />
        </label>

        <FilterRail<CategoryFilter>
          label="Menu categories"
          value={category}
          onChange={setCategory}
          options={[
            { value: "all", label: "Everything", count: productTotal },
            ...menu.sections.map((section) => ({
              value: section.publicId,
              label: section.displayName,
              count: section.products.length,
            })),
          ]}
        />
      </div>

      {visibleSections.length === 0 ? (
        <EmptyState
          title="Nothing matches that"
          body={`No menu item matches “${query}”. Try another search or clear the filters.`}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        visibleSections.map(({ section, products }) => (
          <section
            key={section.publicId}
            aria-labelledby={`menu-${section.publicId}`}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-3">
              <h3 id={`menu-${section.publicId}`} className="t-h2">
                {section.displayName}
              </h3>
              {section.description ? (
                <p className="t-caption sm:ml-auto">{section.description}</p>
              ) : null}
            </div>

            <ul className="grid gap-3 md:grid-cols-2">
              {products.map((product) => (
                <MenuRow
                  key={product.productPublicId}
                  product={product}
                  currency={menu.currency}
                  locale={menu.locale}
                  onQuickAdd={() => quickAdd(product)}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

function MenuRow({
  product,
  currency,
  locale,
  onQuickAdd,
}: {
  product: PublicMenuProduct;
  currency: string;
  locale: PublicMenuResponse["locale"];
  onQuickAdd: () => void;
}) {
  const unavailable = !product.eligibility.available;

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-md border border-line bg-surface p-4 transition-colors duration-fast ease-brand",
        unavailable ? "opacity-60" : "hover:border-latte",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-[16px] font-semibold">{product.displayName}</h4>
          {product.description ? (
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
              {product.description}
            </p>
          ) : null}
        </div>
        <span className="ltr-isolate shrink-0 font-mono text-[14px] tabular-nums">
          {formatMoneyMinor(product.price.amountMinor, currency, locale)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {unavailable ? <Badge tone="warning">Unavailable</Badge> : null}
      </div>

      <div className="mt-auto flex gap-2 pt-1">
        <Button
          size="sm"
          onClick={onQuickAdd}
          disabled={unavailable}
          className="flex-1"
        >
          {unavailable ? "Unavailable" : "Add"}
        </Button>
      </div>
    </li>
  );
}
