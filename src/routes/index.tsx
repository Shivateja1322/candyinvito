import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import heroImage from "@/assets/hero-wedding.jpg";
import { SplashIntro } from "@/components/SplashIntro";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CandyInvito — Premium Digital Wedding Invitations" },
      {
        name: "description",
        content:
          "Design, customize and share a cinematic digital wedding invitation with RSVP, livestream and analytics built in.",
      },
      { property: "og:title", content: "CandyInvito — Premium Digital Wedding Invitations" },
      {
        property: "og:description",
        content:
          "Cinematic digital wedding invitations with RSVP, livestream and analytics — designed for couples who care about every detail.",
      },
    ],
  }),
  component: Home,
});

const CRAFT = [
  {
    title: "Designed, not templated",
    body: "Every invitation starts from an editorial layout drawn by hand, then adapts to your names, dates and story.",
  },
  {
    title: "One link, everything inside",
    body: "Ceremony details, venue maps, your story, a gallery, RSVP and a livestream — in a single elegant page.",
  },
  {
    title: "Fast on every phone",
    body: "Most guests open your invitation on a mobile network. Ours loads in under a second and stays smooth.",
  },
];

const STEPS = [
  {
    n: "01",
    t: "Choose a design",
    d: "Browse the atelier and pick the layout that feels like you.",
  },
  {
    n: "02",
    t: "Make it yours",
    d: "Edit sections, colors, typography, music and photographs in the studio.",
  },
  {
    n: "03",
    t: "Preview together",
    d: "Share a private preview link and refine it until it is right.",
  },
  {
    n: "04",
    t: "Go live",
    d: "We review, publish and host it for the length of your celebration.",
  },
];

function Home() {
  return (
    <SplashIntro>
      <SiteLayout>
      {/* Hero */}
      <section className="relative -mt-20 overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-32 pb-20 md:grid-cols-[1.05fr_0.95fr] md:pt-40 md:pb-28">
          <div>
            <p className="eyebrow reveal">Digital wedding invitations</p>
            <h1 className="reveal mt-6 text-5xl leading-[0.98] md:text-7xl">
              The invitation is
              <br />
              the first moment
              <br />
              <em className="text-primary not-italic">of your wedding.</em>
            </h1>
            <p className="reveal-slow mt-7 max-w-md text-base leading-relaxed text-muted-foreground">
              CandyInvito turns your details into a cinematic page your guests will actually enjoy
              opening — with RSVP, livestream and quiet analytics behind it.
            </p>
            <div className="reveal-slow mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/templates"
                className="bg-ink px-7 py-3.5 text-xs tracking-[0.22em] text-ink-foreground uppercase transition-opacity hover:opacity-90"
              >
                View the atelier
              </Link>
              <Link
                to="/how-it-works"
                className="border-b border-gold pb-1 text-xs tracking-[0.22em] uppercase transition-colors hover:text-primary"
              >
                How it works
              </Link>
            </div>
          </div>

          <figure className="reveal-slow relative">
            <img
              src={heroImage}
              alt="A couple exchanging rings in candlelight, surrounded by deep red florals"
              width={1408}
              height={1760}
              className="aspect-[4/5] w-full object-cover shadow-lift"
            />
            <figcaption className="veil pointer-events-none absolute inset-x-0 bottom-0 p-6">
              <span className="font-display text-2xl text-ink-foreground">Aarav & Meera</span>
              <span className="mt-1 block text-[0.7rem] tracking-[0.24em] text-ink-foreground/80 uppercase">
                Udaipur · November 2026
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Craft */}
      <section className="border-y border-border">
        <div className="mx-auto grid max-w-6xl gap-px bg-border md:grid-cols-3">
          {CRAFT.map((item) => (
            <article key={item.title} className="bg-background p-10">
              <h2 className="rule-gold font-display text-2xl">{item.title}</h2>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="eyebrow">The process</p>
        <h2 className="mt-5 max-w-2xl text-3xl md:text-5xl">
          Four unhurried steps between “we’re engaged” and “please join us”.
        </h2>
        <ol className="mt-14 grid gap-10 md:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className="font-display text-4xl text-gold">{s.n}</span>
              <h3 className="mt-4 text-lg">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing */}
      <section className="bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
          <p className="eyebrow text-ink-foreground/60">Invitations by CandyInvito</p>
          <h2 className="mx-auto mt-6 max-w-2xl text-4xl text-ink-foreground md:text-6xl">
            Let your guests feel the wedding before they arrive.
          </h2>
          <Link
            to="/login"
            className="mt-10 inline-block border border-gold px-8 py-3.5 text-xs tracking-[0.22em] text-ink-foreground uppercase transition-colors hover:bg-gold hover:text-gold-foreground"
          >
            Begin your invitation
          </Link>
        </div>
      </section>
    </SiteLayout>
    </SplashIntro>
  );
}
