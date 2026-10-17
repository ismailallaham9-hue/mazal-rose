import { ContentStudio } from "./ContentStudio";
import { getStoreData, storageReady } from "@/lib/store";
import { requireAdminPage } from "@/lib/admin-page-auth";

export const metadata = {
  title: "Content Studio",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ContentStudioPage() {
  await requireAdminPage("/admin/content-studio");
  const store = await getStoreData();
  return <ContentStudio initialStore={store} storageReady={storageReady()} />;
}
