"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useWishlist } from "@/lib/wishlist-context";
import { formatAED } from "@/lib/format";
import { clsx } from "@/lib/clsx";

type Tab = "dashboard" | "orders" | "rewards" | "details";

const ORDERS = [
  { id: "MZL-204871", date: "12 Jun 2026", items: 2, total: 3700, status: "Delivered" },
  { id: "MZL-198320", date: "28 May 2026", items: 1, total: 1450, status: "Delivered" },
  { id: "MZL-187654", date: "09 May 2026", items: 3, total: 2240, status: "Delivered" },
];

export default function AccountPage() {
  const { count: wishCount } = useWishlist();
  const [tab, setTab] = useState<Tab>("dashboard");

  const NAV: { key: Tab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "orders", label: "Orders" },
    { key: "rewards", label: "Rewards" },
    { key: "details", label: "Details" },
  ];

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Account" }]} />
      </Container>

      <Container className="py-10">
        <p className="eyebrow">My Account</p>
        <h1 className="mt-2 font-serif text-4xl text-ink md:text-5xl">
          Ahlan, welcome back
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Demo account — connect authentication to make this live.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="min-w-0">
            <nav className="flex gap-2 overflow-x-auto lg:flex-col">
              {NAV.map((n) => (
                <button
                  key={n.key}
                  type="button"
                  onClick={() => setTab(n.key)}
                  className={clsx(
                    "whitespace-nowrap px-4 py-3 text-left text-sm transition-colors",
                    tab === n.key
                      ? "bg-ink text-cream-soft"
                      : "text-ink-soft hover:text-bronze",
                  )}
                >
                  {n.label}
                </button>
              ))}
              <Link
                href="/wishlist"
                className="whitespace-nowrap px-4 py-3 text-left text-sm text-ink-soft transition-colors hover:text-bronze"
              >
                Wishlist ({wishCount})
              </Link>
              <button
                type="button"
                className="whitespace-nowrap px-4 py-3 text-left text-sm text-ink-soft transition-colors hover:text-bronze"
              >
                Sign out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            {tab === "dashboard" && (
              <div className="space-y-8">
                <div className="grid gap-5 sm:grid-cols-3">
                  <StatCard label="Rewards points" value="1,250" hint="= AED 125" />
                  <StatCard label="Total orders" value="3" hint="All delivered" />
                  <StatCard label="Wishlist" value={String(wishCount)} hint="Saved pieces" />
                </div>
                <div className="bg-gradient-to-br from-bronze-deep to-bronze p-6 text-cream-soft">
                  <p className="text-xs uppercase tracking-[0.18em] text-cream-soft/80">
                    MAZAL Club · Serene tier
                  </p>
                  <p className="mt-2 font-serif text-2xl">
                    You&rsquo;re 750 points from your next AED 75 reward
                  </p>
                  <Link
                    href="/rewards"
                    className="mt-4 inline-block bg-cream-soft px-6 py-2.5 text-xs uppercase tracking-[0.16em] text-ink hover:bg-cream"
                  >
                    View rewards
                  </Link>
                </div>
                <RecentOrders />
              </div>
            )}

            {tab === "orders" && <RecentOrders full />}

            {tab === "rewards" && (
              <div className="space-y-4">
                <StatCard label="Available points" value="1,250" hint="= AED 125 to spend" />
                <p className="text-ink-soft">
                  Redeem points at checkout, or explore all the ways to earn on the{" "}
                  <Link href="/rewards" className="text-bronze hover:underline">
                    Rewards page
                  </Link>
                  .
                </p>
              </div>
            )}

            {tab === "details" && (
              <form className="max-w-lg space-y-4">
                <Field label="Full name" defaultValue="Your Name" />
                <Field label="Email" defaultValue="you@example.com" type="email" />
                <Field label="Phone" defaultValue="+971 50 000 0000" />
                <button
                  type="button"
                  className="bg-bronze px-7 py-3 text-xs uppercase tracking-[0.2em] text-cream-soft hover:bg-bronze-deep"
                >
                  Save changes
                </button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-cream-soft p-6 ring-1 ring-sand-deep/40">
      <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">{label}</p>
      <p className="mt-2 font-serif text-4xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-soft">{hint}</p>
    </div>
  );
}

function RecentOrders({ full = false }: { full?: boolean }) {
  return (
    <div>
      <h2 className="mb-4 font-serif text-2xl text-ink">
        {full ? "Your orders" : "Recent orders"}
      </h2>
      <div className="overflow-x-auto ring-1 ring-sand-deep/40">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-sand-deep/50 bg-cream-soft text-left text-xs uppercase tracking-[0.1em] text-ink-soft">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.map((o) => (
              <tr key={o.id} className="border-b border-sand-deep/30 last:border-0">
                <td className="px-4 py-3 text-ink">{o.id}</td>
                <td className="px-4 py-3 text-ink-soft">{o.date}</td>
                <td className="px-4 py-3 text-ink-soft">{o.items}</td>
                <td className="px-4 py-3 text-ink">{formatAED(o.total)}</td>
                <td className="px-4 py-3">
                  <span className="bg-bronze/15 px-2.5 py-1 text-xs text-bronze">
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-ink">
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full border border-sand-deep bg-cream-soft px-4 py-3 text-sm text-ink focus:border-bronze focus:outline-none"
      />
    </div>
  );
}
