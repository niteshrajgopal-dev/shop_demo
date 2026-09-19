"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import type { Bouquet } from "@/components/florea/data";
import { CloseIcon } from "@/components/florea/icons";

type FloreaBouquetDialogProps = {
  bouquet: Bouquet;
  onClose: () => void;
};

export function FloreaBouquetDialog({ bouquet, onClose }: FloreaBouquetDialogProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeBtnRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const onOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-auto bg-[rgba(37,36,31,0.35)] p-6"
      onClick={onOverlayClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="florea-dialog-title"
        className="relative grid w-full max-w-[920px] border border-[#E6E1D6] bg-[#FFFDF8] max-[900px]:grid-cols-1 min-[901px]:grid-cols-2"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="relative h-[560px] max-[900px]:h-[320px]"
          style={{ backgroundColor: bouquet.bg }}
        >
          <Image
            src={bouquet.img}
            alt={bouquet.alt}
            fill
            sizes="(max-width: 900px) 100vw, 460px"
            className="object-contain p-8"
          />
        </div>
        <div className="flex flex-col justify-center px-11 py-12 max-[900px]:px-8 max-[900px]:py-10">
          <p className="m-0 mb-[18px] text-[11px] font-medium tracking-[0.22em] text-[#777269] uppercase">
            {bouquet.label}
          </p>
          <h3
            id="florea-dialog-title"
            className="m-0 mb-4 font-[family-name:var(--font-instrument-serif)] text-[44px] leading-[1.02] font-normal tracking-[-0.02em] text-[#25241F]"
          >
            {bouquet.name}
          </h3>
          <p className="m-0 mb-5 text-[14px] text-[#777269]">{bouquet.flowers}</p>
          <p className="m-0 mb-8 text-[16px] leading-[1.7] text-[#4E4B44]">{bouquet.desc}</p>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 self-start rounded-[3px] border-0 bg-[#525F47] px-[22px] py-3.5 text-[14px] font-medium text-[#FFFDF8] transition-colors duration-[250ms] hover:bg-[#3E4C33]"
          >
            Back to the collection
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#D8D3C8] bg-[#FFFDF8] text-[#25241F]"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
