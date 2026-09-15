import { cn } from "@/lib/cn";

type HospitalityPageIntroProps = {
  kicker: string;
  title: string;
  lead?: string;
  className?: string;
  children?: React.ReactNode;
};

export function HospitalityPageIntro({
  kicker,
  title,
  lead,
  className,
  children,
}: HospitalityPageIntroProps) {
  return (
    <section
      className={cn(
        "px-[var(--mx)] pt-[clamp(32px,5vw,56px)] pb-[clamp(24px,4vw,40px)]",
        className,
      )}
    >
      <div className="mx-auto max-w-[1160px]">
        <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-latte">
          <span className="block h-px w-6 bg-latte" aria-hidden />
          {kicker}
        </div>
        <h1 className="t-display-l mt-5 max-w-[20ch] text-balance">{title}</h1>
        {lead ? (
          <p className="mt-5 max-w-[56ch] text-pretty text-[clamp(16px,1.3vw,19px)] leading-[1.55] text-mocha">
            {lead}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
