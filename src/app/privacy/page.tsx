import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { pageMetadata } from "@/lib/seo";
import { getFreshStoreData } from "@/lib/store";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    pageKey: "privacy",
    recordKey: "page:privacy",
    path: "/privacy",
    fallbackTitle: "Privacy Policy",
    fallbackDescription:
      "Read how MAZAL collects, uses and protects customer information for orders, client care, marketing and website services.",
  });
}

export default async function PrivacyPage() {
  const { settings } = await getFreshStoreData();

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
      </Container>

      <Container className="grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
        <div>
          <p className="eyebrow">Privacy</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink md:text-6xl">
            Privacy Policy
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
          <PolicySection title="Information We Collect">
            <p>
              MAZAL collects information needed to operate the website, process
              orders, provide client care and improve our service. This may
              include your name, email address, phone number, delivery address,
              order details, payment method selection, messages, newsletter
              preferences and website usage information.
            </p>
          </PolicySection>

          <PolicySection title="How We Use Information">
            <p>
              We use customer information to confirm orders, arrange delivery,
              manage returns and exchanges, respond to enquiries, send order or
              service messages, prevent misuse, maintain records, improve the
              website and send marketing only where permitted.
            </p>
          </PolicySection>

          <PolicySection title="Payments">
            <p>
              Payment details are handled by payment providers and banking
              partners. MAZAL does not intentionally store full card numbers in
              the website admin. Payment status, method and order totals may be
              stored so we can support the order.
            </p>
          </PolicySection>

          <PolicySection title="Sharing Information">
            <p>
              We may share necessary information with couriers, payment
              providers, email providers, hosting providers, analytics services,
              fraud-prevention partners, professional advisers or authorities
              where required by law. We do not sell customer personal
              information.
            </p>
          </PolicySection>

          <PolicySection title="Your Choices">
            <p>
              You can request access, correction or deletion of your personal
              information where applicable. You can also unsubscribe from
              marketing messages. To contact us, email {settings.contact.email}{" "}
              or call {settings.contact.phone}.
            </p>
          </PolicySection>

          <PolicySection title="Security and Retention">
            <p>
              We use reasonable technical and organisational measures to protect
              customer information. We keep information only as long as needed
              for orders, accounting, legal, fraud-prevention and client-care
              purposes.
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
