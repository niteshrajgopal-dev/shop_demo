"use client";

import Image from "next/image";
import Link from "next/link";

import { useOptionalStorefrontShell } from "@/lib/stores/storefront-shell";

const LOGO_INTRINSIC = { width: 1536, height: 409 };
const MIN_WORDMARK_WIDTH = 96;
const FALLBACK_LOGO_SRC = "/brand/flower-mark.svg";

export function Wordmark({
  height = 26,
  className = "",
  priority = false,
  src,
  alt,
}: {
  height?: number;
  className?: string;
  priority?: boolean;
  src?: string;
  alt?: string;
}) {
  const shell = useOptionalStorefrontShell();
  const logoSrc = src ?? shell?.logoSrc ?? FALLBACK_LOGO_SRC;
  const logoAlt = alt ?? shell?.logoAlt ?? "Storefront home";
  const width = Math.round((LOGO_INTRINSIC.width / LOGO_INTRINSIC.height) * height);

  if (logoSrc.endsWith(".svg")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoSrc}
        alt={logoAlt}
        className={className}
        style={{ height, width: "auto" }}
      />
    );
  }

  if (width < MIN_WORDMARK_WIDTH) {
    throw new Error(
      `Wordmark rendered at ${width}px, below the ${MIN_WORDMARK_WIDTH}px minimum. Use the flower mark instead.`,
    );
  }

  return (
    <Image
      src={logoSrc}
      alt={logoAlt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ height, width: "auto" }}
      sizes={`${width}px`}
    />
  );
}

export function LogoLink({
  height = 26,
  className = "",
  priority = false,
}: {
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const shell = useOptionalStorefrontShell();

  return (
    <Link
      href="/"
      aria-label={shell?.logoAlt ?? "Storefront home"}
      className={`inline-flex items-center no-tap-highlight ${className}`}
    >
      <Wordmark height={height} priority={priority} />
    </Link>
  );
}
