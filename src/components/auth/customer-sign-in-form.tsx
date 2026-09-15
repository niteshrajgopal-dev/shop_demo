"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/card";
import { TextField } from "@/components/ui/field";
import {
  signInWithEmail,
  signInWithSocial,
  signUpWithEmail,
  type CustomerOAuthProvider,
} from "@/lib/auth/customer-auth-client";
import { BasketMergeDialog } from "@/components/basket/basket-merge-dialog";
import { reconcileBasketsAfterSignIn } from "@/lib/auth/post-sign-in-reconciliation";
import { resolveSafeReturnPath } from "@/lib/auth/return-url";
import type { BasketMergePreviewResponse } from "@/lib/qos/types";
import { useCustomerSession } from "@/lib/stores/customer-session";
import { useQosBasket } from "@/lib/stores/qos-basket";

type AuthMode = "sign-in" | "sign-up";

type CustomerSignInFormProps = {
  oauthProviders?: CustomerOAuthProvider[];
};

const PROVIDER_LABELS: Record<CustomerOAuthProvider, string> = {
  google: "Continue with Google",
  microsoft: "Continue with Microsoft",
};

export function CustomerSignInForm({
  oauthProviders = ["google", "microsoft"],
}: CustomerSignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = resolveSafeReturnPath(searchParams.get("returnTo"));
  const refreshCustomer = useCustomerSession((state) => state.refresh);
  const hydrateBasket = useQosBasket((state) => state.hydrate);

  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verificationPending, setVerificationPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<CustomerOAuthProvider | null>(null);
  const [mergePreview, setMergePreview] = useState<BasketMergePreviewResponse | null>(null);

  async function completeAuth(userEmailVerified: boolean) {
    if (!userEmailVerified) {
      setVerificationPending(true);
      return;
    }

    await refreshCustomer();

    const reconciliation = await reconcileBasketsAfterSignIn();
    if (reconciliation.kind === "needs-dialog") {
      setMergePreview(reconciliation.preview);
      return;
    }

    await hydrateBasket();
    router.push(returnTo);
    router.refresh();
  }

  async function finishMergeDialog() {
    setMergePreview(null);
    await hydrateBasket();
    router.push(returnTo);
    router.refresh();
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setVerificationPending(false);

    try {
      const payload =
        mode === "sign-in"
          ? await signInWithEmail({ email, password, rememberMe: true })
          : await signUpWithEmail({
              email,
              password,
              name: name.trim() || email.split("@")[0] || "Customer",
            });

      await completeAuth(Boolean(payload.user?.emailVerified));
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : "Authentication failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onSocialSignIn(provider: CustomerOAuthProvider) {
    setOauthBusy(provider);
    setError(null);
    setVerificationPending(false);

    try {
      await signInWithSocial(provider, returnTo);
    } catch (authError) {
      setOauthBusy(null);
      setError(
        authError instanceof Error ? authError.message : "Social sign-in failed.",
      );
    }
  }

  return (
    <>
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex gap-2">
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm ${mode === "sign-in" ? "bg-espresso text-cream" : "border border-line"}`}
          onClick={() => setMode("sign-in")}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm ${mode === "sign-up" ? "bg-espresso text-cream" : "border border-line"}`}
          onClick={() => setMode("sign-up")}
        >
          Create account
        </button>
      </div>

      {oauthProviders.length > 0 ? (
        <div className="flex flex-col gap-2">
          {oauthProviders.map((provider) => (
            <Button
              key={provider}
              type="button"
              variant="secondary"
              block
              loading={oauthBusy === provider}
              loadingLabel="Redirecting…"
              disabled={Boolean(oauthBusy) || busy}
              onClick={() => void onSocialSignIn(provider)}
            >
              {PROVIDER_LABELS[provider]}
            </Button>
          ))}
          <p className="t-caption text-center text-muted">or use email</p>
        </div>
      ) : null}

      {mode === "sign-up" ? (
        <TextField
          label="Name"
          value={name}
          autoComplete="name"
          onChange={(event) => setName(event.target.value)}
        />
      ) : null}

      <TextField
        label="Email"
        type="email"
        value={email}
        autoComplete="email"
        inputMode="email"
        required
        onChange={(event) => setEmail(event.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
        required
        minLength={8}
        onChange={(event) => setPassword(event.target.value)}
      />

      {mode === "sign-in" ? (
        <p className="t-caption">
          <Link
            href={`/forgot-password?returnTo=${encodeURIComponent(returnTo)}`}
            className="underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </p>
      ) : null}

      {mode === "sign-up" ? (
        <Notice tone="info">
          Checkout requires a verified email. If verification is enabled, check your inbox
          before paying.
        </Notice>
      ) : null}

      {verificationPending ? (
        <Notice tone="info" title="Verify your email">
          We saved your account, but checkout stays blocked until your email is verified.
          Ask your operator to confirm the address in QOS for sandbox demos, or use the link
          in your verification email.
        </Notice>
      ) : null}

      {error ? (
        <Notice tone="error" title="Sign-in failed">
          {error}
        </Notice>
      ) : null}

      <Button type="submit" size="lg" block loading={busy} loadingLabel="Working…">
        {mode === "sign-in" ? "Sign in" : "Create account"}
      </Button>

      <p className="t-caption text-center">
        <Link href={returnTo} className="underline underline-offset-4">
          Back to {returnTo === "/checkout" ? "checkout" : "where you were"}
        </Link>
      </p>
    </form>

    {mergePreview ? (
      <BasketMergeDialog
        open
        preview={mergePreview}
        onClose={() => void finishMergeDialog()}
        onComplete={() => void finishMergeDialog()}
      />
    ) : null}
    </>
  );
}
