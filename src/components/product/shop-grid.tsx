"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { FilterRail } from "@/components/ui/tabs";
import { Icon } from "@/components/brand/icons";
import { CoffeeCard } from "@/components/product/coffee-card";
import { COFFEES, ROASTS, type Roast } from "@/lib/fixtures/quotes-design-reference/catalog";

type RoastFilter = "all" | Roast;
type Sort = "featured" | "price-asc" | "price-desc";

export function ShopGrid() {
  const [roast, setRoast] = useState<RoastFilter>("all");
  const [sort, setSort] = useState<Sort>("featured");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = COFFEES.filter((coffee) => {
      const matchesRoast = roast === "all" || coffee.roast === roast;
      const matchesQuery =
        !needle ||
        coffee.name.toLowerCase().includes(needle) ||
        coffee.origin.toLowerCase().includes(needle) ||
        coffee.notes.some((note) => note.toLowerCase().includes(needle));
      return matchesRoast && matchesQuery;
    });

    if (sort === "price-asc") {
      return [...filtered].sort((a, b) => a.sizes[0].price - b.sizes[0].price);
    }
    if (sort === "price-desc") {
      return [...filtered].sort((a, b) => b.sizes[0].price - a.sizes[0].price);
    }
    return [...filtered].sort(
      (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
    );
  }, [roast, sort, query]);

  const roastCount = (value: Roast) =>
    COFFEES.filter((coffee) => coffee.roast === value).length;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Search coffee</span>
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-muted"
            strokeWidth={1.7}
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search origin, or a tasting note like “jasmine”"
            className="min-h-12 w-full rounded-sm border border-line bg-surface pr-4 pl-11 text-[15px] transition-colors duration-fast ease-brand hover:border-latte placeholder:text-muted/70"
          />
        </label>

        <label className="flex items-center gap-3 lg:shrink-0">
          <span className="t-label shrink-0">Sort</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
            className="min-h-12 rounded-sm border border-line bg-surface px-3.5 pr-8 text-[14px] transition-colors duration-fast ease-brand hover:border-latte"
          >
            <option value="featured">Featured first</option>
            <option value="price-asc">Price · low to high</option>
            <option value="price-desc">Price · high to low</option>
          </select>
        </label>
      </div>

      <FilterRail<RoastFilter>
        label="Roast level"
        value={roast}
        onChange={setRoast}
        options={[
          { value: "all", label: "All roasts", count: COFFEES.length },
          ...ROASTS.filter((value) => roastCount(value) > 0).map((value) => ({
            value,
            label: value,
            count: roastCount(value),
          })),
        ]}
      />

      <p aria-live="polite" className="t-caption">
        {results.length} coffee{results.length === 1 ? "" : "s"}
        {roast === "all" ? "" : ` · ${roast} roast`}
      </p>

      {results.length === 0 ? (
        <EmptyState
          title="No coffee matches that"
          body={`Nothing on the shelf matches “${query}”. Try an origin like “Ethiopia”, or a note like “chocolate”.`}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery("");
                setRoast("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((coffee, index) => (
            <CoffeeCard key={coffee.slug} coffee={coffee} variant="dark" index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
