import Image from "next/image";
import { Container } from "./Container";
import { Reveal } from "./Reveal";
import { SITE } from "@/lib/site";

// Reuse brand campaign imagery as the IG grid. Replace with a real feed later.
const POSTS = [
  "/images/brand/hero.jpg",
  "/images/brand/collection-feature.jpg",
  "/images/brand/lookbook-1.jpg",
  "/images/brand/about-1.jpg",
  "/images/brand/statement.jpg",
  "/images/brand/wordmark.jpg",
];

export function InstagramFeed() {
  return (
    <section className="bg-cream" aria-label="Instagram">
      <Container className="py-16 md:py-20">
        <Reveal className="text-center">
          <p className="eyebrow">Fashion Inspiration</p>
          <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
            {SITE.social.instagramHandle} on Instagram
          </h2>
          <p className="mt-3 text-ink-soft">
            Tag {SITE.social.instagramHandle} to be featured · #MAZALmeansStill
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {POSTS.map((src, i) => (
            <a
              key={src}
              href={SITE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-sand"
              aria-label="View on Instagram"
            >
              <Image
                src={src}
                alt="MAZAL on Instagram"
                fill
                sizes="(min-width:1024px) 16vw, (min-width:640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-cream-soft opacity-0 transition-all duration-300 group-hover:bg-ink/30 group-hover:opacity-100">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
