import type { Breakpoint } from "@/components/hero/useBreakpoint";

export type HeroLayout = {
  navPad: string;
  navLinks: "flex" | "none";
  textPad: string;
  textJustify: "center" | "flex-start";
  textMax: string;
  h1: string;
  bouquetZ: number;
  bouquetRight: string;
  bouquetTop: string;
  bouquetW: string;
  capRight: string;
  capTop: string;
  scrollRight: string;
  scrollTop: string;
  scrollDisplay: "flex" | "none";
  bottomLeft: string;
  bottomBottom: string;
  sigLeft: string;
  colPad: string;
};

/** Replicates `layout(bp)` from handoff/Florea Hero.dc.html exactly. */
export function heroLayout(bp: Breakpoint): HeroLayout {
  const d: HeroLayout = {
    navPad: "clamp(22px,2.4vw,34px) clamp(32px,5.5vw,88px)",
    navLinks: "flex",
    textPad: "0 clamp(32px,5.5vw,88px)",
    textJustify: "center",
    textMax: "46%",
    h1: "clamp(72px,8.6vw,150px)",
    bouquetZ: 3,
    bouquetRight: "9%",
    bouquetTop: "9%",
    bouquetW: "clamp(320px,45vw,720px)",
    capRight: "clamp(32px,5.5vw,88px)",
    capTop: "58%",
    scrollRight: "clamp(32px,5.5vw,88px)",
    scrollTop: "14%",
    scrollDisplay: "flex",
    bottomLeft: "clamp(32px,5.5vw,88px)",
    bottomBottom: "9%",
    sigLeft: "52%",
    colPad: "clamp(80px,10vw,160px) clamp(32px,5.5vw,88px)",
  };

  if (bp === "tablet") {
    Object.assign(d, {
      textMax: "52%",
      h1: "clamp(60px,9vw,112px)",
      bouquetRight: "4%",
      bouquetTop: "26%",
      bouquetW: "min(46vw,520px)",
      capTop: "74%",
      scrollTop: "12%",
    });
  }

  if (bp === "mobile") {
    Object.assign(d, {
      navPad: "20px 22px",
      navLinks: "none",
      textPad: "0 22px",
      textJustify: "flex-start",
      textMax: "100%",
      h1: "clamp(54px,15.5vw,88px)",
      bouquetZ: 2,
      bouquetRight: "-22%",
      bouquetTop: "44%",
      bouquetW: "min(115vw,560px)",
      capRight: "22px",
      capTop: "auto",
      scrollDisplay: "none",
      bottomLeft: "22px",
      bottomBottom: "30px",
      sigLeft: "58%",
      colPad: "72px 22px",
    });
  }

  if (bp === "mobile") {
    d.textPad = "17vh 22px 0";
  }

  return d;
}
