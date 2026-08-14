import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — CandyInvito" },
      {
        name: "description",
        content:
          "From choosing a design to going live: how a CandyInvito digital wedding invitation is created, reviewed and hosted.",
      },
      { property: "og:title", content: "How It Works — CandyInvito" },
      {
        property: "og:description",
        content: "Choose, customize, preview, publish — the CandyInvito invitation process.",
      },
    ],
  }),
  component: HowItWorksPage,
});

const STAGES = [
  {
    n: "01",
    t: "Choose a design",
    d: "Start from a complete layout in the atelier. Every design already includes hero, story, events, venue, gallery and RSVP.",
  },
  {
    n: "02",
    t: "Customize in the studio",
    d: "Names, dates, events, photographs, colors, typography and music. Sections can be reordered, hidden or added.",
  },
  {
    n: "03",
    t: "Preview privately",
    d: "A private link lets you and your family review the invitation on real phones before anyone else sees it.",
  },
  {
    n: "04",
    t: "Request deployment",
    d: "When you’re happy, request publication. Our team reviews typography, imagery and links within a day.",
  },
  {
    n: "05",
    t: "Go live",
    d: "Your invitation is published on its own address and stays live for the window agreed with you.",
  },
  {
    n: "06",
    t: "Follow the responses",
    d: "RSVPs and analytics arrive in your dashboard as guests open the link and reply.",
  },
];

function HowItWorksPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="The process"
        title="Considered from the first draft to the last guest."
        intro="A short, guided path — with a real person reviewing your invitation before it reaches anyone."
      />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <ol className="space-y-12">
          {STAGES.map((s) => (
            <li key={s.n} className="grid grid-cols-[auto_1fr] gap-6 border-b border-border pb-12">
              <span className="font-display text-4xl text-gold">{s.n}</span>
              <div>
                <h2 className="text-2xl">{s.t}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </SiteLayout>
  );
}
