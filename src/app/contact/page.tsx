import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { Accordion } from "@/components/Accordion";
import { whatsappLink } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { getFreshStoreData } from "@/lib/store";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    pageKey: "contact",
    recordKey: "page:contact",
    path: "/contact",
    fallbackTitle: "Contact & Client Care",
    fallbackDescription:
      "Reach the MAZAL team for orders, styling, and client care. Chat on WhatsApp or send us a message — we reply within one working day.",
  });
}

export default async function ContactPage() {
  const { settings } = await getFreshStoreData();
  const whatsapp = settings.whatsapp;
  const contact = settings.contact;

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      </Container>

      <Container className="py-12 text-center">
        <p className="eyebrow">Client Care</p>
        <h1 className="mt-3 font-serif text-4xl text-ink md:text-6xl">
          We&rsquo;re here to help
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink-soft">
          Questions about an order, sizing, or styling? Our team replies within
          one working day — or reach us instantly on WhatsApp.
        </p>
      </Container>

      <Container className="grid gap-12 pb-16 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        {/* Info + WhatsApp */}
        <div className="space-y-8">
          <div className="space-y-4">
            <InfoRow label="Email" value={contact.email} />
            <InfoRow label="Phone" value={contact.phone} />
            <InfoRow label="Atelier" value={contact.addressLine} />
            <InfoRow label="Hours" value={contact.hours} />
          </div>

          <div className="bg-[#1f8a5b]/8 border border-[#1f8a5b]/30 p-6">
            <p className="font-serif text-2xl text-ink">Chat on WhatsApp</p>
            <p className="mt-1 text-sm text-ink-soft">
              The fastest way to reach us — typically replies in minutes.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {[
                { label: "General enquiry", msg: whatsapp.defaultMessage },
                { label: "Personal styling", msg: whatsapp.stylingMessage },
                { label: "Order support", msg: whatsapp.orderSupportMessage },
              ].map((o) => (
                <a
                  key={o.label}
                  href={whatsappLink(o.msg, whatsapp.number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border border-[#25D366] bg-cream-soft px-4 py-3 text-sm text-ink transition-colors hover:bg-[#25D366]/10"
                >
                  {o.label}
                  <span className="text-[#1f8a5b]">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div id="review-form" className="scroll-mt-28">
          <h2 className="font-serif text-2xl text-ink">Send a message</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Fill in the form and we&rsquo;ll be in touch shortly.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </Container>

      {/* FAQ */}
      <Container className="pb-24">
        <h2 className="mb-6 font-serif text-3xl text-ink">Frequently asked</h2>
        <Accordion
          defaultOpen={0}
          items={[
            {
              title: "How long does delivery take?",
              content: (
                <p>
                  Express delivery across the GCC takes 2–4 working days, and
                  worldwide 5–9 days. Complimentary over {settings.currency}{" "}
                  {settings.freeShippingThreshold}.
                </p>
              ),
            },
            {
              title: "What is your return policy?",
              content: (
                <p>
                  We offer 14-day hassle-free returns and exchanges on unworn
                  items with tags attached. Read the full{" "}
                  <Link href="/returns" className="link-underline text-bronze hover:text-bronze-deep">
                    Returns & Exchanges policy
                  </Link>{" "}
                  for eligibility, refunds, and exchange steps.
                </p>
              ),
            },
            {
              title: "Do you offer personal styling?",
              content: (
                <p>
                  Yes — message us on WhatsApp for a complimentary personal
                  styling consultation with our team.
                </p>
              ),
            },
            {
              title: "Which payment methods do you accept?",
              content: (
                <p>
                  All major cards and buy-now-pay-later options at a secure,
                  encrypted checkout.
                </p>
              ),
            },
          ]}
        />
      </Container>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-sand-deep/50 pb-3">
      <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">{label}</p>
      <p className="mt-1 text-ink">{value}</p>
    </div>
  );
}
