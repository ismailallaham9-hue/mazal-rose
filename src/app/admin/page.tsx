import { AdminDashboard } from "./AdminDashboard";
import { getStoreData, storageReady } from "@/lib/store";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  const store = await getStoreData();
  return <AdminDashboard initialStore={store} storageReady={storageReady()} />;
}
