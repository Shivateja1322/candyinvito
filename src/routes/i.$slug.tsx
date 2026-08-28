import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import { deploymentRequestRepository, invitationRepository } from "../lib/repositories";
import { Loader2, ArrowLeft, UploadCloud, CheckCircle2, Globe, Clock } from "lucide-react";
import { toast } from "sonner";
import { TemplateRenderer } from "../templates/TemplateRegistry";

const serverGetPublicInvitation = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async (ctx) => {
    const { slug, supabaseUrl, supabaseKey } = ctx.data || (ctx as any);
    const client = createClient(supabaseUrl, supabaseKey);

    const { data: inv, error: invErr } = await client
      .from("invitations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!inv || invErr) {
      return { invitation: null, error: invErr?.message || "Invitation not found" };
    }

    // Check deployment status
    const { data: dep } = await client
      .from("deployment_requests")
      .select("status, expires_at, hosted_at")
      .eq("invitation_id", inv.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      invitation: inv,
      deployment: dep || null,
    };
  });

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
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<string | null>(null);

  const isPreviewMode =
    typeof window !== "undefined" &&
    (window.location.search.includes("mode=preview") ||
      window.location.search.includes("mode=builder"));

  const fetchInvitation = async () => {
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // 1. Try server function to fetch regardless of anonymous RLS policies
      try {
        const res = await serverGetPublicInvitation({
          data: { slug, supabaseUrl: url, supabaseKey: key },
        });

        if (res?.invitation) {
          setInvitation(res.invitation);
          if (res.deployment?.status) {
            setDeploymentStatus(res.deployment.status);
          }
          return;
        }
      } catch (srvErr) {
        console.warn("Server fetch warning, attempting direct client fetch:", srvErr);
      }

      // 2. Client fallback fetch
      const { data: inv, error: fetchErr } = await supabase
        .from("invitations")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (inv) {
        setInvitation(inv);

        try {
          const { data: dep } = await supabase
            .from("deployment_requests")
            .select("status")
            .eq("invitation_id", inv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (dep) {
            setDeploymentStatus(dep.status);
          }
        } catch {}

        return;
      }

      // 3. Check local storage fallback
      const localInvites = JSON.parse(localStorage.getItem("local_invitations") || "{}");
      if (localInvites[slug]) {
        setInvitation(localInvites[slug]);
        return;
      }

      setError("404");
    } catch (err) {
      console.error("Fetch error:", err);
      const localInvites = JSON.parse(localStorage.getItem("local_invitations") || "{}");
      if (localInvites[slug]) {
        setInvitation(localInvites[slug]);
      } else {
        setError("404");
      }
    }
  };

  useEffect(() => {
    fetchInvitation();
  }, [slug]);

  const handlePublish = async () => {
    if (!invitation) return;
    setIsPublishing(true);
    try {
      const userId = user?.id || invitation.client_id;
      if (!userId) {
        toast.error("Please log in to publish your invitation.");
        return;
      }

      // 1. Submit deployment request
      await deploymentRequestRepository.request(invitation.id, userId);

      // 2. Update invitation status to Published
      await invitationRepository.update(invitation.id, { status: "Published" });

      setDeploymentStatus("PENDING");
      setInvitation((prev: any) => ({ ...prev, status: "Published" }));
      toast.success("Deployment requested! Your invitation has been submitted for admin approval.");
    } catch (err: any) {
      if (err.message?.includes("already pending")) {
        toast.info("A deployment request is already pending review with the admin.");
        setDeploymentStatus("PENDING");
      } else {
        toast.error(err.message || "Failed to submit deployment request.");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#201814] text-[#FAF9F6] flex flex-col items-center justify-center font-sans p-6 text-center">
        <div className="max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
          <Globe className="w-12 h-12 text-[#DCA963] mx-auto mb-4" />
          <h1 className="text-3xl font-display font-medium mb-2">Invitation Not Found</h1>
          <p className="text-white/60 text-sm mb-6">
            The link you followed may be invalid or the invitation is still being prepared.
          </p>
          <a
            href="/"
            className="inline-block bg-[#DCA963] text-[#201814] font-bold px-6 py-2.5 rounded-full text-xs uppercase tracking-widest hover:bg-[#C99750] transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-[#201814] text-[#FAF9F6] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#DCA963]" />
      </div>
    );
  }

  const isPublished =
    invitation.status === "Published" ||
    invitation.status === "PUBLISHED" ||
    deploymentStatus === "HOSTED" ||
    deploymentStatus === "APPROVED";

  // If not published and NOT in preview mode, show friendly unpublished status
  if (!isPublished && !isPreviewMode) {
    return (
      <div className="min-h-screen bg-[#201814] text-[#FAF9F6] flex flex-col items-center justify-center font-sans p-6 text-center">
        <div className="max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
          <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-3xl font-display font-medium text-amber-300 mb-2">
            {invitation.couple_names || "Wedding Invitation"}
          </h1>
          <p className="text-white/70 text-sm mb-6">
            This invitation is currently in preparation and has not yet been published for guests.
          </p>
          {user && (
            <Link
              to={`/client/builder/${invitation.slug}`}
              className="inline-block bg-[#DCA963] text-[#201814] font-bold px-6 py-2.5 rounded-full text-xs uppercase tracking-widest hover:bg-[#C99750] transition-colors"
            >
              Open in Studio Builder
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      {/* Floating Preview & Publish Banner (when in preview mode or for owner/admin) */}
      {isPreviewMode && (
        <header className="sticky top-0 z-50 bg-[#201814]/95 text-[#FAF9F6] backdrop-blur-md px-6 py-3 border-b border-white/10 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <Link
              to={`/client/builder/${invitation.slug}`}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#DCA963] hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back to Editor
            </Link>
            <div className="h-4 w-px bg-white/20 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/70">
              <span>Preview Mode:</span>
              <span className="font-semibold text-white">{invitation.couple_names || "Wedding Invitation"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {deploymentStatus === "HOSTED" ? (
              <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                <CheckCircle2 size={12} /> Hosted & Live
              </span>
            ) : deploymentStatus === "PENDING" ? (
              <span className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                <Clock size={12} /> Approval Pending
              </span>
            ) : deploymentStatus === "APPROVED" ? (
              <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                <CheckCircle2 size={12} /> Approved
              </span>
            ) : (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex items-center gap-2 bg-[#DCA963] hover:bg-[#C99750] text-[#201814] font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest transition-colors shadow-sm disabled:opacity-50"
              >
                {isPublishing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UploadCloud size={14} />
                )}
                {isPublishing ? "Requesting..." : "Publish / Request Hosting"}
              </button>
            )}
          </div>
        </header>
      )}

      {/* Render Selected Theme */}
      <TemplateRenderer
        templateId={invitation.template_id}
        data={invitation.content || {}}
        invitationId={invitation.id}
      />
    </div>
  );
}
