import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { templateRepository } from "@/lib/repositories";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Invitation Templates — CandyInvito" },
      {
        name: "description",
        content:
          "Browse the CandyInvito atelier: editorial, botanical, royal and minimal digital wedding invitation designs.",
      },
      { property: "og:title", content: "Invitation Templates — CandyInvito" },
      {
        property: "og:description",
        content:
          "Editorial, botanical, royal and minimal digital wedding invitation designs.",
      },
    ],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["templates"],
    queryFn: () => templateRepository.list(),
  });

  return (
    <SiteLayout>
      <PageHero
        eyebrow="The atelier"
        title="Six designs. Endlessly yours."
        intro="Each design is a complete invitation — sections, motion and typography already composed. Choose one, then reshape it in the studio."
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        {isError && (
          <p className="text-sm text-destructive">
            We couldn’t load the designs just now. Please refresh the page.
          </p>
        )}

        {isPending && (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="mt-4 h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-full" />
              </div>
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No designs are published yet. New layouts are added every month.
          </p>
        )}

        {data && data.length > 0 && (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((template) => (
              <Link
                key={template.id}
                to="/templates/$slug"
                params={{ slug: template.slug }}
                className="group reveal block"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border border-border transition-transform duration-700 group-hover:scale-[1.02]">
                    <span aria-hidden className="text-gold">
                      ✦
                    </span>
                    <span className="font-display text-3xl">
                      {template.name}
                    </span>
                    <span className="eyebrow">{template.style}</span>
                  </div>

                  {template.isPremium && (
                    <span className="absolute top-4 right-4 border border-gold px-2.5 py-1 text-[0.6rem] tracking-[0.2em] text-primary uppercase">
                      Premium
                    </span>
                  )}
                </div>

                <h2 className="mt-5 text-lg">{template.name}</h2>

                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {template.tagline}
                </p>

                <p className="mt-3 text-xs text-muted-foreground">
                  {template.sections.length} sections
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}