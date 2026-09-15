"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { buildSignInHref } from "@/lib/auth/customer-auth-client";
import {
  selectCustomerDisplayName,
  selectCustomerSignedIn,
  useCustomerSession,
} from "@/lib/stores/customer-session";
import { useHydrated } from "@/lib/use-hydrated";

type CustomerAccountMenuProps = {
  compact?: boolean;
  returnTo?: string;
  onNavigate?: () => void;
};

export function CustomerAccountMenu({
  compact = false,
  returnTo = "/checkout",
  onNavigate,
}: CustomerAccountMenuProps) {
  const hydrated = useHydrated();
  const signedIn = useCustomerSession(selectCustomerSignedIn);
  const displayName = useCustomerSession(selectCustomerDisplayName);
  const status = useCustomerSession((state) => state.status);
  const signOut = useCustomerSession((state) => state.signOut);
  const [busy, setBusy] = useState(false);

  if (!hydrated || status === "loading") {
    return (
      <span className="t-caption text-muted">{compact ? "Account…" : "Checking account…"}</span>
    );
  }

  if (!signedIn) {
    return (
      <Link
        href={buildSignInHref(returnTo)}
        onClick={onNavigate}
        className={
          compact
            ? "inline-flex min-h-11 items-center rounded-sm px-3 text-[13px] font-medium text-espresso transition-colors duration-fast hover:bg-latte-50"
            : "inline-flex min-h-11 items-center rounded-sm border border-line px-4 text-[13px] font-medium text-espresso transition-colors duration-fast hover:border-latte hover:bg-latte-50"
        }
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className={compact ? "flex flex-col gap-2" : "flex items-center gap-2"}>
      <span
        className={
          compact
            ? "t-caption text-muted"
            : "hidden max-w-[180px] truncate text-[13px] text-muted md:inline"
        }
        title={displayName ?? undefined}
      >
        {displayName}
      </span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        loading={busy}
        loadingLabel="Signing out…"
        onClick={() => {
          setBusy(true);
          void signOut()
            .catch(() => undefined)
            .finally(() => {
              setBusy(false);
              onNavigate?.();
            });
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
