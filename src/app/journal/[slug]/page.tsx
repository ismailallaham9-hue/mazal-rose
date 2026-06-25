import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductRail } from "@/components/ProductRail";
import { SITE } from "@/lib/site";
import { getStoreData } from "@/lib/store";

export async function generateStaticParams() {
  const { articles } = await getStoreData();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { articles } = await getStoreData();
  const article = articles.find((a) => a.slug === slug);
  if (!article) return { title: "Not found" };
  const title = article.seoTitle?.trim() ? article.seoTitle : article.title;
  const description = article.seoDescription?.trim()
    ? article.seoDescription
    : article.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/journal/${article.slug}` },
    openGraph: {
      title: `${article.title} - MAZAL Journal`,
      description,
      images: [article.image],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} - MAZAL Journal`,
      description,
      images: [article.image],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { articles, products } = await getStoreData();
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const related = (article.relatedSlugs ?? [])
    .map((s) => products.find((p) => p.slug === s || p.id === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const absImage = /^https?:\/\//i.test(article.image)
    ? article.image
    : `${SITE.url.replace(/\/$/, "")}${article.image.startsWith("/") ? "" : "/"}${article.image}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: [absImage],
    datePublished: article.date,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Journal", item: `${SITE.url}/journal` },
      { "@type": "ListItem", position: 3, name: article.title, item: `${SITE.url}/journal/${article.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Journal", href: "/journal" },
            { label: article.title },
          ]}
        />
      </Container>

      <article>
        <Container className="py-10 text-center">
          <p className="eyebrow">{article.category}</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">
            {article.title}
          </h1>
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-ink-soft">
            {new Date(article.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            - {article.readTime}
          </p>
        </Container>

        <div className="relative mx-auto aspect-[16/9] w-full max-w-5xl overflow-hidden bg-sand">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="(min-width:1024px) 1024px, 100vw"
            className="object-cover"
          />
        </div>

        <Container className="py-14">
          <div className="mx-auto max-w-2xl">
            {article.body.map((block, i) =>
              block.type === "h2" ? (
                <h2 key={i} className="mt-10 font-serif text-3xl text-ink">
                  {block.text}
                </h2>
              ) : (
                <p key={i} className="mt-5 text-lg leading-relaxed text-ink-soft">
                  {block.text}
                </p>
              ),
            )}
          </div>
        </Container>
      </article>

      {related.length > 0 && (
        <ProductRail
          eyebrow="Shop the story"
          title="Featured in this article"
          products={related}
          tone="sand"
        />
      )}
    </>
  );
}
