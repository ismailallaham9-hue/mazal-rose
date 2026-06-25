import { Suspense } from "react";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLoginPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center px-6 py-20 text-center">
        <p className="eyebrow">MAZAL Control Panel</p>
        <h1 className="mt-4 font-serif text-4xl text-ink md:text-6xl">
          Admin Login
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-ink-soft">
          Sign in to update products, images, and homepage content.
        </p>
        <div className="mt-10">
          <Suspense>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
