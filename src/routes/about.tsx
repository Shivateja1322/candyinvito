import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About CandyInvito — A Wedding Invitation Studio" },
      {
        name: "description",
        content:
          "CandyInvito is a small studio building digital wedding invitations that feel designed, personal and fast.",
      },
      { property: "og:title", content: "About CandyInvito — A Wedding Invitation Studio" },
      {
        property: "og:description",
        content: "A small studio building digital wedding invitations that feel designed and fast.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="The studio"
        title="We make the first thing your guests see worth keeping."
        intro="CandyInvito began with a simple frustration: wedding invitations online all looked the same, loaded slowly, and forgot the couple entirely."
      />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="space-y-8 text-base leading-relaxed text-muted-foreground">
          <p>
            We are a small team of designers and engineers who care about typography, restraint and
            speed in equal measure. Every design in the atelier is drawn before it is coded, and
            every page is measured on a real phone on a real network before we ship it.
          </p>
          <p>
            A wedding invitation is not a landing page. It carries names, dates and a lot of
            feeling. So we treat it with the seriousness of print — hairline rules, considered
            spacing, one typeface pairing done well — and the advantages of the web: RSVP that
            works, a livestream for the people who can’t travel, and a link that never runs out of
            copies.
          </p>
          <p>
            Behind the scenes, our team reviews every invitation before it is published. Nothing
            goes live with a broken map link, a stretched photograph or a date typo.
          </p>
        </div>

        <dl className="mt-16 grid gap-10 sm:grid-cols-3">
          {[
            { k: "Invitations delivered", v: "180+" },
            { k: "Guests reached", v: "42,000" },
            { k: "Average load time", v: "0.9s" },
          ].map((s) => (
            <div key={s.k}>
              <dt className="eyebrow">{s.k}</dt>
              <dd className="mt-3 font-display text-4xl text-primary">{s.v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </SiteLayout>
  );
}
