"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/card";
import { TextField } from "@/components/ui/field";
import { requestPasswordReset } from "@/lib/auth/customer-auth-client";
import { resolveSafeReturnPath } from "@/lib/auth/return-url";

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const returnTo = resolveSafeReturnPath(searchParams.get("returnTo"));
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to request password reset.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <p className="text-[14px] text-muted">
        Enter your email and we&apos;ll send a reset link when password recovery is enabled
        for this storefront.
      </p>

      <TextField
        label="Email"
        type="email"
        value={email}
        autoComplete="email"
        inputMode="email"
        required
        onChange={(event) => setEmail(event.target.value)}
      />

      {sent ? (
        <Notice tone="info" title="Check your email">
          If an account exists for that address, a reset link has been sent. Delivery depends
          on operator email configuration in QOS.
        </Notice>
      ) : null}

      {error ? (
        <Notice tone="error" title="Request failed">
          {error}
        </Notice>
      ) : null}

      <Button type="submit" size="lg" block loading={busy} loadingLabel="Sending…">
        Send reset link
      </Button>

      <p className="t-caption text-center">
        <Link href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`} className="underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
