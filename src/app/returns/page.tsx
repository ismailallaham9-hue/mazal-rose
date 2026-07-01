import type { Metadata } from "next";
import Link from "next/link";
import { Accordion } from "@/components/Accordion";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { whatsappLink } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { getFreshStoreData } from "@/lib/store";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    pageKey: "returns",
    recordKey: "page:returns",
    path: "/returns",
    fallbackTitle: "Returns & Exchanges",
    fallbackDescription:
      "Read MAZAL's returns and exchanges policy, including eligibility, timelines, refunds, exchanges, and how to contact client care.",
  });
}

const QUICK_POINTS = [
  {
    title: "14-day window",
    text: "Return or exchange requests should be made within 14 days of delivery.",
  },
  {
    title: "Original condition",
    text: "Items must be unworn, unused, unwashed, and returned with tags and original packaging.",
  },
  {
    title: "Client care support",
    text: "Start every return or exchange through WhatsApp so our team can guide the next step.",
  },
];

const STEPS = [
  "Contact MAZAL Client Care on WhatsApp with your order number and the item you want to return or exchange.",
  "Our team will confirm eligibility and share the return instructions.",
  "Pack the item securely with all tags, accessories, packaging, and proof of purchase.",
  "Once received and inspected, we will confirm the refund, exchange, or store-credit option.",
];

const FINAL_SALE = [
  "Items marked final sale or clearance",
  "Personalised, altered, or made-to-order pieces",
  "Worn, washed, perfumed, stained, or damaged items",
  "Accessories or hygiene-sensitive items where the original seal or packaging has been opened",
];

export default async function ReturnsPage() {
  const { settings } = await getFreshStoreData();
  const whatsapp = settings.whatsapp;

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Returns & Exchanges" },
          ]}
        />
      </Container>

      <Container className="grid gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-16">
        <div>
          <p className="eyebrow">Client Care</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink md:text-6xl">
            Returns & Exchanges
          </h1>
          <p className="mt-6 max-w-2xl text-ink-soft">
            We want every MAZAL piece to feel considered from the moment it
            arrives. If something is not right, our client care team will help
            you with a return or exchange request clearly and calmly.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink(whatsapp.orderSupportMessage, whatsapp.number)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-bronze px-6 py-3 font-sans text-xs font-medium uppercase tracking-[0.18em] text-cream-soft shadow-sm transition-all duration-300 hover:bg-bronze-deep hover:shadow-md"
            >
              Start on WhatsApp
            </a>
            <Button href="/contact" variant="outline">
              Contact Client Care
            </Button>
          </div>
        </div>

        <div className="border border-sand-deep/60 bg-cream-soft p-6">
          <p className="font-serif text-2xl text-ink">Policy at a glance</p>
          <div className="mt-5 space-y-5">
            {QUICK_POINTS.map((point) => (
              <div key={point.title} className="border-t border-sand-deep/50 pt-4">
                <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-ink">
                  {point.title}
                </h2>
                <p className="mt-2 text-sm text-ink-soft">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <section className="bg-sand">
        <Container className="grid gap-10 py-16 md:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">How It Works</p>
            <h2 className="mt-3 font-serif text-4xl text-ink">
              Simple steps for support
            </h2>
          </div>
          <ol className="space-y-5">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-bronze/60 font-serif text-lg text-bronze">
                  {index + 1}
                </span>
                <p className="pt-1 text-ink-soft">{step}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <Container className="grid gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="eyebrow">Eligibility</p>
          <h2 className="mt-3 font-serif text-4xl text-ink">
            What can be returned
          </h2>
          <p className="mt-5 text-ink-soft">
            Eligible items can be returned or exchanged when they are in their
            original condition. Please keep all tags, packaging, and order
            details until you are sure the piece is right for you.
          </p>
          <p className="mt-4 text-ink-soft">
            Delivery fees, duties, customs charges, and return shipping costs
            may be non-refundable unless the item arrived damaged, defective, or
            incorrect.
          </p>
        </div>

        <div className="border border-sand-deep/60 p-6">
          <h3 className="font-serif text-2xl text-ink">Final sale exceptions</h3>
          <ul className="mt-5 space-y-3 text-sm text-ink-soft">
            {FINAL_SALE.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-bronze" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <Container className="pb-24">
        <h2 className="mb-6 font-serif text-3xl text-ink">Policy details</h2>
        <Accordion
          defaultOpen={0}
          items={[
            {
              title: "Refund timing",
              content: (
                <p>
                  After your returned item is received and approved, refunds are
                  processed to the original payment method. Bank and payment
                  provider timing can vary, but most refunds appear within 5-7
                  working days after processing.
                </p>
              ),
            },
            {
              title: "Exchanges",
              content: (
                <p>
                  Exchanges depend on availability. If your preferred size,
                  colour, or style is available, our team will reserve it after
                  your return request is approved. If it is unavailable, we can
                  help with an alternative or refund.
                </p>
              ),
            },
            {
              title: "Damaged or incorrect items",
              content: (
                <p>
                  If your order arrives damaged, defective, or incorrect, please
                  contact us within 48 hours of delivery with photos of the item,
                  packaging, and order number so we can resolve it quickly.
                </p>
              ),
            },
            {
              title: "International orders",
              content: (
                <p>
                  International customers are responsible for any duties, taxes,
                  customs fees, or return shipping charges unless the item is
                  confirmed to be damaged, defective, or incorrect.
                </p>
              ),
            },
          ]}
        />

        <div className="mt-12 border-t border-sand-deep/60 pt-8 text-sm text-ink-soft">
          <p>
            Need help before requesting a return? Message us on{" "}
            <Link
              href={whatsappLink(whatsapp.orderSupportMessage, whatsapp.number)}
              className="link-underline text-bronze hover:text-bronze-deep"
            >
              WhatsApp
            </Link>{" "}
            or visit{" "}
            <Link href="/contact" className="link-underline text-bronze hover:text-bronze-deep">
              Client Care
            </Link>
            .
          </p>
        </div>
      </Container>
    </>
  );
}
