import { Container } from "./Container";
import { SITE } from "@/lib/site";
import type { SiteSettings } from "@/lib/store";

/** Trust-building store statistics strip. */
export function StoreStats({
  stats = SITE.stats,
}: {
  stats?: Readonly<SiteSettings["stats"]>;
}) {
  return (
    <section className="bg-ink text-cream-soft" aria-label="MAZAL by the numbers">
      <Container className="grid grid-cols-2 gap-8 py-14 text-center md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-serif text-4xl text-bronze md:text-5xl">{s.value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-cream-soft/70">
              {s.label}
            </p>
          </div>
        ))}
      </Container>
    </section>
  );
}
