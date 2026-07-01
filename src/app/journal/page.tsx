import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Reveal } from "@/components/Reveal";
import { getFreshArticlesFromStore } from "@/lib/store";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    pageKey: "journal",
    recordKey: "journal",
    path: "/journal",
    fallbackTitle: "The Journal — Style Notes & Inspiration",
    fallbackDescription:
      "Style notes, how-to-wear guides and atelier stories from MAZAL — quiet luxury, considered living.",
  });
}

export default async function JournalPage() {
  const articles = await getFreshArticlesFromStore();
  const [lead, ...rest] = articles;

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Journal" }]} />
      </Container>

      <Container className="py-10 text-center">
        <p className="eyebrow">The Journal</p>
        <h1 className="mt-3 font-serif text-4xl text-ink md:text-6xl">
          Notes on quiet living
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink-soft">
          Style notes, how-to-wear guides, and stories from the atelier.
        </p>
      </Container>

      {/* Lead article */}
      {lead && (
        <Container className="pb-12">
          <Reveal>
            <Link
              href={`/journal/${lead.slug}`}
              className="group grid items-center gap-8 md:grid-cols-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                <Image
                  src={lead.image}
                  alt={lead.title}
                  fill
                  priority
                  sizes="(min-width:768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div>
                <p className="eyebrow">{lead.category}</p>
                <h2 className="mt-3 font-serif text-3xl text-ink transition-colors group-hover:text-bronze md:text-4xl">
                  {lead.title}
                </h2>
                <p className="mt-4 text-ink-soft">{lead.excerpt}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-ink-soft">
                  {lead.readTime}
                </p>
              </div>
            </Link>
          </Reveal>
        </Container>
      )}

      {/* Grid */}
      <Container className="pb-24">
        <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((a, i) => (
            <Reveal key={a.slug} delay={(i % 3) * 80}>
              <Link href={`/journal/${a.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                  <Image
                    src={a.image}
                    alt={a.title}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="eyebrow mt-4">{a.category}</p>
                <h3 className="mt-2 font-serif text-2xl text-ink transition-colors group-hover:text-bronze">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft">{a.excerpt}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-ink-soft">
                  {a.readTime}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
