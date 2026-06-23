"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";

export function Accordion({
  items,
  defaultOpen = 0,
}: {
  items: { title: string; content: React.ReactNode }[];
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="divide-y divide-sand-deep/50 border-y border-sand-deep/50">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.title}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="text-sm font-medium uppercase tracking-[0.12em] text-ink">
                {it.title}
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className={clsx(
                  "shrink-0 text-bronze transition-transform duration-300",
                  isOpen && "rotate-45",
                )}
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
            <div
              className={clsx(
                "grid overflow-hidden transition-all duration-300",
                isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 text-sm leading-relaxed text-ink-soft">
                {it.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
