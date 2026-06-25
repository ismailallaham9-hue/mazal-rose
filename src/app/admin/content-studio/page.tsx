import { ContentStudio } from "./ContentStudio";
import { getStoreData, storageReady } from "@/lib/store";

export const metadata = {
  title: "Content Studio",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ContentStudioPage() {
  const store = await getStoreData();
  return <ContentStudio initialStore={store} storageReady={storageReady()} />;
}
