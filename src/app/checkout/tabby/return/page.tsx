import Link from "next/link";
import { Container } from "@/components/Container";
import { verifyTabbyPayment } from "@/lib/tabby";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tabby test payment", robots: { index: false, follow: false } };
export default async function TabbyReturn({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  let message = "Payment verification is pending. Please contact client care if this continues.";
  try {
    if (order) {
      const result = await verifyTabbyPayment(order);
      message = result.complete ? "Tabby test payment captured successfully. This QA order will not be fulfilled." : result.failed ? "Test payment was not completed. Your bag is still available." : message;
    }
  } catch { /* The authenticated webhook retries verification independently. */ }
  return <Container className="py-24 text-center"><h1 className="font-serif text-3xl">Tabby test payment</h1><p className="mt-4">{message}</p><Link className="mt-6 inline-block underline" href="/checkout">Return to checkout</Link></Container>;
}
