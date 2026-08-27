import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { invitationRepository } from "../../lib/repositories";
import { useAuth } from "../../lib/auth-context";
import { toast } from "sonner";
import { useState } from "react";
import { themeCapabilities } from "../../templates/TemplateRegistry";

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
      
      const newInv = await invitationRepository.create(user.id, "New Couple", templateId);
      
      toast.success("Theme selected! Launching builder...");
      navigate({ to: `/client/builder/${newInv.slug}` });
    } catch (err: any) {
      console.error("Create error:", err);
      toast.error("Failed to create invitation: " + (err.message || "Unknown error"));
      setIsCreating(null);
    }
  };

  // Get only the 10 real themes, filtering out the "default" fallback
  const themes = Object.values(themeCapabilities).filter((t) => t.id !== "default");

  return (
    <div className="p-10 animate-fade-in w-full max-w-7xl mx-auto font-sans">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-display font-medium text-[#201814] tracking-tight mb-4">
          The Theme Library
        </h2>
        <p className="text-[#201814]/60 text-lg">
          Select a premium theme as the foundation for your wedding invitation. Each theme features
          its own unique architecture and specialized customization options.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {themes.map((theme) => {
          // Extract features from sections (ignoring hero/couple/footer)
          const features = theme.sections
            .map((s) => s.label)
            .filter((label) => !["Hero", "Couple", "Footer"].includes(label));

          return (
            <article
              key={theme.id}
              className="group flex flex-col md:flex-row bg-white border border-black/5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => createInvitationFromTemplate(theme.id)}
            >
              <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto bg-[#1C1C1E] relative overflow-hidden shrink-0">
                {theme.thumbnail ? (
                  <img 
                    src={theme.thumbnail} 
                    alt={theme.name} 
                    className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-700"
                  />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-20">
                  <span className="font-serif text-3xl text-[#DCA963] uppercase tracking-widest drop-shadow-md">
                    {theme.name}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
              </div>

              <div className="p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-2xl font-bold text-[#201814] uppercase tracking-wider">
                      {theme.name}
                    </h3>
                    <span className="bg-[#F8F9FA] px-3 py-1 text-[10px] uppercase tracking-widest font-bold text-[#DCA963] rounded-full border border-[#DCA963]/30">
                      {theme.styleCategory}
                    </span>
                  </div>
                  <p className="text-[#201814]/70 mt-3">{theme.description}</p>

                  <div className="mt-8">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#201814]/40 mb-3">
                      Features
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm font-medium text-[#201814]">
                      {features.length > 0 ? features.join(" Â· ") : "Minimal layout"}
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <button
                    disabled={isCreating === theme.id}
                    className="w-full bg-[#1C1C1E] text-white px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#DCA963] transition-colors"
                  >
                    {isCreating === theme.id ? "Launching..." : "Customize this theme"}
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
