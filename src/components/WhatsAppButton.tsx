"use client";

import type { ReactNode } from "react";

export function WhatsAppButton({
  href,
  className,
  children,
  ariaLabel,
  title,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  title?: string;
}) {
  function openWhatsApp() {
    const opened = window.open(href, "_blank", "noopener,noreferrer");
    if (opened) opened.opener = null;
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={title}
      onClick={openWhatsApp}
      className={["cursor-pointer", className].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}
