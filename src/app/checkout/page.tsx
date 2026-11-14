import { CheckoutClient } from "./CheckoutClient";
import { getFreshStoreData } from "@/lib/store";
import { tabbyConfigured } from "@/lib/tabby";

export default async function CheckoutPage() {
  const { settings } = await getFreshStoreData();
  return <CheckoutClient settings={settings} tabbyEnabled={tabbyConfigured()} />;
}
