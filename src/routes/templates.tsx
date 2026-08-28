import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { templateRepository } from "@/lib/repositories";
import { Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Invitation Templates — CandyInvito" },
      {
        name: "description",
        content:
          "Browse the CandyInvito atelier: Royal Heritage, Editorial Romance, Garden Reverie, Mediterranean Élan, and Contemporary Noir digital wedding invitation designs.",
      },
      { property: "og:title", content: "Invitation Templates — CandyInvito" },
      {
        property: "og:description",
        content:
          "Browse our five signature wedding invitation designs crafted for modern luxury celebrations.",
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
        eyebrow="The Atelier"
        title="Five bespoke collections. Endlessly yours."
        intro="Each design is a complete digital wedding experience — typography, interactive schedule, video hero, and RSVP already composed. Choose your foundation, then personalize it in the studio."
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        {isError && (
          <p className="text-sm text-destructive">
            We couldn’t load the designs just now. Please refresh the page.
          </p>
        )}

        {isPending && (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
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
              <div
                key={template.id}
                className="group flex flex-col justify-between bg-white border border-[#201814]/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500"
              >
                <div>
                  <Link
                    to="/templates/$slug"
                    params={{ slug: template.slug }}
                    className="relative aspect-[4/5] overflow-hidden block bg-[#1C1C1E]"
                  >
                    {template.previewImage ? (
                      <img
                        src={template.previewImage}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : null}

                    {/* Gradient Overlay & Badge */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                      <span className="text-[10px] tracking-[0.25em] uppercase text-[#DCA963] font-bold mb-1">
                        {template.style} Collection
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-white leading-tight">
                        {template.name}
                      </h3>
                    </div>

                    {template.isPremium && (
                      <span className="absolute top-4 right-4 bg-[#DCA963] text-[#201814] px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] uppercase rounded-full shadow-sm">
                        Premium
                      </span>
                    )}
                  </Link>

                  <div className="p-6">
                    <p className="text-sm leading-relaxed text-[#201814]/70">
                      {template.tagline}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-xs text-[#201814]/50 font-medium">
                      <span>{template.sections.length} interactive sections</span>
                      <span>·</span>
                      <span>Audio & Video ready</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between gap-3 border-t border-[#201814]/5 mt-4">
                  <Link
                    to="/templates/$slug"
                    params={{ slug: template.slug }}
                    className="text-xs text-[#201814]/70 hover:text-[#201814] font-bold uppercase tracking-wider transition-colors"
                  >
                    Explore Details
                  </Link>
                  <Link
                    to="/client/templates"
                    className="inline-flex items-center gap-1.5 bg-[#201814] hover:bg-[#DCA963] text-white hover:text-[#201814] text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-xs"
                  >
                    Customize <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}