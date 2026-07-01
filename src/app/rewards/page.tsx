import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Reveal } from "@/components/Reveal";
import { Accordion } from "@/components/Accordion";
import { pageMetadata } from "@/lib/seo";
import { getStoreData } from "@/lib/store";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    pageKey: "rewards",
    recordKey: "page:rewards",
    path: "/rewards",
    fallbackTitle: "MAZAL Rewards — Loyalty, VIP & Referrals",
    fallbackDescription:
      "Join MAZAL Rewards: earn points on every order, unlock VIP tiers, and refer friends for AED off. Quiet luxury, generously rewarded.",
  });
}

const EARN = [
  { points: "+10 pts", action: "for every AED 1 spent", icon: "♦" },
  { points: "+500 pts", action: "when you create an account", icon: "✦" },
  { points: "+50 pts", action: "for a verified product review", icon: "★" },
  { points: "+250 pts", action: "on your birthday", icon: "❀" },
  { points: "+200 pts", action: "for following on Instagram", icon: "❤" },
  { points: "+1000 pts", action: "for each friend referred", icon: "✶" },
];

const TIERS = [
  {
    name: "Still",
    spend: "From AED 0",
    perks: ["Earn 10 pts / AED 1", "Birthday gift", "Early-access previews"],
    highlight: false,
  },
  {
    name: "Serene",
    spend: "From AED 5,000 / year",
    perks: [
      "Everything in Still",
      "12 pts / AED 1",
      "Free express delivery",
      "Seasonal gift with purchase",
    ],
    highlight: true,
  },
  {
    name: "Sublime",
    spend: "From AED 15,000 / year",
    perks: [
      "Everything in Serene",
      "15 pts / AED 1",
      "Dedicated personal stylist",
      "Invitations to private events",
    ],
    highlight: false,
  },
];

export default async function RewardsPage() {
  const { settings } = await getStoreData();

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Rewards" }]} />
      </Container>

      {/* Hero */}
      <section className="bg-gradient-to-br from-bronze-deep via-bronze to-[#caa278] text-cream-soft">
        <Container className="py-20 text-center md:py-28">
          <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-5">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.22em]">
              MAZAL Rewards
            </p>
            <h1 className="font-serif text-5xl leading-tight md:text-7xl">
              Quiet luxury, generously rewarded.
            </h1>
            <p className="max-w-xl text-cream-soft/90">
              Earn points on everything you do — then redeem them for AED off your
              favourite pieces. Membership is complimentary.
            </p>
            <Link
              href="/shop"
              className="mt-2 bg-cream-soft px-9 py-4 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:bg-cream"
            >
              Start earning
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* Earn */}
      <Container className="py-20">
        <Reveal className="text-center">
          <p className="eyebrow">Ways to earn</p>
          <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
            Points add up quickly
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EARN.map((e, i) => (
            <Reveal key={e.action} delay={(i % 3) * 80}>
              <div className="flex items-center gap-4 bg-cream-soft p-6 ring-1 ring-sand-deep/40">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bronze/15 text-xl text-bronze">
                  {e.icon}
                </span>
                <div>
                  <p className="font-serif text-2xl text-ink">{e.points}</p>
                  <p className="text-sm text-ink-soft">{e.action}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-ink-soft">
          100 points = AED 10 to spend. No expiry while you&rsquo;re active.
        </p>
      </Container>

      {/* Tiers */}
      <section className="bg-sand">
        <Container className="py-20">
          <Reveal className="text-center">
            <p className="eyebrow">The MAZAL Club</p>
            <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
              Three tiers of stillness
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TIERS.map((t, i) => (
              <Reveal key={t.name} delay={i * 90}>
                <div
                  className={
                    t.highlight
                      ? "relative bg-ink p-8 text-cream-soft shadow-xl"
                      : "bg-cream-soft p-8 ring-1 ring-sand-deep/40"
                  }
                >
                  {t.highlight && (
                    <span className="absolute right-6 top-6 bg-bronze px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.14em] text-cream-soft">
                      Popular
                    </span>
                  )}
                  <h3 className="font-serif text-3xl">{t.name}</h3>
                  <p
                    className={
                      t.highlight
                        ? "mt-1 text-sm text-cream-soft/70"
                        : "mt-1 text-sm text-ink-soft"
                    }
                  >
                    {t.spend}
                  </p>
                  <ul className="mt-6 space-y-3 text-sm">
                    {t.perks.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <span className="text-bronze">✓</span>
                        <span className={t.highlight ? "text-cream-soft/90" : "text-ink-soft"}>
                          {p}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Referral */}
      <Container className="grid items-center gap-10 py-20 md:grid-cols-2 lg:gap-20">
        <Reveal>
          <p className="eyebrow">Refer a friend</p>
          <h2 className="mt-3 font-serif text-4xl text-ink md:text-5xl">
            Give AED 50, get AED 50
          </h2>
          <p className="mt-5 text-ink-soft">
            Share your personal link. Your friend gets {settings.firstOrderDiscount}%
            off their first order, and you earn AED 50 in points the moment they
            shop. There&rsquo;s no limit to how much you can earn.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="bg-bronze px-8 py-3 text-xs uppercase tracking-[0.2em] text-cream-soft transition-colors hover:bg-bronze-deep"
            >
              Get my referral link
            </Link>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="space-y-4">
            {[
              { step: "01", text: "Share your unique referral link with friends." },
              { step: "02", text: "They enjoy 10% off their first MAZAL order." },
              { step: "03", text: "You earn AED 50 in points once they purchase." },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-5 bg-cream-soft p-5 ring-1 ring-sand-deep/40">
                <span className="font-serif text-3xl text-bronze">{s.step}</span>
                <p className="text-ink-soft">{s.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>

      {/* FAQ */}
      <Container className="pb-24">
        <h2 className="mb-6 font-serif text-3xl text-ink">Rewards FAQ</h2>
        <Accordion
          defaultOpen={0}
          items={[
            {
              title: "How do I join?",
              content: <p>Membership is automatic and free when you create an account at checkout — you&rsquo;ll start earning points right away.</p>,
            },
            {
              title: "What are points worth?",
              content: <p>Every 100 points equals AED 10 to spend on any order. Redeem at checkout in increments of 100.</p>,
            },
            {
              title: "Do points expire?",
              content: <p>Points stay active as long as you place an order at least once every 12 months.</p>,
            },
            {
              title: "How are VIP tiers calculated?",
              content: <p>Tiers are based on your spend over a rolling 12-month period and update automatically.</p>,
            },
          ]}
        />
      </Container>
    </>
  );
}
