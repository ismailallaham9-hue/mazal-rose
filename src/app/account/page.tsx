import type { Metadata } from "next";
import { connection } from "next/server";
import { AccountClient } from "./AccountClient";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { getStoreData } from "@/lib/store";

export const metadata: Metadata = {
  title: "My Account",
  description: "Customer account access for MAZAL.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  await connection();
  const { settings } = await getStoreData();

  if (settings.showCustomerAccount) {
    return <AccountClient />;
  }

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
          We are preparing a private account area for order history, rewards,
          saved details, and wishlist syncing. For now, our client care team can
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
