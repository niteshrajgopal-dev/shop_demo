import { Suspense } from "react";

import { Mark } from "@/components/brand/mark";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <section className="wrap pt-[clamp(32px,5vw,64px)] pb-[clamp(48px,7vw,88px)]">
      <header className="mb-8 flex flex-col gap-4">
        <span className="t-overline inline-flex items-center gap-2.5 tracking-[0.22em] text-muted">
          <Mark className="w-[0.9em]" />
          Password recovery
        </span>
        <h1 className="t-display-m">Choose a new password.</h1>
      </header>

      <Card className="max-w-lg">
        <Suspense fallback={<p className="text-muted">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </Card>
    </section>
  );
}
