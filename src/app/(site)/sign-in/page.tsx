import Link from "next/link";
import { Suspense } from "react";

import { Mark } from "@/components/brand/mark";
import { CustomerSignInForm } from "@/components/auth/customer-sign-in-form";
import { Card } from "@/components/ui/card";
import { readOAuthProvidersFromEnv } from "@/lib/auth/customer-auth-client";

export default function SignInPage() {
  const oauthProviders = readOAuthProvidersFromEnv(process.env.QOS_CUSTOMER_OAUTH_PROVIDERS);

  return (
    <section className="wrap pt-[clamp(32px,5vw,64px)] pb-[clamp(48px,7vw,88px)]">
      <header className="mb-8 flex flex-col gap-4">
        <span className="t-overline inline-flex items-center gap-2.5 tracking-[0.22em] text-muted">
          <Mark className="w-[0.9em]" />
          Customer account
        </span>
        <h1 className="t-display-m">Sign in for checkout.</h1>
        <p className="max-w-xl text-muted">
          QOS checkout requires a verified customer session on this storefront domain.
        </p>
      </header>

      <Card className="max-w-lg">
        <Suspense fallback={<p className="text-muted">Loading sign-in…</p>}>
          <CustomerSignInForm oauthProviders={oauthProviders} />
        </Suspense>
      </Card>

      <p className="mt-6 t-caption">
        <Link href="/checkout" className="underline underline-offset-4">
          Back to checkout
        </Link>
      </p>
    </section>
  );
}
