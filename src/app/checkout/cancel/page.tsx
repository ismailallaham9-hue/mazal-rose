import { redirect } from "next/navigation";

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  redirect(order ? `/checkout/noon/return?order=${order}` : "/checkout");
}
