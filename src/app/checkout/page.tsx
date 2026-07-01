import { CheckoutClient } from "./CheckoutClient";
import { getFreshStoreData } from "@/lib/store";

export default async function CheckoutPage() {
  const { settings } = await getFreshStoreData();
  return <CheckoutClient settings={settings} />;
}
