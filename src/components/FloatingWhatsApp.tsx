"use client";

import { useState } from "react";
import { SITE, whatsappLink } from "@/lib/site";

/**
 * Site-wide floating WhatsApp launcher with quick-reply options
 * (general help, styling consultation, order support).
 */
export function FloatingWhatsApp() {
  const [open, setOpen] = useState(false);

  const options = [
    { label: "General enquiry", msg: SITE.whatsapp.defaultMessage },
    { label: "Personal styling", msg: SITE.whatsapp.stylingMessage },
    { label: "Order support", msg: SITE.whatsapp.orderSupportMessage },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-64 overflow-hidden rounded-2xl bg-cream-soft shadow-2xl ring-1 ring-sand-deep/50">
          <div className="bg-[#1f8a5b] px-4 py-3 text-cream-soft">
            <p className="font-serif text-lg leading-tight">Chat with MAZAL</p>
            <p className="text-xs text-cream-soft/80">Typically replies in minutes</p>
          </div>
          <div className="flex flex-col p-2">
            {options.map((o) => (
              <a
                key={o.label}
                href={whatsappLink(o.msg)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-3 py-2.5 text-sm text-ink transition-colors hover:bg-sand/60"
              >
                {o.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open WhatsApp chat"
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M.06 24l1.68-6.13A11.86 11.86 0 0 1 .16 11.9C.16 5.33 5.5 0 12.06 0a11.82 11.82 0 0 1 8.41 3.49 11.82 11.82 0 0 1 3.48 8.42c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 0 1-5.69-1.45L.06 24zM6.6 20.13c1.68.99 3.28 1.59 5.45 1.59 5.45 0 9.89-4.43 9.89-9.88a9.82 9.82 0 0 0-2.9-6.99 9.82 9.82 0 0 0-6.98-2.9c-5.46 0-9.9 4.44-9.9 9.89 0 2.27.6 3.86 1.65 5.55l-.99 3.62 3.78-.99zM17.5 14.3c-.07-.12-.27-.2-.56-.34-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.91-2.19-.24-.57-.48-.49-.66-.5l-.56-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42z" />
        </svg>
      </button>
    </div>
  );
}
