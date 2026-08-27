import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "../components/site/SiteLayout";
import { templateRepository } from "../lib/repositories";
import { Skeleton } from "../components/ui/skeleton";

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
          <Skeleton className="mx-auto mt-12 aspect-video w-full" />
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
          <span className="eyebrow block text-gold">{template.style}</span>
          <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl">{template.name}</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">{template.tagline}</p>
        </header>

        <div className="mt-16 overflow-hidden bg-secondary shadow-sm">
          <div className="aspect-[16/9] w-full flex items-center justify-center border border-border">
            <span aria-hidden className="text-gold opacity-50 scale-150">
              ✦
            </span>
            <p className="absolute text-sm tracking-[0.2em] uppercase text-muted-foreground">
              Preview Artwork
            </p>
          </div>
        </div>

        <div className="mt-20 grid gap-16 md:grid-cols-2 md:items-start">
          <div className="space-y-6">
            <h2 className="font-display text-3xl">Design Elements</h2>
            <p className="text-muted-foreground leading-relaxed">
              Every detail is meticulously crafted. The <strong>{template.name}</strong> collection
              provides a robust foundation for your digital invitation, featuring elegant typography
              and smooth transitions.
            </p>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wide uppercase">Included Sections</h3>
              <ul className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                {template.sections.map((section) => (
                  <li key={section} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold/50" />
                    <span className="capitalize">{section}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-card border border-border p-8 text-center space-y-6">
            <h3 className="font-display text-2xl">Start with this design</h3>
            <p className="text-sm text-muted-foreground">
              Contact our studio to reserve your timeline and request a private preview of this
              design customized for your wedding.
            </p>
            <Link
              to="/contact"
              className="inline-block w-full bg-ink px-8 py-3.5 text-xs tracking-[0.2em] text-ink-foreground uppercase transition-opacity hover:opacity-90"
            >
              Request Preview
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
