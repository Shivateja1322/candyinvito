import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { deploymentRequestRepository, invitationRepository } from "../../lib/repositories";
import { toast } from "sonner";
import { Loader2, Globe, Eye, Plus, CheckCircle2, Clock, XCircle, ExternalLink } from "lucide-react";
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

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [reqData, invData] = await Promise.all([
        deploymentRequestRepository.list(user.id),
        invitationRepository.list(user.id)
      ]);

      const enriched = await Promise.all(
        reqData.map(async (req) => {
          try {
            const inv = await invitationRepository.get(req.invitation_id);
            return { ...req, invitation: inv || undefined };
          } catch {
            return req;
          }
        })
      );

      setRequests(enriched);
      setInvitations(invData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load deployment requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeployment = async (invId: string) => {
    if (!user) return;
    try {
      setRequestingId(invId);
      await deploymentRequestRepository.create({
        invitation_id: invId,
        requested_by: user.id,
        status: "PENDING",
      });
      toast.success("Deployment request submitted successfully!");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to request deployment");
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="pb-6 border-b border-[#201814]/10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-medium text-[#201814]">Deployments</h1>
          <p className="text-[#201814]/60 mt-1 font-light text-sm">
            Track your invitation hosting status and live domains.
          </p>
        </div>
        <Link
          to="/client/templates"
          className="inline-flex items-center gap-2 bg-[#201814] text-[#FDFBF7] px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold hover:bg-[#342820] transition-colors"
        >
          <Plus className="h-4 w-4" /> Create New Invitation
        </Link>
      </header>

      {/* Active Deployments Table */}
      <div className="bg-white rounded-2xl border border-[#201814]/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#201814]/5 flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#201814] flex items-center gap-2">
            <Globe className="h-5 w-5 text-amber-900/60" /> Deployment History
          </h2>
          <span className="text-xs text-[#201814]/50 font-medium">
            {requests.length} Total Requests
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#201814]/20" />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-900/5 flex items-center justify-center mx-auto mb-4">
              <Globe className="h-6 w-6 text-amber-900/40" />
            </div>
            <h3 className="text-base font-medium text-[#201814]">No deployments requested yet</h3>
            <p className="text-xs text-[#201814]/50 mt-1 max-w-sm mx-auto">
              Once you design an invitation in the builder, request deployment to make it live for your guests.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#201814]/5 bg-[#FDFBF7]/60 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/50">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Invitation</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Hosting Details</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201814]/5 text-sm">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#FDFBF7]/40 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-[#201814]/70">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#201814]">
                        {req.invitation?.couple_names || req.invitation?.title || "Wedding Invitation"}
                      </div>
                      <div className="text-xs text-[#201814]/50 font-mono">
                        /i/{req.invitation?.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          req.status === "HOSTED"
                            ? "bg-indigo-100 text-indigo-700"
                            : req.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-700"
                              : req.status === "PENDING"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {req.status === "HOSTED" && <Globe className="h-3 w-3" />}
                        {req.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                        {req.status === "PENDING" && <Clock className="h-3 w-3" />}
                        {req.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {req.status === "HOSTED" && req.expires_at && (
                        <div className="text-indigo-900 font-medium">
                          Active until {new Date(req.expires_at).toLocaleDateString()}
                        </div>
                      )}
                      {req.status === "PENDING" && (
                        <div className="text-amber-900/70 font-light">
                          Under administrator review
                        </div>
                      )}
                      {req.status === "APPROVED" && (
                        <div className="text-emerald-900 font-medium">
                          Approved — provisioning domain
                        </div>
                      )}
                      {req.status === "REJECTED" && (
                        <div className="text-rose-600 font-medium">
                          {req.rejection_reason || "Declined by admin"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.invitation && (
                        <a
                          href={`/i/${req.invitation.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-[#201814]/70 hover:text-[#201814] font-medium bg-[#201814]/5 hover:bg-[#201814]/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View Live
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invitations Ready to Deploy Section */}
      <div className="bg-white rounded-2xl border border-[#201814]/10 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-medium text-[#201814]">Your Saved Invitations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invitations.map((inv) => {
            const hasPendingOrHosted = requests.some(
              (r) => r.invitation_id === inv.id && (r.status === "PENDING" || r.status === "HOSTED" || r.status === "APPROVED")
            );

            return (
              <div key={inv.id} className="p-4 border border-[#201814]/10 rounded-xl flex flex-col justify-between gap-3 bg-[#FDFBF7]/30">
                <div>
                  <div className="font-semibold text-sm text-[#201814]">
                    {inv.couple_names || inv.title || "Wedding Invitation"}
                  </div>
                  <div className="text-xs text-[#201814]/50 font-mono mt-0.5">
                    /i/{inv.slug}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#201814]/5">
                  <Link
                    to="/client/builder/$slug"
                    params={{ slug: inv.slug }}
                    className="text-xs text-amber-900 hover:underline font-medium"
                  >
                    Edit in Builder
                  </Link>
                  {!hasPendingOrHosted ? (
                    <button
                      onClick={() => handleRequestDeployment(inv.id)}
                      disabled={requestingId === inv.id}
                      className="text-xs bg-[#201814] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {requestingId === inv.id ? "Submitting..." : "Deploy"}
                    </button>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                      Deployed
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
