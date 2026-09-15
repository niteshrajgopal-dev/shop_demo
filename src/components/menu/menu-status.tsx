import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Notice } from "@/components/ui/card";
import type { MenuLoadResult } from "@/lib/qos/menu-types";

export function MenuUnavailable({ result }: { result: MenuLoadResult }) {
  if (result.status === "ok") {
    return null;
  }

  return (
    <EmptyState
      title="Published menu unavailable"
      body={result.error}
      action={
        <ButtonLink href="/locations" variant="secondary" size="sm">
          View locations
        </ButtonLink>
      }
    />
  );
}

export function MenuContextNotice({
  branchName,
  menuDisplayName,
  releaseVersion,
  locale,
  currency,
}: {
  branchName: string;
  menuDisplayName: string;
  releaseVersion: number;
  locale: string;
  currency: string;
}) {
  return (
    <Notice tone="info">
      Showing <span className="font-medium text-fg">{menuDisplayName}</span> for{" "}
      <span className="font-medium text-fg">{branchName}</span> · release{" "}
      {releaseVersion} · {locale.toUpperCase()} · {currency}
    </Notice>
  );
}
