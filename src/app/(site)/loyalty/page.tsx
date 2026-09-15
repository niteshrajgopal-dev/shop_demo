"use client";

import { useState } from "react";
import { Bean, BeanDivider } from "@/components/brand/bean";
import { PageLoadState } from "@/components/ui/page-load-state";
import { HospitalityPageIntro } from "@/components/hospitality/page-intro";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink, TravelArrow } from "@/components/ui/button";
import { Card, EmptyState, Notice } from "@/components/ui/card";
import { TextField } from "@/components/ui/field";
import { StampCard } from "@/components/brand/stamp-card";
import { useToast } from "@/components/ui/toast";
import { REWARDS, STAMPS_PER_CARD, useLoyalty } from "@/lib/stores/loyalty";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/cn";

export default function LoyaltyPage() {
  const { toast } = useToast();
  const hydrated = useHydrated();

  const member = useLoyalty((state) => state.member);
  const stamps = useLoyalty((state) => state.stamps);
  const rewardsAvailable = useLoyalty((state) => state.rewardsAvailable);
  const lifetimeStamps = useLoyalty((state) => state.lifetimeStamps);
  const history = useLoyalty((state) => state.history);
  const join = useLoyalty((state) => state.join);
  const leave = useLoyalty((state) => state.leave);
  const redeem = useLoyalty((state) => state.redeem);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();

  const remaining = STAMPS_PER_CARD - stamps;

  const onJoin = (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setNameError("We need a name for the card.");
      return;
    }
    setNameError(undefined);
    join(name);
    toast({ title: `Welcome, ${name.trim().split(" ")[0]}`, body: "Your bean card is open." });
    setName("");
  };

  return (
    <>
      <HospitalityPageIntro
        kicker="Bean card"
        title="The bean card."
        lead="Eight stamps, one free coffee. A stamp for every drink and every bag of beans, in café or online. No app, no points that expire, nothing to scan."
      />

      <section className="wrap pb-[clamp(48px,7vw,88px)]">
        {!hydrated ? (
          <PageLoadState label="Opening your card…" />
        ) : !member ? (
          /* ---------- NOT A MEMBER ---------- */
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <Card className="flex flex-col gap-7 p-7 sm:p-9">
              <div className="flex flex-col gap-2">
                <h2 className="t-h1">Start a card</h2>
                <p className="text-[14.5px] leading-relaxed text-muted">
                  Just a name. The card lives on this device and syncs to your order history.
                </p>
              </div>

              <form onSubmit={onJoin} noValidate className="flex flex-col gap-4">
                <TextField
                  label="Your name"
                  value={name}
                  error={nameError}
                  autoComplete="given-name"
                  placeholder="The name on the cup"
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameError(undefined);
                  }}
                />
                <Button type="submit" size="lg" block>
                  Open my bean card
                </Button>
              </form>

              <BeanDivider />

              <div className="flex flex-col gap-4">
                <span className="t-label">What a full card looks like</span>
                <StampCard stamps={5} size="md" />
                <p className="t-caption">Five of eight — three more cups to a free coffee.</p>
              </div>
            </Card>

            <div className="flex flex-col gap-5">
              {REWARDS.map((reward) => (
                <Card key={reward.id} className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-espresso">
                    <Bean onDark className="w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15.5px] font-semibold">{reward.name}</h3>
                    <p className="t-caption mt-1">{reward.detail}</p>
                  </div>
                  <Badge tone="outline">
                    {reward.cost} card{reward.cost > 1 ? "s" : ""}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* ---------- MEMBER ---------- */
          <div className="flex flex-col gap-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
              <div className="flex flex-col gap-7 rounded-lg border border-espresso bg-espresso p-7 text-cream sm:p-9">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="t-overline text-latte">Member</span>
                    <p className="mt-2 font-serif text-[28px] text-cream">{member}</p>
                  </div>
                  {rewardsAvailable > 0 ? (
                    <Badge tone="latte">
                      {rewardsAvailable} reward{rewardsAvailable > 1 ? "s" : ""} ready
                    </Badge>
                  ) : null}
                </div>

                <div className="flex flex-col gap-4">
                  <span className="t-label text-cream/55">
                    Card {stamps} of {STAMPS_PER_CARD}
                  </span>
                  <StampCard stamps={stamps} size="lg" />
                  <p className="text-[14.5px] text-cream/70">
                    {remaining === STAMPS_PER_CARD
                      ? "Fresh card. Your next drink starts it."
                      : remaining === 0
                        ? "Card complete — your next coffee is on us."
                        : `${remaining} more cup${remaining > 1 ? "s" : ""} to a free coffee.`}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-6 border-t border-[var(--border-on-dark)] pt-6 sm:grid-cols-3">
                  <div>
                    <dt className="t-label text-cream/50">Lifetime stamps</dt>
                    <dd className="mt-2 font-mono text-[20px] text-cream">{lifetimeStamps}</dd>
                  </div>
                  <div>
                    <dt className="t-label text-cream/50">Cards filled</dt>
                    <dd className="mt-2 font-mono text-[20px] text-cream">
                      {Math.floor(lifetimeStamps / STAMPS_PER_CARD)}
                    </dd>
                  </div>
                  <div>
                    <dt className="t-label text-cream/50">In wallet</dt>
                    <dd className="mt-2 font-mono text-[20px] text-cream">{rewardsAvailable}</dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-3">
                  <ButtonLink href="/order" variant="inverse" size="md" className="group">
                    Order and earn
                    <TravelArrow className="text-latte" />
                  </ButtonLink>
                  <Button
                    variant="inverse"
                    size="md"
                    onClick={() => {
                      leave();
                      toast({ title: "Card closed", body: "Stamps and history cleared." });
                    }}
                  >
                    Close card
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h2 className="t-label">Wallet</h2>
                {REWARDS.map((reward) => {
                  const affordable = rewardsAvailable >= reward.cost;
                  return (
                    <Card
                      key={reward.id}
                      className={cn(
                        "flex flex-col gap-4 transition-colors duration-fast ease-brand",
                        affordable ? "border-latte" : "",
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={cn(
                            "grid h-11 w-11 shrink-0 place-items-center rounded-sm",
                            affordable ? "bg-espresso" : "bg-latte-50",
                          )}
                        >
                          <Bean onDark={affordable} className="w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[15.5px] font-semibold">{reward.name}</h3>
                          <p className="t-caption mt-1">{reward.detail}</p>
                        </div>
                        <Badge tone={affordable ? "latte" : "outline"}>
                          {reward.cost} card{reward.cost > 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant={affordable ? "primary" : "secondary"}
                        disabled={!affordable}
                        onClick={() => {
                          const result = redeem(reward);
                          toast({
                            title: result.ok ? "Redeemed" : "Not yet",
                            body: result.message,
                            tone: result.ok ? "default" : "error",
                          });
                        }}
                      >
                        {affordable ? "Redeem" : `Needs ${reward.cost - rewardsAvailable} more`}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="t-label mb-4">Activity</h2>
              {history.length === 0 ? (
                <EmptyState
                  title="Nothing on the card yet"
                  body="Your first order will show up here with the stamps it earned."
                  action={
                    <ButtonLink href="/order" size="sm">
                      Order a coffee
                    </ButtonLink>
                  }
                />
              ) : (
                <ul className="flex flex-col border-t border-line">
                  {history.map((event) => (
                    <li
                      key={event.id}
                      className="flex items-center gap-4 border-b border-line py-3.5"
                    >
                      <Bean className={cn("w-3 shrink-0", event.kind === "redeemed" && "opacity-40")} />
                      <span className="min-w-0 flex-1 text-[14px]">{event.label}</span>
                      <span className="shrink-0 font-mono text-[12px] text-muted">
                        {new Date(event.at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span
                        className={cn(
                          "w-14 shrink-0 text-right font-mono text-[12px]",
                          event.kind === "earned" ? "text-success" : "text-muted",
                        )}
                      >
                        {event.stamps > 0 ? `+${event.stamps}` : event.stamps || "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="border-t border-line">
        <div className="wrap py-[clamp(40px,6vw,72px)]">
          <Notice tone="info" title="How stamps work.">
            One stamp per drink and per bag of beans, whether you order in café, ahead, or
            online. Stamps never expire, and rewards sit in your wallet until you want them.
          </Notice>
        </div>
      </section>
    </>
  );
}
