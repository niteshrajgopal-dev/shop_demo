import type { Metadata } from "next";
import { Mark } from "@/components/brand/mark";
import { OrderFlow } from "@/components/order/order-flow";
import { getServerStorefrontLocale } from "@/lib/locale/locale.server";
import { loadPublishedMenu } from "@/lib/qos/menu.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order",
  description: "Order ahead from the published branch menu.",
};

export default async function OrderPage() {
  const locale = await getServerStorefrontLocale();
  const menuResult = await loadPublishedMenu(locale);

  return (
    <section className="wrap pt-[clamp(32px,5vw,64px)] pb-[clamp(48px,7vw,88px)]">
      <header className="mb-8 flex flex-col gap-4">
        <span className="t-overline inline-flex items-center gap-2.5 tracking-[0.22em] text-muted">
          <Mark className="w-[0.9em]" />
          Order ahead
        </span>
        <h1 className="t-display-l max-w-[20ch]">Three steps, about a minute.</h1>
        <p className="max-w-[54ch] text-[clamp(16px,2vw,18px)] leading-[1.55] text-mocha">
          Choose a shop, pick your stems, and checkout when you are ready.
        </p>
      </header>

      <OrderFlow menuResult={menuResult} />
    </section>
  );
}
