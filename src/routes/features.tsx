import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — CandyInvito Digital Invitations" },
      {
        name: "description",
        content:
          "RSVP, livestream, background music, galleries, analytics and hosting — everything a CandyInvito invitation includes.",
      },
      { property: "og:title", content: "Features — CandyInvito Digital Invitations" },
      {
        property: "og:description",
        content: "RSVP, livestream, music, galleries, analytics and managed hosting.",
      },
    ],
  }),
  component: FeaturesPage,
});

const FEATURES = [
  {
    t: "Invitation studio",
    d: "Rearrange sections, rewrite copy, swap photographs and adjust colors with a live preview beside you.",
  },
  {
    t: "RSVP that behaves",
    d: "Per-event attendance, guest counts, dietary notes and messages — collected in one clean list.",
  },
  {
    t: "Wedding livestream",
    d: "A dedicated section for guests who can’t travel, with scheduled, live and ended states.",
  },
  {
    t: "Background music",
    d: "One track, one tasteful toggle, and graceful behaviour when the browser blocks autoplay.",
  },
  {
    t: "Galleries & story",
    d: "Progressive image loading keeps a fifty-photo gallery as fast as a five-photo one.",
  },
  {
    t: "Quiet analytics",
    d: "Views, unique visitors, RSVP conversion, devices and regions — nothing creepy, only useful.",
  },
  {
    t: "Managed deployment",
    d: "Request publication, we review, then your invitation stays live for the window you choose.",
  },
  {
    t: "Built for mobile",
    d: "Designed on the phone first, because that is where your guests will open the link.",
  },
];

function FeaturesPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="What’s inside"
        title="Everything a wedding invitation should have done all along."
        intro="No plug-ins, no patched-together forms. Each capability is part of the same considered product."
      />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <article key={f.t} className="bg-background p-8">
              <span aria-hidden className="text-gold">
                ✦
              </span>
              <h2 className="mt-4 text-lg">{f.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
