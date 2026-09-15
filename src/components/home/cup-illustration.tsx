import Image from "next/image";
import { cn } from "@/lib/cn";

type CupIllustrationProps = {
  bodyColor: string;
  sleeveColor: string;
  logoSrc?: string;
  className?: string;
};

/** Brand-coloured product stand-in from the approved landing prototype. */
export function CupIllustration({
  bodyColor,
  sleeveColor,
  logoSrc = "/assets/logo.png",
  className,
}: CupIllustrationProps) {
  return (
    <div className={cn("relative aspect-[26/34] w-full", className)}>
      <div className="absolute inset-x-[12%] top-0 h-[6%] rounded-t-[10px] rounded-b-[3px] bg-[#1a1211]" />
      <div className="absolute inset-x-[3%] top-[5%] h-[8%] rounded-sm bg-[#231918]" />
      <div
        className="absolute inset-x-[5%] bottom-0 top-[12%] rounded-b-[30%]"
        style={{
          background: `linear-gradient(90deg,rgba(0,0,0,.28),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 65%,rgba(0,0,0,.35)),${bodyColor}`,
          clipPath: "polygon(0 0,100% 0,86% 100%,14% 100%)",
        }}
      />
      <div
        className="absolute inset-x-[8%] top-[34%] flex h-[32%] items-center justify-center"
        style={{
          background: `linear-gradient(90deg,rgba(0,0,0,.12),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 65%,rgba(0,0,0,.18)),${sleeveColor}`,
          clipPath: "polygon(0 0,100% 0,95% 100%,5% 100%)",
        }}
      >
        <Image src={logoSrc} alt="" width={120} height={32} className="relative w-[62%] h-auto" />
      </div>
    </div>
  );
}
