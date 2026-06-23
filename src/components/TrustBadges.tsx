import { Container } from "./Container";

const ITEMS = [
  {
    title: "Secure Payment",
    desc: "Encrypted checkout · Tabby & cards",
    icon: (
      <path
        d="M6 10V8a6 6 0 0 1 12 0v2M5 10h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9Z"
        strokeWidth="1.4"
      />
    ),
  },
  {
    title: "Fast Delivery",
    desc: "Express across the GCC",
    icon: (
      <path
        d="M3 7h11v8H3V7Zm11 3h4l3 3v2h-7v-5ZM7 18.5A1.5 1.5 0 1 0 7 15.5a1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        strokeWidth="1.4"
      />
    ),
  },
  {
    title: "Easy Returns",
    desc: "14-day hassle-free returns",
    icon: (
      <path
        d="M4 9h11a4 4 0 0 1 0 8H9M4 9l3-3M4 9l3 3"
        strokeWidth="1.4"
      />
    ),
  },
  {
    title: "Satisfaction Guarantee",
    desc: "Loved, or your money back",
    icon: (
      <path
        d="M12 3l2.5 2 3.2-.4.9 3.1 2.4 2.1-1.6 2.8.5 3.2-3.1 1-1.8 2.7L12 21l-3-.6-1.8-2.7-3.1-1 .5-3.2-1.6-2.8L5.4 7.7l.9-3.1L9.5 5 12 3Z"
        strokeWidth="1.3"
      />
    ),
  },
];

export function TrustBadges({ bordered = true }: { bordered?: boolean }) {
  return (
    <section
      className={bordered ? "border-y border-sand-deep/50 bg-cream-soft/60" : ""}
      aria-label="Why shop with MAZAL"
    >
      <Container className="grid grid-cols-2 gap-6 py-8 md:grid-cols-4 md:py-10">
        {ITEMS.map((it) => (
          <div key={it.title} className="flex items-center gap-3">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="shrink-0 text-bronze"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {it.icon}
            </svg>
            <div>
              <p className="text-sm font-medium text-ink">{it.title}</p>
              <p className="text-xs text-ink-soft">{it.desc}</p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
