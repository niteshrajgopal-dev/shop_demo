"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/card";
import { TextField } from "@/components/ui/field";
import { resetPassword } from "@/lib/auth/customer-auth-client";
import { resolveSafeReturnPath } from "@/lib/auth/return-url";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const errorCode = searchParams.get("error")?.trim() ?? "";
  const returnTo = resolveSafeReturnPath(searchParams.get("returnTo"));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await resetPassword({ token, newPassword: password });
      setDone(true);
      router.push(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
    } catch (resetError) {
      setError(
        resetError instanceof Error ? resetError.message : "Unable to reset password.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (errorCode === "INVALID_TOKEN" || !token) {
    return (
      <Notice tone="error" title="Reset link invalid">
        This password reset link is missing or expired. Request a new one from the sign-in page.
        <div className="mt-3">
          <Link href={`/forgot-password?returnTo=${encodeURIComponent(returnTo)}`} className="underline underline-offset-4">
            Request a new link
          </Link>
        </div>
      </Notice>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <TextField
        label="New password"
        type="password"
        value={password}
        autoComplete="new-password"
        required
        minLength={8}
        onChange={(event) => setPassword(event.target.value)}
      />

      <TextField
        label="Confirm password"
        type="password"
        value={confirmPassword}
        autoComplete="new-password"
        required
        minLength={8}
        onChange={(event) => setConfirmPassword(event.target.value)}
      />

      {done ? (
        <Notice tone="info" title="Password updated">
          You can now sign in with your new password.
        </Notice>
      ) : null}

      {error ? (
        <Notice tone="error" title="Reset failed">
          {error}
        </Notice>
      ) : null}

      <Button type="submit" size="lg" block loading={busy} loadingLabel="Updating…">
        Update password
      </Button>
    </form>
  );
}
