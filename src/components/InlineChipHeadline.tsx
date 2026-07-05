import Link from "next/link";
import { Container } from "./Container";
import { Reveal } from "./Reveal";

/**
 * Signature headline treatment: a large serif sentence with small rounded
 * image "chips" embedded inline, sized to the cap height (see .inline-chip
 * in globals.css). The chips are decorative; the sentence reads fully on
 * its own for screen readers and when images are unavailable.
 */
export function InlineChipHeadline() {
  return (
    <section className="bg-cream-soft">
      <Container className="py-20 md:py-28">
        <Reveal>
          <h2 className="mx-auto max-w-4xl text-center font-serif text-4xl leading-[1.25] text-ink sm:text-5xl md:text-6xl md:leading-[1.2]">
            Modesty isn&rsquo;t what you hide
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand/about-2.jpg"
              alt=""
              aria-hidden
              className="inline-chip"
            />
            it&rsquo;s how you carry
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand/about-1.jpg"
              alt=""
              aria-hidden
              className="inline-chip"
            />
            yourself.
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-xl text-center text-ink-soft">
            Fashion is a quiet language. Discover our {" "}
            <Link href="/luxury-abaya" className="link-underline text-bronze hover:text-bronze-deep">
              Luxury Abaya
            </Link>{" "}
            edit, shaped for calm, care, and the story we tell before we speak.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
