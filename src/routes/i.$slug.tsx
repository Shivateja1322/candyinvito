import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Loader2 } from "lucide-react";
import { TemplateRenderer } from "../templates/TemplateRegistry";

export const Route = createFileRoute("/i/$slug")({
  component: InvitationRenderer,
  errorComponent: ({ error }: { error: any }) => {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-display space-y-6 p-8">
        <div className="text-center w-full max-w-2xl">
          <h1 className="text-xl mb-2 text-red-400/80">Template Error</h1>
          <p className="text-white/40 tracking-widest uppercase text-[10px]">
            Failed to render this template
          </p>
          <div className="mt-8 bg-white/5 p-4 rounded text-left overflow-auto border border-red-500/30 text-red-300 font-mono text-xs max-h-64 break-words">
            <p className="font-bold">{error?.message || "Unknown error"}</p>
            <pre className="mt-2 whitespace-pre-wrap">{error?.stack}</pre>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="border border-white/20 px-6 py-2 uppercase tracking-widest text-xs hover:bg-white/10 transition-colors rounded-full"
        >
          Reload Frame
        </button>
      </div>
    );
  },
});

function InvitationRenderer() {
  const { slug } = Route.useParams();
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {

      try {
        const { data: inv, error } = await supabase
          .from("invitations")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error || !inv) {
          setError("404");
          return;
        }
        
        // Is it being previewed by admin/client? 
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        if (mode !== 'preview') {
          // Check if HOSTED via deployment_requests (the primary hosting mechanism)
          const { data: req } = await supabase.from("deployment_requests").select("*").eq("invitation_id", inv.id).eq("status", "HOSTED").maybeSingle();
          const invIsPublished = inv.status === "Published" || inv.status === "PUBLISHED";
          if (!req && !invIsPublished) {
             setError("UNPUBLISHED");
             return;
          }
          if (req && req.expires_at && new Date(req.expires_at) < new Date()) {
             setError("EXPIRED");
             return;
          }
        }

        setInvitation(inv);

      } catch (err) {

        // Fallback to local storage for local previews!
        const localInvites = JSON.parse(localStorage.getItem("local_invitations") || "{}");
        if (localInvites[slug]) {
          setInvitation(localInvites[slug]);
        } else {
          setError("Invitation not found");
        }
      }
    };

    fetchInvitation();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-display">
        <div className="text-center">
          <h1 className="text-2xl mb-2">404</h1>
          <p className="text-white/50 tracking-widest uppercase text-xs">Invitation Not Found</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
      </div>
    );
  }

  const isBuilderMode =
    typeof window !== "undefined" && window.location.search.includes("mode=builder");

  // Allow previewing local drafts or builder mode
  // DB status is 'Published' (per CHECK constraint in schema)
  const isPublished = invitation.status === "Published" || invitation.status === "PUBLISHED";
  if (!invitation.client_id && !isPublished) {
    // If there's no client_id, it's likely a local draft. We let them see it!
  } else if (!isPublished && !isBuilderMode) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-display">
        <div className="text-center space-y-4">
          <h1 className="text-3xl text-amber-500">{invitation.couple_names}</h1>
          <p className="text-white/50 tracking-widest uppercase text-xs">
            This invitation is not yet published
          </p>
        </div>
      </div>
    );
  }

  // --- Dynamic Template Loading ---
  // In a full implementation, we would lazy load the specific template component based on invitation.template_id
  // e.g. if template_id === 'luxurious-1', render <LuxuriousTemplate data={invitation} />

  return (
    <div className="min-h-screen w-full">
      <TemplateRenderer
        templateId={invitation.template_id}
        data={invitation.content || {}}
        invitationId={invitation.id}
      />
    </div>
  );
}
