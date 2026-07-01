import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { pageMetadata } from "@/lib/seo";
import { getFreshStoreData } from "@/lib/store";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    pageKey: "terms",
    recordKey: "page:terms",
    path: "/terms",
    fallbackTitle: "Terms & Conditions",
    fallbackDescription:
      "Read MAZAL's website and sale terms, including orders, pricing, payment, delivery, returns, intellectual property and liability.",
  });
}

export default async function TermsPage() {
  const { settings } = await getFreshStoreData();

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Terms & Conditions" }]} />
      </Container>

      <Container className="grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
        <div>
          <p className="eyebrow">Terms</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink md:text-6xl">
            Terms & Conditions
          </h1>
          <p className="mt-5 text-ink-soft">
            Last updated: July 1, 2026
          </p>
          <div className="mt-8">
            <Button href="/contact" variant="outline">
              Contact Client Care
            </Button>
          </div>
        </div>

        <div className="space-y-8 text-ink-soft">
          <PolicySection title="Use of the Website">
            <p>
              By using mazal.ae, placing an order or contacting MAZAL, you agree
              to these terms. Please do not use the website if you do not accept
              them.
            </p>
          </PolicySection>

          <PolicySection title="Products and Availability">
            <p>
              We aim to show accurate product information, prices, imagery,
              colours, sizes and stock. Small differences may occur because of
              photography, screen settings or handcrafted details. Products are
              subject to availability, and we may cancel or refuse an order if an
              item becomes unavailable or was listed incorrectly.
            </p>
          </PolicySection>

          <PolicySection title="Orders, Pricing and Payment">
            <p>
              Prices are shown in {settings.currency} unless stated otherwise.
              Order totals, delivery fees and discounts are shown at checkout.
              Payment options may include card, payment link, Tabby or cash on
              delivery where available. An order is accepted only when MAZAL
              confirms it.
            </p>
          </PolicySection>

          <PolicySection title="Shipping, Returns and Exchanges">
            <p>
              Delivery is handled according to our{" "}
              <Link href="/shipping" className="link-underline text-bronze hover:text-bronze-deep">
                Shipping Policy
              </Link>
              . Returns and exchanges are handled according to our{" "}
              <Link href="/returns" className="link-underline text-bronze hover:text-bronze-deep">
                Returns & Exchanges Policy
              </Link>
              .
            </p>
          </PolicySection>

          <PolicySection title="Promotions and Rewards">
            <p>
              Promotional codes, rewards and offers may have eligibility rules,
              expiry dates, minimum spends and exclusions. MAZAL may correct,
              suspend or withdraw offers where misuse, error or technical issues
              occur.
            </p>
          </PolicySection>

          <PolicySection title="Intellectual Property">
            <p>
              MAZAL branding, photography, product names, designs, text, website
              layout and other content belong to MAZAL or its licensors. They
              may not be copied, reused or reproduced without written permission.
            </p>
          </PolicySection>

          <PolicySection title="Limitation of Liability">
            <p>
              To the maximum extent permitted by law, MAZAL is not responsible
              for indirect, incidental or consequential losses arising from use
              of the website, delayed delivery, product unavailability or service
              interruptions. Nothing in these terms limits rights that cannot be
              limited by applicable law.
            </p>
          </PolicySection>

          <PolicySection title="Contact">
            <p>
              For questions about these terms, contact {settings.contact.email}{" "}
              or {settings.contact.phone}.
            </p>
          </PolicySection>
        </div>
      </Container>
    </>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-sand-deep/60 pt-6">
      <h2 className="font-serif text-3xl text-ink">{title}</h2>
      <div className="mt-3 leading-relaxed">{children}</div>
    </section>
  );
}
