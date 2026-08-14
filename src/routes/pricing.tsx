import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — CandyInvito Wedding Invitations" },
      {
        name: "description",
        content:
          "Three CandyInvito collections: Essence, Atelier and Maison. Transparent one-time pricing with managed hosting included.",
      },
      { property: "og:title", content: "Pricing — CandyInvito Wedding Invitations" },
      {
        property: "og:description",
        content: "Essence, Atelier and Maison — one-time pricing with hosting included.",
      },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    name: "Essence",
    price: "₹14,000",
    for: "An intimate ceremony, one clear page.",
    includes: [
      "Any non-premium design",
      "Up to 6 sections",
      "RSVP with guest counts",
      "90 days live hosting",
      "Basic analytics",
    ],
    featured: false,
  },
  {
    name: "Atelier",
    price: "₹28,000",
    for: "Multi-event weddings with a full guest list.",
    includes: [
      "Every design, including premium",
      "Unlimited sections",
      "Per-event RSVP & messages",
      "Background music & gallery",
      "180 days live hosting",
      "Full analytics dashboard",
    ],
    featured: true,
  },
  {
    name: "Maison",
    price: "From ₹52,000",
    for: "A bespoke invitation designed around you.",
    includes: [
      "Custom layout & artwork",
      "Wedding livestream section",
      "Dedicated concierge",
      "Guest-list import & reminders",
      "365 days live hosting",
      "Priority review & changes",
    ],
    featured: false,
  },
];

function PricingPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Collections"
        title="One invitation. One price. No subscriptions."
        intro="Design, customization, review and hosting are included. You pay once, for the wedding you're actually having."
      />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`flex flex-col border p-9 ${
                plan.featured ? "border-gold shadow-gold" : "border-border"
              }`}
            >
              <h2 className="font-display text-3xl">{plan.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{plan.for}</p>
              <p className="mt-8 font-display text-4xl text-primary">{plan.price}</p>
              <ul className="mt-8 flex-1 space-y-3 text-sm text-muted-foreground">
                {plan.includes.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="text-gold">
                      ✦
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`mt-10 px-6 py-3 text-center text-xs tracking-[0.22em] uppercase transition-colors ${
                  plan.featured
                    ? "bg-ink text-ink-foreground hover:opacity-90"
                    : "border border-ink hover:bg-ink hover:text-ink-foreground"
                }`}
              >
                Enquire
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          Prices are indicative for planning purposes during our launch period.
        </p>
      </section>
    </SiteLayout>
  );
}
