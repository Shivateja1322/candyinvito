import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth-context";
import { invitationRepository, deploymentRequestRepository } from "../../lib/repositories";
import {
  CalendarHeart,
  Plus,
  Eye,
  Settings,
  Share2,
  Trash2,
  Copy,
  Users,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit3,
  Globe,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { themeCapabilities } from "../../templates/TemplateRegistry";
import { Invitation, DeploymentRequest } from "../../lib/types";

export const Route = createFileRoute("/client/")({
  component: ClientDashboard,
});

function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, any[]>>({});
  const [deployments, setDeployments] = useState<Record<string, any[]>>({});
  const [deploymentReqs, setDeploymentReqs] = useState<Record<string, DeploymentRequest>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const invs = await invitationRepository.listByClient(user.id);
      setInvitations(invs);

      // Fetch RSVPs and deployment requests for all invitations
      const rsvpMap: Record<string, any[]> = {};
      const reqMap: Record<string, DeploymentRequest> = {};

      const [rsvpsRes, reqsRes] = await Promise.all([
        supabase.from("rsvps").select("*"),
        deploymentRequestRepository.list(user.id),
      ]);

      (rsvpsRes.data || []).forEach((r) => {
        if (!rsvpMap[r.invitation_id]) rsvpMap[r.invitation_id] = [];
        rsvpMap[r.invitation_id].push(r);
      });

      reqsRes.forEach((req) => {
        reqMap[req.invitation_id] = req;
      });

      setRsvps(rsvpMap);
      setDeploymentReqs(reqMap);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Enable realtime sync
    const channel = supabase
      .channel("client-dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "invitations" }, () =>
        loadDashboardData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deployment_requests" },
        () => loadDashboardData(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, () =>
        loadDashboardData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDrafts(invitations.map((i) => i.id));
    } else {
      setSelectedDrafts([]);
    }
  };

  const handleSelectDraft = (id: string) => {
    setSelectedDrafts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedDrafts.length === 0) return;
    if (
      window.confirm(
        `Delete ${selectedDrafts.length} invitation(s)?\n\nThis action cannot be undone.`,
      )
    ) {
      try {
        await Promise.all(selectedDrafts.map((id) => invitationRepository.remove(id)));
        setInvitations((prev) => prev.filter((i) => !selectedDrafts.includes(i.id)));
        setSelectedDrafts([]);
        toast.success("Draft(s) deleted successfully.");
      } catch (err: any) {
        toast.error("Failed to delete some drafts.");
        console.error(err);
      }
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (window.confirm("Delete this invitation?\n\nThis action cannot be undone.")) {
      try {
        await invitationRepository.remove(id);
        setInvitations((prev) => prev.filter((i) => i.id !== id));
        toast.success("Invitation deleted.");
      } catch (err: any) {
        toast.error("Failed to delete invitation.");
        console.error(err);
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    if (!text) {
      toast.error("No link available to copy.");
      return;
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success("Link copied to clipboard!");
        return;
      }
    } catch (e) {}

    // Fallback using textarea execCommand
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        toast.success("Link copied to clipboard!");
      } else {
        toast.error("Could not copy link automatically. Please copy it manually.");
      }
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-sans">
      <header className="pb-6 border-b border-black/10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#201814]/50 font-bold mb-1">
            Welcome Back
          </p>
          <h1 className="text-3xl font-display font-medium text-[#201814]">
            {user?.name ? `${user.name}'s Studio` : "My Invitations"}
          </h1>
          <p className="text-black/50 text-sm mt-1">
            Manage your luxury wedding stationery, real-time RSVPs, and live hosting.
          </p>
        </div>
        <Link
          to="/client/templates"
          className="inline-flex items-center gap-2 bg-[#201814] hover:bg-[#382B23] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
        >
          <Plus size={14} /> Create New Invitation
        </Link>
      </header>

      {/* Drafts Selection / Bulk Delete Toolbar */}
      {invitations.length > 0 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-black/5 shadow-xs">
          <label className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-[#201814]">
            <input
              type="checkbox"
              checked={
                invitations.length > 0 && selectedDrafts.length === invitations.length
              }
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-[#201814] focus:ring-[#201814]"
            />
            Select All ({invitations.length})
          </label>
          {selectedDrafts.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-black/50">
                Selected: <strong>{selectedDrafts.length}</strong>
              </span>
              <button
                onClick={handleDeleteSelected}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>
      )}

      {/* Invitations List */}
      {loading ? (
        <div className="p-16 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DCA963]"></div>
        </div>
      ) : invitations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-black/10 p-16 text-center shadow-xs">
          <CalendarHeart className="w-16 h-16 mx-auto text-black/20 mb-6" />
          <h3 className="text-2xl font-serif text-[#201814] mb-2">No Invitations Yet</h3>
          <p className="text-black/50 mb-8 max-w-md mx-auto text-sm">
            Start by choosing your luxury design template. You can customize music, video, photos, and schedule.
          </p>
          <Link
            to="/client/templates"
            className="inline-block bg-[#DCA963] text-[#201814] font-bold px-8 py-3 rounded-full text-xs uppercase tracking-widest hover:bg-[#C99750] transition-colors shadow-md"
          >
            Browse Templates
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {invitations.map((invitation) => {
            const theme = themeCapabilities[invitation.template_id] || {
              name: "Luxury Theme",
            };
            const invRsvps = rsvps[invitation.id] || [];
            const req = deploymentReqs[invitation.id];

            const isHosted = req?.status === "HOSTED";
            const isApproved = req?.status === "APPROVED";
            const isPending = req?.status === "PENDING";
            const isRejected = req?.status === "REJECTED";

            const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/i/${invitation.slug}`;
            const previewUrl = `/i/${invitation.slug}?mode=preview`;

            const stats = {
              total: invRsvps.length,
              attending: invRsvps.filter(
                (r) =>
                  r.status === "ATTENDING" || r.attending === "YES" || r.attending === true,
              ).length,
              declined: invRsvps.filter(
                (r) =>
                  r.status === "DECLINED" || r.attending === "NO" || r.attending === false,
              ).length,
            };

            return (
              <div
                key={invitation.id}
                className={`bg-white rounded-3xl border ${
                  selectedDrafts.includes(invitation.id)
                    ? "border-[#201814] ring-2 ring-[#201814]/10"
                    : "border-black/10"
                } shadow-xs overflow-hidden transition-all`}
              >
                <div className="p-8 border-b border-black/5 bg-gradient-to-r from-white to-[#FAF9F6] flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedDrafts.includes(invitation.id)}
                      onChange={() => handleSelectDraft(invitation.id)}
                      className="mt-1.5 w-4 h-4 rounded border-gray-300 text-[#201814] focus:ring-[#201814]"
                    />
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#DCA963] bg-[#DCA963]/10 px-2.5 py-0.5 rounded-full">
                          {theme.name}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            isHosted
                              ? "bg-indigo-100 text-indigo-800"
                              : isApproved
                                ? "bg-emerald-100 text-emerald-800"
                                : isPending
                                  ? "bg-amber-100 text-amber-800"
                                  : isRejected
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {isHosted && <Globe size={10} />}
                          {isApproved && <CheckCircle2 size={10} />}
                          {isPending && <Clock size={10} />}
                          {isRejected && <XCircle size={10} />}
                          {isHosted
                            ? "Hosted & Live"
                            : isApproved
                              ? "Approved — Provisioning"
                              : isPending
                                ? "Pending Admin Approval"
                                : isRejected
                                  ? "Revision Requested"
                                  : "Draft"}
                        </span>
                      </div>

                      <h2 className="text-2xl font-serif font-bold text-[#201814]">
                        {invitation.couple_names || invitation.title || "Wedding Invitation"}
                      </h2>
                      <p className="text-xs text-black/40 font-mono mt-1">/i/{invitation.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteDraft(invitation.id)}
                      className="text-black/40 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Invitation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  {/* Hosted Celebration Banner */}
                  {isHosted && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5 mb-6 max-w-2xl flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center gap-2 text-indigo-900">
                        <Sparkles className="w-4 h-4 text-[#DCA963]" />
                        <p className="text-xs font-bold uppercase tracking-widest">
                          Your Wedding Invitation is Live!
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-indigo-100 rounded-xl p-2.5">
                        <span className="text-xs font-mono text-indigo-900 font-semibold truncate flex-1">
                          {publicUrl}
                        </span>
                        <button
                          onClick={() => copyToClipboard(publicUrl)}
                          className="bg-[#201814] text-white hover:bg-[#DCA963] hover:text-[#201814] px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1"
                        >
                          <Copy size={12} /> Copy Link
                        </button>
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> Open Live
                        </a>
                      </div>
                      {req?.expires_at && (
                        <p className="text-[11px] text-indigo-700 font-medium">
                          Active & Hosted until: {new Date(req.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={`/client/builder/${invitation.slug}`}
                      className="inline-flex items-center gap-2 bg-[#201814] hover:bg-[#382B23] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                    >
                      <Edit3 size={14} /> Open Builder
                    </Link>

                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-black/5 hover:bg-black/10 text-[#201814] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      <Eye size={14} /> Preview
                    </a>

                    <button
                      onClick={() => copyToClipboard(publicUrl)}
                      className="inline-flex items-center gap-2 bg-white border border-black/10 hover:border-black/20 text-[#201814] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                    >
                      <Copy size={14} /> Copy Guest Link
                    </button>
                  </div>

                  {/* Quick RSVPs counter */}
                  <div className="mt-6 pt-6 border-t border-black/5 flex items-center gap-6 text-xs text-black/60">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-[#DCA963]" />
                      <span>
                        Total RSVPs: <strong className="text-[#201814]">{stats.total}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span>Attending: {stats.attending}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                      <span>Declined: {stats.declined}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
