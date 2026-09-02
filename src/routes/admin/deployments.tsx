import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase";
import { deploymentRequestRepository, invitationRepository } from "../../lib/repositories";
import { toast } from "sonner";
import {
  Loader2,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Globe,
  Clock,
  Copy,
  ExternalLink,
  Calendar,
  Send,
  Mail,
  Trash2,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { DeploymentRequest, Invitation } from "../../lib/types";
import {
  formatWeddingShareMessage,
  extractWeddingShareDetails,
} from "../../lib/weddingShare";

export const Route = createFileRoute("/admin/deployments")({
  component: DeploymentsPage,
});

function DeploymentsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<
    (DeploymentRequest & { invitation?: Invitation; clientEmail?: string; clientName?: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [hostId, setHostId] = useState<string | null>(null);
  const [hostDuration, setHostDuration] = useState("30");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Client notification modal state
  const [notifyModalData, setNotifyModalData] = useState<{
    requestId?: string;
    clientEmail: string;
    clientName: string;
    coupleNames: string;
    liveUrl: string;
    customMessage?: string;
  } | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [data, usersRes] = await Promise.all([
        deploymentRequestRepository.list(),
        supabase.from("users").select("id, email, name"),
      ]);

      const userMap = new Map<string, { email: string; name: string }>();
      (usersRes.data || []).forEach((u) => userMap.set(u.id, { email: u.email, name: u.name }));

      const enriched = await Promise.all(
        data.map(async (req) => {
          try {
            const inv = await invitationRepository.get(req.invitation_id);
            const clientInfo = userMap.get(req.requested_by);
            return {
              ...req,
              invitation: inv || undefined,
              clientEmail: clientInfo?.email || "",
              clientName: clientInfo?.name || "",
            };
          } catch {
            return req;
          }
        }),
      );
      setRequests(enriched);
    } catch (err: any) {
      toast.error(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Enable realtime sync on deployment requests
    const channel = supabase
      .channel("admin-deployments-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "deployment_requests" }, () =>
        fetchRequests(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (req: DeploymentRequest) => {
    if (!window.confirm("Approve this deployment request? The client will be notified.")) return;
    try {
      await deploymentRequestRepository.updateStatus(req.id, "APPROVED", user?.id || "");
      toast.success("Request approved! You can now provision hosting.");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve request.");
    }
  };

  const handleHost = async (
    reqId: string,
    invitationId?: string,
    reqItem?: any,
  ) => {
    if (!window.confirm(`Host this invitation for ${hostDuration} days and make it live?`)) return;
    try {
      const hostedAt = new Date();
      const expiresAt = new Date(hostedAt.getTime() + parseInt(hostDuration) * 24 * 60 * 60 * 1000);

      // 1. Update deployment request status
      await deploymentRequestRepository.updateStatus(reqId, "HOSTED", user?.id || "", undefined, {
        hosted_at: hostedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      // 2. Ensure invitation status is Published in database
      if (invitationId) {
        try {
          await invitationRepository.update(invitationId, { status: "Published" });
        } catch {}
      }

      toast.success("Invitation is now Hosted and Live for guests!");
      setHostId(null);
      fetchRequests();

      // Open congratulations notification dialog to easily send live link to the client
      const liveUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/i/${reqItem?.invitation?.slug || ""}`;
      const shareDetails = extractWeddingShareDetails(
        reqItem?.invitation,
        typeof window !== "undefined" ? window.location.origin : "",
      );
      const formattedAnnouncement = formatWeddingShareMessage(shareDetails);
      const customMessage = `Dear ${reqItem?.clientName || "Valued Couple"},\n\nCongratulations! We are delighted to share that your luxury wedding invitation for ${shareDetails.coupleNames} is now officially HOSTED & LIVE!\n\nHere is your ready-to-send guest announcement:\n----------------------------------------\n${formattedAnnouncement}\n----------------------------------------\n\nYour guests can now view your full invitation, interactive schedule, and submit RSVPs.\n\nWarm regards,\nCandyInvito Studio`;

      setNotifyModalData({
        requestId: reqId,
        clientEmail: reqItem?.clientEmail || "",
        clientName: reqItem?.clientName || "Valued Couple",
        coupleNames: shareDetails.coupleNames,
        liveUrl,
        customMessage,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to host invitation.");
    }
  };

  const handleDeleteDeployment = async (reqId: string, isHosted: boolean) => {
    const confirmMessage = isHosted
      ? "Delete this hosted deployment? The live link will be taken down and the invitation will return to Draft."
      : "Delete this deployment request?";

    if (!window.confirm(confirmMessage)) return;

    try {
      await deploymentRequestRepository.remove(reqId);
      toast.success(
        isHosted
          ? "Hosted deployment deleted and live link taken down."
          : "Deployment request deleted.",
      );
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete deployment request.");
    }
  };

  const handleReject = async (reqId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    if (!window.confirm("Reject this deployment request?")) return;
    try {
      await deploymentRequestRepository.updateStatus(
        reqId,
        "REJECTED",
        user?.id || "",
        rejectReason,
      );
      toast.success("Request rejected.");
      setRejectId(null);
      setRejectReason("");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject request.");
    }
  };

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
        return;
      }
    } catch (e) {}

    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy.");
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== "ALL" && req.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        req.id.toLowerCase().includes(term) ||
        req.requested_by.toLowerCase().includes(term) ||
        (req.clientEmail || "").toLowerCase().includes(term) ||
        (req.clientName || "").toLowerCase().includes(term) ||
        (req.invitation?.couple_names ?? "").toLowerCase().includes(term) ||
        (req.invitation?.title ?? "").toLowerCase().includes(term) ||
        (req.invitation?.slug ?? "").toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-10">
      {/* Header */}
      <header className="pb-6 border-b border-[#201814]/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#201814]/50 font-bold mb-1.5 flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#DCA963]" /> Studio Hosting & Domains
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#201814]">
            Deployment Requests
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/10 rounded-full text-xs font-bold uppercase tracking-wider text-black/70 shadow-2xs">
          Showing <strong className="text-[#201814]">{filteredRequests.length}</strong> of {requests.length} requests
        </span>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#201814]/40" />
          <input
            type="text"
            placeholder="Search by client email, couple title, or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#201814]/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#DCA963] shadow-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-[#201814]/10 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#201814] focus:outline-none focus:border-[#DCA963] shadow-xs cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved (Ready to Host)</option>
          <option value="HOSTED">Hosted & Live</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Deployments Table Card */}
      <div className="rounded-2xl border border-[#201814]/10 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#DCA963]" />
            <span className="text-xs text-black/40">Loading deployment requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-16 text-center">
            <div className="h-12 w-12 rounded-full bg-[#201814]/5 flex items-center justify-center mx-auto mb-4">
              <Filter className="h-6 w-6 text-[#201814]/40" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#201814]">No deployment requests found</h3>
            <p className="text-xs text-[#201814]/50 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-[#201814]/5 bg-[#FAF9F6]">
                  <th className="px-5 py-4 text-[10px] font-bold tracking-widest uppercase text-[#201814]/50">
                    Request Date
                  </th>
                  <th className="px-5 py-4 text-[10px] font-bold tracking-widest uppercase text-[#201814]/50">
                    Client & Couple
                  </th>
                  <th className="px-5 py-4 text-[10px] font-bold tracking-widest uppercase text-[#201814]/50">
                    Status & Hosting Info
                  </th>
                  <th className="px-5 py-4 text-[10px] font-bold tracking-widest uppercase text-[#201814]/50 text-right pr-5">
                    Review Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201814]/5">
                {filteredRequests.map((req) => {
                  const invSlug = req.invitation?.slug;
                  const liveUrl = invSlug
                    ? `${typeof window !== "undefined" ? window.location.origin : ""}/i/${invSlug}`
                    : "";
                  const previewUrl = invSlug ? `/i/${invSlug}?mode=preview` : "";
                  const isHosted = req.status === "HOSTED";

                  return (
                    <tr key={req.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                      <td className="px-5 py-4 text-xs font-semibold text-[#201814]">
                        {new Date(req.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#201814]">
                            {req.invitation?.couple_names || req.invitation?.title || "Untitled Invitation"}
                          </span>
                          <span className="text-xs text-[#201814]/70 mt-0.5">
                            Client: <strong>{req.clientName || "Client"}</strong> ({req.clientEmail || req.requested_by.substring(0, 8)})
                          </span>
                          <span className="text-xs text-[#201814]/50 font-mono mt-0.5">
                            /i/{req.invitation?.slug}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                          </div>

                          {req.status === "HOSTED" && (
                            <div className="flex flex-col gap-1 mt-1">
                              {req.expires_at && (
                                <span className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1">
                                  <Calendar size={11} /> Expires: {new Date(req.expires_at).toLocaleDateString()}
                                </span>
                              )}
                              {liveUrl && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-black/50 font-mono truncate max-w-[200px]">
                                    {liveUrl}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(liveUrl)}
                                    className="p-1 text-[#DCA963] hover:text-[#201814] rounded transition-colors"
                                    title="Copy Live Link"
                                  >
                                    <Copy size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {req.rejection_reason && (
                            <p className="text-xs text-rose-600 font-medium">
                              Reason: {req.rejection_reason}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right pr-5">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {/* Preview Link */}
                          {previewUrl && (
                            <a
                              href={previewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-black/50 hover:text-black hover:bg-black/5 rounded-xl transition-colors shadow-2xs"
                              title="Preview Full Design"
                            >
                              <Eye size={15} />
                            </a>
                          )}

                          {/* Action when PENDING */}
                          {req.status === "PENDING" && rejectId !== req.id && (
                            <>
                              <button
                                onClick={() => setRejectId(req.id)}
                                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleApprove(req)}
                                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                              >
                                Approve
                              </button>
                            </>
                          )}

                          {/* Rejection input box */}
                          {rejectId === req.id && (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Rejection reason..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="text-xs border border-rose-300 rounded-xl px-2.5 py-1.5 outline-none focus:border-rose-500 w-40"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  setRejectId(null);
                                  setRejectReason("");
                                }}
                                className="text-xs text-black/50 hover:text-black"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReject(req.id)}
                                className="text-xs bg-rose-600 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-rose-700 shadow-2xs"
                              >
                                Confirm
                              </button>
                            </div>
                          )}

                          {/* Action when APPROVED -> Host Form */}
                          {req.status === "APPROVED" && hostId !== req.id && (
                            <button
                              onClick={() => setHostId(req.id)}
                              className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                            >
                              <Globe size={13} /> Host Live
                            </button>
                          )}

                          {hostId === req.id && (
                            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 p-2 rounded-2xl">
                              <select
                                value={hostDuration}
                                onChange={(e) => setHostDuration(e.target.value)}
                                className="text-xs bg-white border border-indigo-200 rounded-lg px-2 py-1 outline-none font-semibold"
                              >
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                                <option value="90">90 Days</option>
                                <option value="365">1 Year</option>
                              </select>
                              <button
                                onClick={() => setHostId(null)}
                                className="text-xs text-black/50 hover:text-black"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleHost(req.id, req.invitation_id, req)}
                                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1 rounded-lg shadow-2xs"
                              >
                                Confirm
                              </button>
                            </div>
                          )}

                          {/* Action when HOSTED -> Send Congratulations to Client button */}
                          {req.status === "HOSTED" && (
                            <button
                              onClick={() => {
                                const shareDetails = extractWeddingShareDetails(
                                  req.invitation,
                                  typeof window !== "undefined" ? window.location.origin : "",
                                );
                                const formattedAnnouncement = formatWeddingShareMessage(shareDetails);
                                const customMessage = `Dear ${req.clientName || "Valued Couple"},\n\nCongratulations! We are delighted to share that your luxury wedding invitation for ${shareDetails.coupleNames} is now officially HOSTED & LIVE!\n\nHere is your ready-to-send guest announcement:\n----------------------------------------\n${formattedAnnouncement}\n----------------------------------------\n\nYour guests can now view your full invitation, interactive schedule, and submit RSVPs.\n\nWarm regards,\nCandyInvito Studio`;

                                setNotifyModalData({
                                  requestId: req.id,
                                  clientEmail: req.clientEmail || "",
                                  clientName: req.clientName || "Valued Couple",
                                  coupleNames: shareDetails.coupleNames,
                                  liveUrl,
                                  customMessage,
                                });
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#201814] bg-[#DCA963]/20 hover:bg-[#DCA963] hover:text-[#201814] px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                              title="Send or share congratulations message to client"
                            >
                              <Sparkles size={12} className="text-[#DCA963]" /> Send Congrats
                            </button>
                          )}

                          {/* Option to Delete / Take down deployment request */}
                          <button
                            onClick={() => handleDeleteDeployment(req.id, isHosted)}
                            className="p-1.5 text-black/40 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title={isHosted ? "Delete & Unhost Live Invitation" : "Delete Deployment Request"}
                          >
                            <Trash2 size={15} />
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

      {/* Send Congratulations to Client Modal */}
      {notifyModalData && (
        <Dialog open={!!notifyModalData} onOpenChange={() => setNotifyModalData(null)}>
          <DialogContent className="sm:max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-black/10">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-bold text-[#201814] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#DCA963]" /> Send Congratulations to Client
              </DialogTitle>
              <DialogDescription className="text-xs text-black/60 pt-1">
                Send congratulations and the official hosted link to the couple.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-black/5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-black/50 uppercase font-bold tracking-wider">Client Email:</span>
                  <span className="font-semibold text-[#201814]">{notifyModalData.clientEmail || "Not specified"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-black/50 uppercase font-bold tracking-wider">Couple Title:</span>
                  <span className="font-semibold text-[#201814]">{notifyModalData.coupleNames}</span>
                </div>
                <div className="flex flex-col gap-1 text-xs pt-2 border-t border-black/5">
                  <span className="text-black/50 uppercase font-bold tracking-wider">Hosted URL:</span>
                  <span className="font-mono font-semibold text-indigo-900 break-all">{notifyModalData.liveUrl}</span>
                </div>
              </div>

              {/* Ready to send congratulations message */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black/50 block mb-1.5">
                  Congratulations Message for Client Portal
                </label>
                <textarea
                  rows={6}
                  value={notifyModalData.customMessage}
                  onChange={(e) =>
                    setNotifyModalData((prev) =>
                      prev ? { ...prev, customMessage: e.target.value } : null,
                    )
                  }
                  className="w-full text-xs font-sans bg-[#FAF9F6] border border-black/10 rounded-2xl p-3 outline-none focus:border-[#DCA963]"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setNotifyModalData(null)}
                className="w-full sm:w-auto rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Close
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
                <Button
                  onClick={() => {
                    copyToClipboard(notifyModalData.customMessage || "");
                  }}
                  className="bg-[#141210] hover:bg-[#382B23] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
                >
                  <Copy size={13} /> Copy Message
                </Button>
                {notifyModalData.clientEmail && (
                  <a
                    href={`mailto:${notifyModalData.clientEmail}?subject=${encodeURIComponent(`🎉 Congratulations! Your Wedding Invitation is Live! — CandyInvito`)}&body=${encodeURIComponent(notifyModalData.customMessage || "")}`}
                    className="bg-[#DCA963] hover:bg-[#C99750] text-[#141210] font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Mail size={13} /> Open Email
                  </a>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
