import { AdminDashboard } from "./AdminDashboard";
import { getStoreData, storageReady } from "@/lib/store";
import { requireAdminPage } from "@/lib/admin-page-auth";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  await requireAdminPage("/admin");
  const store = await getStoreData();
  return <AdminDashboard initialStore={store} storageReady={storageReady()} />;
}
