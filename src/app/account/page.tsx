import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "My Account",
  description: "Customer account access for MAZAL.",
  robots: { index: false, follow: false },
};

// The client area (AccountClient) is a design demo with placeholder orders
// and points, not connected to real accounts, so it stays hidden.
export default function AccountPage() {
  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Account" }]} />
      </Container>

      <Container className="flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
        <p className="eyebrow">My Account</p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink md:text-6xl">
          Customer accounts are coming soon
        </h1>
        <p className="mt-5 max-w-xl text-ink-soft">
          We are preparing a private account area for order history, saved
          details, and wishlist syncing. For now, our client care team can
          help with any order request directly.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="/contact">Contact Client Care</Button>
          <Button href="/shop" variant="outline">
            Continue Shopping
          </Button>
        </div>
      </Container>
    </>
  );
}
