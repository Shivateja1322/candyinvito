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
} from "lucide-react";
import { DeploymentRequest, Invitation } from "../../lib/types";

export const Route = createFileRoute("/client/deployments")({
  component: ClientDeploymentsPage,
});

function ClientDeploymentsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<(DeploymentRequest & { invitation?: Invitation })[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-fade-in font-sans">
      <header className="pb-6 border-b border-black/10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#201814]/50 font-bold mb-1">
            Client Portal
          </p>
          <h1 className="text-3xl font-display font-medium text-[#201814]">
            Deployments & Hosting
          </h1>
          <p className="text-black/50 text-sm mt-1">
            Track custom domain publishing, hosting approvals, and live links for your guests.
          </p>
        </div>
        <Link
          to="/client/templates"
          className="inline-flex items-center gap-2 bg-[#201814] hover:bg-[#382B23] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
        >
          <Plus size={14} /> Create New Invitation
        </Link>
      </header>

      {/* Deployment History Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <h2 className="text-lg font-serif font-medium text-[#201814] flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#DCA963]" /> Hosting Status & Domains
          </h2>
          <span className="text-xs text-black/50 font-medium">
            {requests.length} Deployment Requests
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#DCA963]" />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center">
            <div className="h-12 w-12 rounded-full bg-[#DCA963]/10 flex items-center justify-center mx-auto mb-4 text-[#DCA963]">
              <Globe size={24} />
            </div>
            <h3 className="text-lg font-serif font-medium text-[#201814]">No deployments requested yet</h3>
            <p className="text-xs text-black/50 mt-1 max-w-sm mx-auto mb-6">
              When you design your wedding invitation in the builder, click Publish to request custom hosting.
            </p>
            <Link
              to="/client"
              className="inline-block bg-[#201814] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#DCA963] transition-colors"
            >
              Go to My Invitations
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 bg-[#FAF9F6] text-[10px] font-bold tracking-widest uppercase text-black/50">
                  <th className="px-6 py-4">Request Date</th>
                  <th className="px-6 py-4">Invitation</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Live Link & Expiry</th>
                  <th className="px-6 py-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-sm">
                {requests.map((req) => {
                  const invSlug = req.invitation?.slug;
                  const liveUrl = invSlug
                    ? `${typeof window !== "undefined" ? window.location.origin : ""}/i/${invSlug}`
                    : "";
                  const previewUrl = invSlug ? `/i/${invSlug}?mode=preview` : "";

                  return (
                    <tr key={req.id} className="hover:bg-[#FAF9F6]/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-black/60">
                        {new Date(req.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm text-[#201814]">
                          {req.invitation?.couple_names || req.invitation?.title || "Wedding Invitation"}
                        </div>
                        <div className="text-xs text-black/40 font-mono">
                          /i/{req.invitation?.slug}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            req.status === "HOSTED"
                              ? "bg-indigo-100 text-indigo-800"
                              : req.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : req.status === "PENDING"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {req.status === "HOSTED" && <Globe size={11} />}
                          {req.status === "APPROVED" && <CheckCircle2 size={11} />}
                          {req.status === "PENDING" && <Clock size={11} />}
                          {req.status === "REJECTED" && <XCircle size={11} />}
                          {req.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {req.status === "HOSTED" && (
                          <div className="flex flex-col gap-1">
                            {liveUrl && (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-indigo-900 font-semibold truncate max-w-[200px]">
                                  {liveUrl}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(liveUrl)}
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
                          <span className="text-blue-700 text-xs">
                            Submitted to admin — pending review
                          </span>
                        )}

                        {req.status === "APPROVED" && (
                          <span className="text-emerald-700 font-medium text-xs">
                            Approved ✓ — Admin is provisioning your live link
                          </span>
                        )}

                        {req.status === "REJECTED" && (
                          <span className="text-rose-600 text-xs">
                            Reason: {req.rejection_reason || "Please contact admin"}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {previewUrl && (
                            <a
                              href={previewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Eye size={13} /> Preview
                            </a>
                          )}

                          {req.status === "HOSTED" && liveUrl && (
                            <a
                              href={liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-white bg-[#201814] hover:bg-[#DCA963] px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                            >
                              <ExternalLink size={13} /> Open Live
                            </a>
                          )}
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
      <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-serif font-medium text-[#201814]">Your Saved Invitations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invitations.map((inv) => {
            const hasPendingOrHosted = requests.some(
              (r) =>
                r.invitation_id === inv.id &&
                (r.status === "PENDING" || r.status === "HOSTED" || r.status === "APPROVED"),
            );

            return (
              <div
                key={inv.id}
                className="p-5 border border-black/10 rounded-2xl flex flex-col justify-between gap-4 bg-[#FAF9F6]/40"
              >
                <div>
                  <div className="font-semibold text-sm text-[#201814]">
                    {inv.couple_names || inv.title || "Wedding Invitation"}
                  </div>
                  <div className="text-xs text-black/50 font-mono mt-0.5">
                    /i/{inv.slug}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-black/5">
                  <Link
                    to={`/client/builder/${inv.slug}`}
                    className="text-xs text-[#DCA963] hover:underline font-bold uppercase tracking-wider"
                  >
                    Edit Design
                  </Link>

                  {!hasPendingOrHosted ? (
                    <button
                      onClick={() => handleRequestDeployment(inv.id)}
                      disabled={requestingId === inv.id}
                      className="text-xs bg-[#201814] hover:bg-[#DCA963] text-white px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {requestingId === inv.id ? "Submitting..." : "Publish & Host"}
                    </button>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                      Submitted
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
