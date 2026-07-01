import { CheckoutClient } from "./CheckoutClient";
import { getStoreData } from "@/lib/store";

export default async function CheckoutPage() {
  const { settings } = await getStoreData();
  return <CheckoutClient whatsapp={settings.whatsapp} />;
}
