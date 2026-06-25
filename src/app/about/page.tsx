import type { Metadata } from "next";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StoreStats } from "@/components/StoreStats";
import { TrustBadges } from "@/components/TrustBadges";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    pageKey: "about",
    recordKey: "page:about",
    path: "/about",
    fallbackTitle: "Our Story — Crafted with Intention",
    fallbackDescription:
      "MAZAL means Still. Discover the story behind our quiet-luxury modest fashion house — crafted with intention, designed to endure.",
  });
}

const VALUES = [
  {
    title: "Crafted with Intention",
    text: "Every piece begins with a sketch and ends with a hand-finished seam. We design slowly, deliberately, and never to a trend.",
  },
  {
    title: "Designed to Endure",
    text: "We choose enduring fabrics and timeless cuts so each garment outlives the season — worn, loved, and passed on.",
  },
  {
    title: "Effortless Sophistication",
    text: "Quiet luxury for the modern Gulf wardrobe: fluid silhouettes, warm neutral tones, and an ease that needs no explanation.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Our Story" }]} />
      </Container>

      {/* Intro */}
      <Container className="grid items-center gap-12 py-12 md:grid-cols-2 md:py-20 lg:gap-20">
        <Reveal>
          <p className="eyebrow">Our Story</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink md:text-6xl">
            MAZAL means Still.
          </h1>
          <p className="mt-6 text-ink-soft">
            In a world that moves quickly, MAZAL was founded on stillness — the
            belief that true elegance is calm, unhurried, and made to last. We
            create modest fashion with the restraint of a maison and the warmth
            of home.
          </p>
          <p className="mt-4 text-ink-soft">
            From our atelier to your wardrobe, every abaya, kaftan, dress and
            accessory is crafted with intention — considered down to the last
            stitch, and designed to endure.
          </p>
          <div className="mt-8">
            <Button href="/shop">Explore the Collection</Button>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="relative aspect-[4/5] overflow-hidden bg-sand ring-1 ring-sand-deep/40">
            <Image
              src="/images/brand/about-1.jpg"
              alt="Inside the MAZAL boutique."
              fill
              priority
              sizes="(min-width:768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </Container>

      {/* Values */}
      <section className="bg-sand">
        <Container className="py-20">
          <div className="grid gap-10 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 90}>
                <div>
                  <span className="font-serif text-3xl text-bronze">
                    0{i + 1}
                  </span>
                  <h2 className="mt-3 font-serif text-2xl text-ink">{v.title}</h2>
                  <p className="mt-3 text-ink-soft">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Image break */}
      <section className="relative h-[50vh] min-h-[340px] w-full overflow-hidden">
        <Image
          src="/images/brand/statement.jpg"
          alt="Still Elegant — MAZAL."
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      {/* Craft */}
      <Container className="grid items-center gap-12 py-20 md:grid-cols-2 lg:gap-20">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden bg-sand ring-1 ring-sand-deep/40">
            <Image
              src="/images/brand/about-2.jpg"
              alt="MAZAL atelier detail."
              fill
              sizes="(min-width:768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <p className="eyebrow">The Atelier</p>
          <h2 className="mt-4 font-serif text-4xl text-ink md:text-5xl">
            A house built on craft
          </h2>
          <p className="mt-6 text-ink-soft">
            We work with a small circle of skilled artisans across the region,
            choosing premium crêpes, silks and modal blends that drape
            beautifully and wear gently over time.
          </p>
          <p className="mt-4 text-ink-soft">
            Limited runs mean each piece feels considered, never mass-produced —
            quiet luxury you can feel in the hand.
          </p>
          <div className="mt-8">
            <Button href="/contact" variant="outline">
              Speak with our team
            </Button>
          </div>
        </Reveal>
      </Container>

      <StoreStats />
      <TrustBadges />
    </>
  );
}
