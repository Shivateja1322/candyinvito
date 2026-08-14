import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <p className="eyebrow reveal">{eyebrow}</p>
        <h1 className="reveal mt-5 max-w-3xl text-4xl leading-[1.05] md:text-6xl">{title}</h1>
        <p className="reveal mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          {intro}
        </p>
      </div>
    </section>
  );
}
