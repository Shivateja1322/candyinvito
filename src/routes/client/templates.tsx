import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { invitationRepository } from "../../lib/repositories";
import { useAuth } from "../../lib/auth-context";
import { toast } from "sonner";
import { useState } from "react";
import { themeCapabilities } from "../../templates/TemplateRegistry";
import { Sparkles, ArrowRight, Loader2, Check } from "lucide-react";

export const Route = createFileRoute("/client/templates")({
  component: ClientTemplatesComponent,
});

function ClientTemplatesComponent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState<string | null>(null);

  const createInvitationFromTemplate = async (templateId: string) => {
    setIsCreating(templateId);
    try {
      if (!user) throw new Error("No user");

      let newInv: any;
      try {
        newInv = await invitationRepository.create(user.id, "New Couple", templateId);
      } catch (dbErr: any) {
        // DB rejected us (RLS / missing user row) — create locally and navigate anyway
        const slug = crypto.randomUUID().split("-")[0];
        const localRecord = {
          id: crypto.randomUUID(),
          client_id: user.id,
          couple_names: "New Couple",
          template_id: templateId,
          slug,
          content: {},
          status: "Draft",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        try {
          const existing = JSON.parse(localStorage.getItem("local_invitations") || "{}");
          existing[slug] = localRecord;
          localStorage.setItem("local_invitations", JSON.stringify(existing));
        } catch (_) {}
        newInv = localRecord;
      }

      toast.success("Theme selected! Launching visual builder...");
      navigate({ to: `/client/builder/${newInv.slug}` });
    } catch (err: any) {
      console.error("Create error:", err);
      toast.error("Failed to create invitation: " + (err.message || "Unknown error"));
      setIsCreating(null);
    }
  };

  // Get only the real themes, filtering out the "default" fallback
  const themes = Object.values(themeCapabilities).filter((t) => t.id !== "default");

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto font-sans animate-fade-in pb-16">
      {/* Header */}
      <div className="mb-10 sm:mb-12 text-center max-w-3xl mx-auto">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#DCA963] font-bold mb-2 flex items-center justify-center gap-1.5">
          <Sparkles size={13} className="text-[#DCA963]" /> The Atelier Collection
        </p>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#201814] tracking-tight mb-4">
          Bespoke Theme Library
        </h1>
        <p className="text-[#201814]/70 text-sm sm:text-base leading-relaxed">
          Select a signature foundation for your wedding invitation. Each theme features handcrafted typography, interactive schedule, video hero, and audio integration.
        </p>
      </div>

      {/* Themes Grid */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        {themes.map((theme) => {
          // Extract features from sections (ignoring hero/couple/footer)
          const features = theme.sections
            .map((s) => s.label)
            .filter((label) => !["Hero", "Couple", "Footer"].includes(label));

          const isLaunching = isCreating === theme.id;

          return (
            <article
              key={theme.id}
              className="group flex flex-col md:flex-row bg-white border border-black/10 rounded-3xl shadow-xs hover:shadow-xl transition-all duration-500 overflow-hidden cursor-pointer"
              onClick={() => !isCreating && createInvitationFromTemplate(theme.id)}
            >
              <div className="w-full md:w-2/5 aspect-[4/3] md:aspect-auto bg-[#1C1C1E] relative overflow-hidden shrink-0">
                {theme.thumbnail ? (
                  <img
                    src={theme.thumbnail}
                    alt={theme.name}
                    className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-700"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/30 to-transparent z-10 flex items-end md:items-center p-6">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-[0.22em] text-[#DCA963] block mb-1">
                      {theme.styleCategory}
                    </span>
                    <span className="font-serif text-2xl font-bold text-white leading-tight drop-shadow-md">
                      {theme.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex flex-col justify-between flex-1 space-y-6">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="font-serif text-2xl font-bold text-[#201814]">
                      {theme.name}
                    </h2>
                    <span className="bg-[#DCA963]/15 text-[#201814] px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold rounded-full border border-[#DCA963]/30">
                      {theme.styleCategory}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#201814]/70 mt-2">
                    {theme.description}
                  </p>

                  <div className="mt-6">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#201814]/50 mb-2">
                      Interactive Features Included
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#201814]">
                      {features.length > 0 ? (
                        features.map((f) => (
                          <span
                            key={f}
                            className="bg-[#FAF9F6] border border-black/5 px-2.5 py-1 rounded-lg flex items-center gap-1"
                          >
                            <Check size={11} className="text-[#DCA963]" /> {f}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-black/50">Minimal layout</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={isLaunching}
                    className="w-full bg-[#141210] hover:bg-[#DCA963] hover:text-[#141210] text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.18em] transition-all shadow-xs flex items-center justify-center gap-2 group-hover:bg-[#DCA963] group-hover:text-[#141210]"
                  >
                    {isLaunching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Launching Studio...</span>
                      </>
                    ) : (
                      <>
                        <span>Customize in Studio</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
