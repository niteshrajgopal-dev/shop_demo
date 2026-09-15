export function StorefrontUnavailable({ message }: { message: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-[var(--mx)] py-16">
      <div className="max-w-md text-center">
        <p className="t-overline text-muted">Storefront unavailable</p>
        <h1 className="t-display-m mt-4">This address is not configured.</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-mocha">{message}</p>
      </div>
    </div>
  );
}
