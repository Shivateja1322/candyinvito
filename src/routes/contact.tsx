import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact CandyInvito — Start Your Invitation" },
      {
        name: "description",
        content:
          "Tell us about your wedding and we’ll suggest a design, a collection and a timeline for your digital invitation.",
      },
      { property: "og:title", content: "Contact CandyInvito — Start Your Invitation" },
      {
        property: "og:description",
        content: "Tell us about your wedding and we'll suggest a design and timeline.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  // Mock submission: the enquiry pipeline arrives with the backend phase.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setTimeout(() => setState("sent"), 600);
  }

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Begin"
        title="Tell us about your wedding."
        intro="Share the essentials and we’ll come back within a day with a design suggestion, a collection and a realistic timeline."
      />
      <section className="mx-auto max-w-2xl px-6 py-20">
        {state === "sent" ? (
          <div className="reveal border border-gold p-10 text-center">
            <span aria-hidden className="text-gold">
              ✦
            </span>
            <h2 className="mt-4 font-display text-3xl">Thank you</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Your enquiry is with our team. We reply to every couple within one working day.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-7">
            <div className="grid gap-7 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="partnerA">Your name</Label>
                <Input id="partnerA" name="partnerA" required autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerB">Partner’s name</Label>
                <Input id="partnerB" name="partnerB" required />
              </div>
            </div>
            <div className="grid gap-7 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Wedding date</Label>
                <Input id="date" name="date" type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City or venue</Label>
              <Input id="city" name="city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">What are you imagining?</Label>
              <Textarea id="message" name="message" rows={5} />
            </div>
            <button
              type="submit"
              disabled={state === "sending"}
              className="bg-ink px-8 py-3.5 text-xs tracking-[0.22em] text-ink-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {state === "sending" ? "Sending…" : "Send enquiry"}
            </button>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}
