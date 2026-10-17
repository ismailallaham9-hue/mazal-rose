import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAuthed } from "./admin-auth";

/**
 * Page-level guard for admin pages that render store data (orders, customers)
 * on the server. Backs up the middleware check; see requireAdmin().
 */
export async function requireAdminPage(path: string): Promise<void> {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await isAuthed(value))) {
    redirect(`/admin/login?next=${encodeURIComponent(path)}`);
  }
}
