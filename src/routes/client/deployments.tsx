import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase";
import { deploymentRequestRepository, invitationRepository } from "../../lib/repositories";
import { toast } from "sonner";
import {
  Loader2,
  Globe,
  Eye,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Copy,
  Calendar,
  Sparkles,
  Trash2,
  MessageCircle,
  Share2,
  Edit3,
} from "lucide-react";
import { DeploymentRequest, Invitation } from "../../lib/types";
import {
  formatWeddingShareMessage,
  extractWeddingShareDetails,
} from "../../lib/weddingShare";
import { WeddingShareModal } from "../../components/premium/WeddingShareModal";

export const Route = createFileRoute("/client/deployments")({
  component: ClientDeploymentsPage,
});

function ClientDeploymentsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<(DeploymentRequest & { invitation?: Invitation })[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  // Modal for customizing/sharing wedding announcement text
  const [selectedShareInv, setSelectedShareInv] = useState<any>(null);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [reqData, invData] = await Promise.all([
        deploymentRequestRepository.list(user.id),
        invitationRepository.listByClient(user.id),
      ]);

      const enriched = await Promise.all(
        reqData.map(async (req) => {
          try {
            const inv = await invitationRepository.get(req.invitation_id);
            return { ...req, invitation: inv || undefined };
          } catch {
            return req;
          }
        }),
      );

      setRequests(enriched);
      setInvitations(invData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load deployment requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Enable realtime sync on deployment requests for this client
    const channel = supabase
      .channel("client-deployments-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "deployment_requests" }, () =>
        fetchData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleRequestDeployment = async (invId: string) => {
    if (!user) return;
    try {
      setRequestingId(invId);
      await deploymentRequestRepository.request(invId, user.id);
      await invitationRepository.update(invId, { status: "Published" });
      toast.success("Deployment requested! Your invitation was submitted for admin hosting.");
      fetchData();
    } catch (err: any) {
      if (err.message?.includes("already pending")) {
        toast.info("A deployment request is already pending for this invitation.");
      } else {
        toast.error(err.message || "Failed to request deployment");
      }
    } finally {
      setRequestingId(null);
    }
  };

  const handleDeleteDeployment = async (reqId: string, isHosted: boolean) => {
    const confirmMessage = isHosted
      ? "Delete this hosted deployment? The live link will be taken down and your invitation will return to Draft."
      : "Delete this deployment request?";

    if (!window.confirm(confirmMessage)) return;

    try {
      await deploymentRequestRepository.remove(reqId);
      toast.success(
        isHosted
          ? "Hosted deployment deleted and invitation unhosted."
          : "Deployment request deleted.",
      );
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete deployment request.");
    }
  };

  const copyToClipboard = async (text: string, label: string = "Link") => {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
        return;
      }
    } catch (e) {}

    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success(`${label} copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy.");
    }
  };

  const hostedRequests = requests.filter((r) => r.status === "HOSTED");

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-sans pb-16">
      {/* Header */}
      <header className="pb-6 border-b border-black/10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#201814]/50 font-bold mb-1.5 flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#DCA963]" /> Live Hosting & Domains
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#201814] tracking-tight">
            Deployments & Hosting
          </h1>
          <p className="text-black/50 text-xs sm:text-sm mt-1">
            Track hosting approvals, live guest invitation links, and luxury social announcements.
          </p>
        </div>
        <Link
          to="/client/templates"
          className="inline-flex items-center gap-2 bg-[#141210] hover:bg-[#DCA963] hover:text-[#141210] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
        >
          <Plus size={14} /> Create New Invitation
        </Link>
      </header>

      {/* Prominent Luminous Luxury Celebration Cards for Hosted Invitations */}
      {hostedRequests.length > 0 && (
        <div className="space-y-6">
          {hostedRequests.map((hostedReq) => {
            const inv = hostedReq.invitation;
            const invSlug = inv?.slug;
            const liveUrl = invSlug
              ? `${typeof window !== "undefined" ? window.location.origin : ""}/i/${invSlug}`
              : "";

            const shareDetails = extractWeddingShareDetails(inv, typeof window !== "undefined" ? window.location.origin : "");
            const formattedMessage = formatWeddingShareMessage(shareDetails);

            return (
              <div
                key={`congrats-${hostedReq.id}`}
                className="bg-gradient-to-br from-white via-[#FCFAF7] to-[#F5EFEB] text-[#201814] rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-[#DCA963]/30 relative overflow-hidden transition-all duration-300"
              >
                {/* Background Watermark Accent */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-[#DCA963]">
                  <Sparkles size={180} />
                </div>

                <div className="relative z-10 space-y-6">
                  {/* Top Status Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-[#DCA963]/20 text-[#201814] border border-[#DCA963]/40 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                        <Sparkles size={11} className="text-[#DCA963]" /> Hosted & Live
                      </span>
                      {hostedReq.expires_at && (
                        <span className="text-xs text-black/60 font-semibold">
                          Valid until {new Date(hostedReq.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteDeployment(hostedReq.id, true)}
                      className="text-xs text-black/40 hover:text-rose-600 flex items-center gap-1 transition-colors"
                      title="Delete & Unhost Live Invitation"
                    >
                      <Trash2 size={13} /> Unhost
                    </button>
                  </div>

                  {/* Celebration Title */}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#201814] mb-2 tracking-tight">
                      🎉 Congratulations, {shareDetails.coupleNames}!
                    </h2>
                    <p className="text-black/70 text-xs sm:text-sm max-w-2xl leading-relaxed">
                      Your luxury wedding invitation is officially hosted and accessible to your guests.
                      You can share the ready-to-send invitation announcement message below via WhatsApp or SMS.
                    </p>
                  </div>

                  {/* Formatted WhatsApp Announcement Preview Box */}
                  <div className="bg-white border border-[#DCA963]/30 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-black/5 pb-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#DCA963] flex items-center gap-1">
                        <MessageCircle size={12} /> Ready-to-Send WhatsApp & SMS Announcement
                      </span>
                      <button
                        onClick={() => setSelectedShareInv(inv)}
                        className="text-[11px] font-bold text-[#201814] hover:text-[#DCA963] flex items-center gap-1 uppercase tracking-wider transition-colors"
                      >
                        <Edit3 size={12} /> Customize Text
                      </button>
                    </div>

                    <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#201814] leading-relaxed bg-[#FAF9F6] p-4 rounded-xl border border-black/5 select-text">
                      {formattedMessage}
                    </pre>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <button
                        onClick={() => copyToClipboard(formattedMessage, "Invitation announcement")}
                        className="bg-[#141210] hover:bg-[#DCA963] hover:text-[#141210] text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <Copy size={13} /> Copy Invitation Text
                      </button>

                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(formattedMessage)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-2xs"
                        title="Share directly on WhatsApp"
                      >
                        <MessageCircle size={14} /> Send via WhatsApp
                      </a>

                      <button
                        onClick={() => copyToClipboard(liveUrl, "Link")}
                        className="bg-white hover:bg-black/5 text-[#201814] border border-black/10 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Copy size={13} /> Copy Link Only
                      </button>

                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#DCA963] hover:bg-[#C99750] text-[#141210] font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-2xs ml-auto"
                      >
                        <ExternalLink size={13} /> View Live Invitation
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deployment History Table */}
      <div className="bg-white rounded-3xl border border-black/10 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/5 flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-[#201814] flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#DCA963]" /> Hosting Status & Domains
          </h2>
          <span className="text-xs text-black/50 font-semibold">
            {requests.length} Requests
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#DCA963]" />
            <span className="text-xs text-black/40">Loading deployment records...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 sm:p-16 text-center">
            <div className="h-12 w-12 rounded-full bg-[#DCA963]/10 flex items-center justify-center mx-auto mb-4 text-[#DCA963]">
              <Globe size={24} />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#201814]">No deployments requested yet</h3>
            <p className="text-xs text-black/50 mt-1 max-w-sm mx-auto mb-6 leading-relaxed">
              When you design your wedding invitation in the builder, click Publish to submit your request for live hosting.
            </p>
            <Link
              to="/client"
              className="inline-block bg-[#141210] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#DCA963] hover:text-[#141210] transition-colors shadow-xs"
            >
              Go to My Invitations
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-black/5 bg-[#FAF9F6] text-[10px] font-bold tracking-widest uppercase text-black/50">
                  <th className="px-5 py-4">Request Date</th>
                  <th className="px-5 py-4">Invitation</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Live Link & Expiry</th>
                  <th className="px-5 py-4 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-sm">
                {requests.map((req) => {
                  const invSlug = req.invitation?.slug;
                  const liveUrl = invSlug
                    ? `${typeof window !== "undefined" ? window.location.origin : ""}/i/${invSlug}`
                    : "";
                  const previewUrl = invSlug ? `/i/${invSlug}?mode=preview` : "";
                  const isHosted = req.status === "HOSTED";

                  return (
                    <tr key={req.id} className="hover:bg-[#FAF9F6]/50 transition-colors">
                      <td className="px-5 py-4 text-xs font-mono text-black/60">
                        {new Date(req.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-sm text-[#201814]">
                          {req.invitation?.couple_names || req.invitation?.title || "Wedding Invitation"}
                        </div>
                        <div className="text-xs text-black/40 font-mono mt-0.5">
                          /i/{req.invitation?.slug}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            req.status === "HOSTED"
                              ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                              : req.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : req.status === "PENDING"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {req.status === "HOSTED" && <Globe size={11} />}
                          {req.status === "APPROVED" && <CheckCircle2 size={11} />}
                          {req.status === "PENDING" && <Clock size={11} />}
                          {req.status === "REJECTED" && <XCircle size={11} />}
                          {req.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs">
                        {req.status === "HOSTED" && (
                          <div className="flex flex-col gap-1">
                            {liveUrl && (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-indigo-900 font-semibold truncate max-w-[180px]">
                                  {liveUrl}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(liveUrl, "Link")}
                                  className="p-1 text-[#DCA963] hover:text-[#201814] transition-colors"
                                  title="Copy Live Link"
                                >
                                  <Copy size={13} />
                                </button>
                              </div>
                            )}
                            {req.expires_at && (
                              <span className="text-[11px] text-black/50 flex items-center gap-1">
                                <Calendar size={11} /> Valid until: {new Date(req.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}

                        {req.status === "PENDING" && (
                          <span className="text-amber-800 font-medium text-xs">
                            Submitted to studio — pending review
                          </span>
                        )}

                        {req.status === "APPROVED" && (
                          <span className="text-emerald-800 font-medium text-xs">
                            Approved ✓ — Admin is provisioning your live link
                          </span>
                        )}

                        {req.status === "REJECTED" && (
                          <span className="text-rose-600 text-xs">
                            Reason: {req.rejection_reason || "Please update and resubmit"}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right pr-5">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {previewUrl && (
                            <a
                              href={previewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                            >
                              <Eye size={13} /> Preview
                            </a>
                          )}

                          {req.status === "HOSTED" && (
                            <button
                              onClick={() => setSelectedShareInv(req.invitation)}
                              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#141210] bg-[#DCA963]/20 hover:bg-[#DCA963] px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                              title="Open Share Studio"
                            >
                              <Share2 size={13} /> Share Text
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteDeployment(req.id, isHosted)}
                            className="p-1.5 text-black/40 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title={isHosted ? "Delete & Unhost Live Invitation" : "Delete Request"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invitations Ready to Deploy Section */}
      <div className="bg-white rounded-3xl border border-black/10 shadow-xs p-6 space-y-4">
        <h2 className="text-lg font-serif font-bold text-[#201814]">Your Saved Invitations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {invitations.map((inv) => {
            const hasPendingOrHosted = requests.some(
              (r) =>
                r.invitation_id === inv.id &&
                (r.status === "PENDING" || r.status === "HOSTED" || r.status === "APPROVED"),
            );

            return (
              <div
                key={inv.id}
                className="p-5 border border-black/10 rounded-2xl flex flex-col justify-between gap-4 bg-[#FAF9F6]/50 shadow-2xs"
              >
                <div>
                  <div className="font-bold text-sm text-[#201814]">
                    {inv.couple_names || inv.title || "Wedding Invitation"}
                  </div>
                  <div className="text-xs text-black/50 font-mono mt-0.5">
                    /i/{inv.slug}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-black/5">
                  <Link
                    to={`/client/builder/${inv.slug}`}
                    className="text-xs text-[#201814] hover:text-[#DCA963] font-bold uppercase tracking-wider"
                  >
                    Edit Design
                  </Link>

                  {!hasPendingOrHosted ? (
                    <button
                      onClick={() => handleRequestDeployment(inv.id)}
                      disabled={requestingId === inv.id}
                      className="text-xs bg-[#141210] hover:bg-[#DCA963] hover:text-[#141210] text-white px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-2xs"
                    >
                      {requestingId === inv.id ? "Submitting..." : "Publish & Host"}
                    </button>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full">
                      Submitted
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Wedding Share Modal */}
      {selectedShareInv && (
        <WeddingShareModal
          isOpen={!!selectedShareInv}
          onClose={() => setSelectedShareInv(null)}
          invitation={selectedShareInv}
        />
      )}
    </div>
  );
}
