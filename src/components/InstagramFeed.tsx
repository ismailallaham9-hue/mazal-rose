import Image from "next/image";
import { Container } from "./Container";
import { Reveal } from "./Reveal";
import { SITE } from "@/lib/site";
import type { SiteSettings } from "@/lib/store";

const POSTS = [
  {
    src: "/images/brand/hero.jpg",
    href: "https://www.instagram.com/p/DZr8uViDUnb/",
    alt: "MAZAL luxury abaya campaign post on Instagram",
  },
  {
    src: "/images/brand/collection-feature.jpg",
    href: "https://www.instagram.com/p/DZsCIEtjQlD/",
    alt: "MAZAL timeless abaya styling post on Instagram",
  },
  {
    src: "/images/brand/lookbook-1.jpg",
    href: "https://www.instagram.com/p/DZuV3KsNIWD/",
    alt: "MAZAL luxury fashion post on Instagram",
  },
  {
    src: "/images/brand/about-1.jpg",
    href: "https://www.instagram.com/p/DZ5HdDQDeMu/",
    alt: "MAZAL luxury abayas in the UAE Instagram post",
  },
  {
    src: "/images/brand/statement.jpg",
    href: "https://www.instagram.com/p/DZ5LLEPjXjg/",
    alt: "MAZAL abaya detail Instagram post",
  },
  {
    src: "/images/brand/wordmark.jpg",
    href: "https://www.instagram.com/p/DZmoQBvMJtx/",
    alt: "MAZAL abaya elegance Instagram post",
  },
];

export function InstagramFeed({
  social = SITE.social,
}: {
  social?: SiteSettings["social"];
}) {
  return (
    <section className="bg-cream" aria-label="Instagram">
      <Container className="py-16 md:py-20">
        <Reveal className="text-center">
          <p className="eyebrow">Fashion Inspiration</p>
          <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
            <a
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-bronze"
            >
              {social.instagramHandle} on Instagram
            </a>
          </h2>
          <p className="mt-3 text-ink-soft">
            Tag {social.instagramHandle} to be featured · #MAZALmeansStill
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {POSTS.map((post) => (
            <a
              key={post.href}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-sand"
              aria-label="View MAZAL post on Instagram"
            >
              <Image
                src={post.src}
                alt={post.alt}
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
