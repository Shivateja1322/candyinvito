import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "../components/site/SiteLayout";
import { templateRepository } from "../lib/repositories";
import { Skeleton } from "../components/ui/skeleton";
import { Sparkles, Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/templates/$slug")({
  component: TemplateDetail,
});

function TemplateDetail() {
  const { slug } = Route.useParams();

  const {
    data: template,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["template", slug],
    queryFn: () => templateRepository.getBySlug(slug),
  });

  if (isPending) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <Skeleton className="mx-auto h-8 w-1/3" />
          <Skeleton className="mx-auto mt-4 h-4 w-1/2" />
          <Skeleton className="mx-auto mt-12 aspect-video w-full rounded-2xl" />
        </div>
      </SiteLayout>
    );
  }

  if (isError || !template) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-6 py-40 text-center">
          <h1 className="font-display text-4xl">Template Not Found</h1>
          <p className="mt-4 text-muted-foreground">This design is unavailable or doesn't exist.</p>
          <Link
            to="/templates"
            className="mt-8 inline-block border border-ink px-6 py-3 text-xs tracking-[0.2em] uppercase transition-colors hover:bg-ink hover:text-ink-foreground"
          >
            View All Designs
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-6 py-20">
        <header className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#DCA963] block">
            {template.style} Collection
          </span>
          <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl text-[#201814]">
            {template.name}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            {template.tagline}
          </p>
        </header>

        {/* High-Resolution Preview Image */}
        <div className="mt-16 overflow-hidden rounded-3xl shadow-xl border border-black/10 relative bg-[#1C1C1E] aspect-[16/9] max-h-[520px]">
          {template.previewImage ? (
            <img
              src={template.previewImage}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#DCA963] font-bold">
                CandyInvito Bespoke Theme
              </span>
              <h2 className="text-2xl font-serif font-bold text-white mt-1">
                {template.name}
              </h2>
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-16 md:grid-cols-2 md:items-start">
          <div className="space-y-6">
            <h2 className="font-display text-3xl text-[#201814]">Design Architecture</h2>
            <p className="text-muted-foreground leading-relaxed">
              Every detail is meticulously crafted. The <strong>{template.name}</strong> theme
              provides a robust foundation for your digital invitation, featuring elegant typography,
              background ambient music, interactive RSVP, and smooth transitions.
            </p>

            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-[#201814]/60">
                Interactive Sections
              </h3>
              <ul className="grid grid-cols-2 gap-3 text-sm text-[#201814]">
                {template.sections.map((section) => (
                  <li key={section} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#DCA963]" />
                    <span className="capitalize">{section} Section</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white border border-[#201814]/10 rounded-2xl p-8 text-center space-y-6 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-[#DCA963]/15 text-[#DCA963] flex items-center justify-center mx-auto">
              <Sparkles size={24} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#201814]">
              Start with {template.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Customize photos, couple names, venue map, background audio & video, and live countdown directly in our visual editor.
            </p>
            <Link
              to="/client/templates"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#201814] hover:bg-[#DCA963] text-white hover:text-[#201814] px-8 py-3.5 text-xs font-bold tracking-[0.2em] uppercase rounded-xl transition-all shadow-sm"
            >
              Customize in Studio <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
