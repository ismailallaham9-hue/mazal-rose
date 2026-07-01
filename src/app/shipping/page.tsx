import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { pageMetadata } from "@/lib/seo";
import { getFreshStoreData } from "@/lib/store";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    pageKey: "shipping",
    recordKey: "page:shipping",
    path: "/shipping",
    fallbackTitle: "Shipping Policy",
    fallbackDescription:
      "Read MAZAL's shipping policy, including UAE delivery, GCC and international shipping timelines, fees, duties and client care support.",
  });
}

export default async function ShippingPage() {
  const { settings } = await getFreshStoreData();

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shipping Policy" }]} />
      </Container>

      <Container className="grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
        <div>
          <p className="eyebrow">Client Care</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink md:text-6xl">
            Shipping Policy
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
          <PolicySection title="Order Processing">
            <p>
              Orders are reviewed and prepared during business hours. Most
              ready-to-ship pieces are processed within 1 to 2 working days
              after order confirmation. During launches, private drops, holidays,
              or sale periods, processing may take longer.
            </p>
          </PolicySection>

          <PolicySection title="UAE Delivery">
            <p>
              UAE delivery is available across Dubai, Abu Dhabi, Sharjah, Ajman,
              Ras Al Khaimah, Fujairah and Umm Al Quwain. Standard delivery is
              typically 1 to 3 working days after dispatch.
            </p>
          </PolicySection>

          <PolicySection title="GCC and International Shipping">
            <p>
              GCC orders usually arrive within 2 to 5 working days after
              dispatch. International delivery is available to selected
              countries and usually takes 5 to 9 working days after dispatch,
              depending on customs and courier routing.
            </p>
          </PolicySection>

          <PolicySection title="Fees, Duties and Taxes">
            <p>
              Delivery fees are shown at checkout before payment. Complimentary
              standard shipping may apply on eligible orders over{" "}
              {settings.currency} {settings.freeShippingThreshold}. International
              duties, customs charges, VAT, import taxes, brokerage fees and
              local clearance costs are the customer&apos;s responsibility unless
              checkout clearly states otherwise.
            </p>
          </PolicySection>

          <PolicySection title="Tracking and Delivery Support">
            <p>
              When tracking is available, MAZAL will share the courier details
              by email, WhatsApp or client care message. If a parcel is delayed,
              damaged, refused or returned to sender, contact us as soon as
              possible at {settings.contact.email} or {settings.contact.phone}.
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
