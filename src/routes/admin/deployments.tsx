import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase";
import { deploymentRequestRepository, invitationRepository } from "../../lib/repositories";
import { toast } from "sonner";
import { Loader2, Search, Filter, Eye, CheckCircle2, XCircle } from "lucide-react";
import { DeploymentRequest, Invitation } from "../../lib/types";

export const Route = createFileRoute("/admin/deployments")({
  component: DeploymentsPage,
});

function DeploymentsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<(DeploymentRequest & { invitation?: Invitation })[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [hostId, setHostId] = useState<string | null>(null);
  const [hostDuration, setHostDuration] = useState("30");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await deploymentRequestRepository.list();
      
      const enriched = await Promise.all(
        data.map(async (req) => {
          try {
            const inv = await invitationRepository.get(req.invitation_id);
            return { ...req, invitation: inv || undefined };
          } catch {
            return req;
          }
        })
      );
      setRequests(enriched);
    } catch (err: any) {
      toast.error(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (req: DeploymentRequest) => {
    if (!window.confirm("Approve this deployment request? The client will be notified that it is approved and awaiting hosting.")) return;
    try {
      await deploymentRequestRepository.updateStatus(req.id, "APPROVED", user?.id || "");
      toast.success("Request approved.");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve request.");
    }
  };

  
  const handleHost = async (reqId: string) => {
    if (!window.confirm(`Host this invitation for ${hostDuration} days?`)) return;
    try {
      const hostedAt = new Date();
      const expiresAt = new Date(hostedAt.getTime() + parseInt(hostDuration) * 24 * 60 * 60 * 1000);
      await deploymentRequestRepository.updateStatus(reqId, "HOSTED", user?.id || "", undefined, {
        hosted_at: hostedAt.toISOString(),
        expires_at: expiresAt.toISOString()
      });
      toast.success("Invitation is now hosted!");
      setHostId(null);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to host invitation.");
    }
  };

  const handleReject = async (reqId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    if (!window.confirm("Reject this deployment request?")) return;
    try {
      await deploymentRequestRepository.updateStatus(reqId, "REJECTED", user?.id || "", rejectReason);
      toast.success("Request rejected.");
      setRejectId(null);
      setRejectReason("");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject request.");
    }
  };

  const filteredRequests = requests.filter(req => {
    if (statusFilter !== "ALL" && req.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        req.id.toLowerCase().includes(term) ||
        req.requested_by.toLowerCase().includes(term) ||
        (req.invitation?.couple_names ?? "").toLowerCase().includes(term) ||
        (req.invitation?.title ?? "").toLowerCase().includes(term) ||
        (req.invitation?.slug ?? "").toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="pb-6 border-b border-[#201814]/5 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-medium text-[#201814]">Deployment Requests</h1>
          <p className="text-[#201814]/50 mt-1 font-light">Approve or reject client deployment requests.</p>
        </div>
      </header>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#201814]/40" />
          <input
            type="text"
            placeholder="Search by client, invitation, or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#201814]/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#201814]/30 placeholder:text-[#201814]/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-white border border-[#201814]/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#201814]/30"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="HOSTED">Hosted</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="rounded-xl border border-[#201814]/5 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#201814]/20" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-[#201814]/5 flex items-center justify-center mx-auto mb-4">
              <Filter className="h-6 w-6 text-[#201814]/40" />
            </div>
            <h3 className="text-lg font-medium text-[#201814]">No requests found</h3>
            <p className="text-sm text-[#201814]/50 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#201814]/5 bg-[#FDFBF7]">
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Date</th>
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Invitation</th>
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Client ID</th>
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Status</th>
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201814]/5">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#FDFBF7]/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-[#201814]">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {req.invitation ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[#201814]">{req.invitation.couple_names || req.invitation.title || "Untitled"}</span>
                          <span className="text-xs text-[#201814]/50">/{req.invitation.slug}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#201814]/40 italic">Unknown Invitation</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#201814]/70 font-light font-mono">
                      {req.requested_by.substring(0,8)}...
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                          req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                          req.status === 'HOSTED' ? 'bg-indigo-100 text-indigo-700' : 
                          'bg-rose-100 text-rose-700'}`}
                      >
                        {req.status}
                      </span>
                      
                      {req.expires_at && (
                        <p className="text-[10px] text-indigo-600 mt-1">
                          Expires: {new Date(req.expires_at).toLocaleDateString()}
                        </p>
                      )}

                      {req.rejection_reason && (
                        <p className="text-[10px] text-rose-600 mt-1 max-w-[200px] truncate" title={req.rejection_reason}>
                          Reason: {req.rejection_reason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.invitation && (
                          <a 
                            href={`/i/${req.invitation.slug}?mode=preview`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-[#201814]/40 hover:text-[#201814] hover:bg-[#201814]/5 rounded transition-colors"
                            title="Preview Invitation"
                          >
                            <Eye size={16} />
                          </a>
                        )}
                        
                        
                        {req.status === "APPROVED" && hostId !== req.id && (
                          <button 
                            onClick={() => setHostId(req.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                          >
                            Host Invitation
                          </button>
                        )}
                        
                        {hostId === req.id && (
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#201814]/60">Duration (days):</span>
                              <select 
                                value={hostDuration} 
                                onChange={e => setHostDuration(e.target.value)}
                                className="text-xs border border-indigo-200 focus:border-indigo-400 p-1 rounded outline-none"
                              >
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                                <option value="90">90 Days</option>
                                <option value="365">1 Year</option>
                              </select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => setHostId(null)} 
                                className="text-xs text-[#201814]/50 hover:text-[#201814]"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleHost(req.id)} 
                                className="text-xs bg-indigo-600 text-white font-medium px-2 py-1 rounded hover:bg-indigo-700"
                              >
                                Confirm Host
                              </button>
                            </div>
                          </div>
                        )}

                        {req.status === "PENDING" && rejectId !== req.id && (
                          <>
                            <button 
                              onClick={() => setRejectId(req.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={() => handleApprove(req)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                            >
                              Approve
                            </button>
                          </>
                        )}
                        
                        {rejectId === req.id && (
                          <div className="flex flex-col items-end gap-2">
                            <input 
                              type="text" 
                              placeholder="Reason for rejection..." 
                              className="text-xs border border-rose-200 focus:border-rose-400 p-1.5 rounded w-48 outline-none" 
                              value={rejectReason} 
                              onChange={e => setRejectReason(e.target.value)} 
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => { setRejectId(null); setRejectReason(""); }} 
                                className="text-xs text-[#201814]/50 hover:text-[#201814]"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleReject(req.id)} 
                                className="text-xs bg-rose-600 text-white font-medium px-2 py-1 rounded hover:bg-rose-700"
                              >
                                Confirm Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

