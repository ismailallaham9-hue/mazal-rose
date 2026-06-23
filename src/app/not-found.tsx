import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-4 font-serif text-6xl text-ink md:text-8xl">
        Still lost.
      </h1>
      <p className="mt-5 max-w-md text-ink-soft">
        The page you&rsquo;re looking for has drifted away. Let&rsquo;s find you
        something beautiful instead.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Link
          href="/shop"
          className="bg-bronze px-8 py-4 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
        >
          Shop the Collection
        </Link>
        <Link
          href="/"
          className="border border-ink/25 px-8 py-4 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:border-bronze hover:text-bronze"
        >
          Back to Home
        </Link>
      </div>
    </Container>
  );
}
