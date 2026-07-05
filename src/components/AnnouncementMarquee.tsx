import { SITE } from "@/lib/site";

const DEFAULT_MESSAGES: string[] = [
  "MAZAL 2026 - the new collection has arrived",
  `Complimentary express delivery over ${SITE.currency} ${SITE.freeShippingThreshold}`,
  "Private atelier appointments now open in Dubai",
  "Considered modest pieces, crafted to endure",
  "Worldwide shipping to 60+ countries",
];

function normalizeMessage(message: string) {
  return message.replace(
    /Complimentary express delivery over AED 50000/g,
    `Complimentary express delivery over ${SITE.currency} ${SITE.freeShippingThreshold}`,
  );
}

function Sequence({
  messages,
  ariaHidden = false,
}: {
  messages: string[];
  ariaHidden?: boolean;
}) {
  return (
    <span
      className="flex shrink-0 items-center"
      aria-hidden={ariaHidden || undefined}
    >
      {messages.map((msg, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 py-2 text-[0.66rem] uppercase tracking-[0.22em]">
            {msg}
          </span>
          <span
            aria-hidden
            className="text-bronze/70"
            style={{ fontSize: "0.5rem" }}
          >
            *
          </span>
        </span>
      ))}
    </span>
  );
}

export function AnnouncementMarquee({
  messages = DEFAULT_MESSAGES,
}: {
  messages?: string[];
}) {
  const safeMessages = (messages.length ? messages : DEFAULT_MESSAGES).map(normalizeMessage);

  return (
    <div
      className="mz-marquee overflow-hidden border-b border-sand-deep/40 bg-cream-soft text-ink"
      role="region"
      aria-label="Announcements"
    >
      <div className="mz-marquee-track">
        <Sequence messages={safeMessages} />
        <Sequence messages={safeMessages} ariaHidden />
      </div>
    </div>
  );
}
