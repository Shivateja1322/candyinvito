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
  ArrowRight,
  Loader2,
  Layers,
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

  const totalRsvps = Object.values(rsvps).reduce((sum, list) => sum + list.length, 0);
  const hostedCount = Object.values(deploymentReqs).filter((r) => r.status === "HOSTED").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-sans pb-12">
      {/* Header */}
      <header className="pb-6 border-b border-black/10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#201814]/50 font-bold mb-1.5 flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#DCA963]" /> CandyInvito Design Atelier
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#201814] tracking-tight">
            {user?.name ? `${user.name}’s Studio` : "My Stationery Studio"}
          </h1>
          <p className="text-black/50 text-xs sm:text-sm mt-1">
            Design, customize, and share your luxury digital wedding invitation.
          </p>
        </div>
        <Link
          to="/client/templates"
          className="inline-flex items-center gap-2 bg-[#141210] hover:bg-[#DCA963] hover:text-[#141210] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
        >
          <Plus size={14} /> Create New Invitation
        </Link>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-1">
              Designs in Studio
            </p>
            <p className="text-3xl font-serif font-bold text-[#201814]">{invitations.length}</p>
          </div>
          <div className="p-3 bg-[#201814]/5 rounded-xl text-[#201814]">
            <Layers size={20} />
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-1">
              Total RSVPs Received
            </p>
            <p className="text-3xl font-serif font-bold text-[#201814]">{totalRsvps}</p>
          </div>
          <div className="p-3 bg-[#DCA963]/15 rounded-xl text-[#DCA963]">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/50 mb-1">
              Live Hosted Links
            </p>
            <p className="text-3xl font-serif font-bold text-[#201814]">{hostedCount}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-700">
            <Globe size={20} />
          </div>
        </div>
      </div>

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
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-black/50">
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
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#DCA963]" />
          <span className="text-xs text-black/40">Loading your stationery designs...</span>
        </div>
      ) : invitations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-black/10 p-10 sm:p-16 text-center shadow-xs">
          <CalendarHeart className="w-14 h-14 mx-auto text-black/20 mb-4" />
          <h3 className="text-2xl font-serif font-bold text-[#201814] mb-2">No Invitations Yet</h3>
          <p className="text-black/50 mb-8 max-w-md mx-auto text-xs sm:text-sm">
            Start by choosing your luxury design theme. You can customize background music, video hero, photos, venue map, and schedule.
          </p>
          <Link
            to="/client/templates"
            className="inline-flex items-center gap-2 bg-[#141210] hover:bg-[#DCA963] hover:text-[#141210] text-white font-bold px-8 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs"
          >
            Explore Themes & Begin <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {invitations.map((invitation) => {
            const theme = themeCapabilities[invitation.template_id] || {
              name: "Luxury Theme",
              thumbnail: "",
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
                } shadow-xs overflow-hidden transition-all duration-300 hover:shadow-md`}
              >
                <div className="p-6 sm:p-8 border-b border-black/5 bg-[#FAF9F6]/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedDrafts.includes(invitation.id)}
                      onChange={() => handleSelectDraft(invitation.id)}
                      className="mt-1.5 w-4 h-4 rounded border-gray-300 text-[#201814] focus:ring-[#201814]"
                    />
                    <div>
                      <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#DCA963] bg-[#DCA963]/15 border border-[#DCA963]/30 px-2.5 py-0.5 rounded-full">
                          {theme.name}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            isHosted
                              ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                              : isApproved
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : isPending
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : isRejected
                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                    : "bg-gray-100 text-gray-700 border border-gray-200"
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

                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201814]">
                        {invitation.couple_names || invitation.title || "Wedding Invitation"}
                      </h2>
                      <p className="text-xs text-black/40 font-mono mt-1">/i/{invitation.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleDeleteDraft(invitation.id)}
                      className="text-black/40 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors"
                      title="Delete Invitation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Hosted Celebration Banner */}
                  {isHosted && (
                    <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2 text-indigo-950">
                        <Sparkles className="w-4 h-4 text-[#DCA963]" />
                        <p className="text-xs font-bold uppercase tracking-widest">
                          Your Wedding Invitation is Officially Live!
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white border border-indigo-100 rounded-xl p-2.5">
                        <span className="text-xs font-mono text-indigo-900 font-semibold truncate flex-1 py-1">
                          {publicUrl}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => copyToClipboard(publicUrl)}
                            className="flex-1 sm:flex-none bg-[#141210] text-white hover:bg-[#DCA963] hover:text-[#141210] px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <Copy size={12} /> Copy Link
                          </button>
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 sm:flex-none bg-indigo-600 text-white hover:bg-indigo-700 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <ExternalLink size={12} /> Open Live
                          </a>
                        </div>
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
                      className="inline-flex items-center gap-2 bg-[#141210] hover:bg-[#DCA963] hover:text-[#141210] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                    >
                      <Edit3 size={14} /> Open Studio Builder
                    </Link>

                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-black/5 hover:bg-black/10 text-[#201814] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
                    >
                      <Eye size={14} /> Private Preview
                    </a>

                    <button
                      onClick={() => copyToClipboard(publicUrl)}
                      className="inline-flex items-center gap-2 bg-white border border-black/10 hover:border-black/20 text-[#201814] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
                    >
                      <Copy size={14} /> Copy Guest URL
                    </button>
                  </div>

                  {/* Quick RSVPs counter */}
                  <div className="pt-4 border-t border-black/5 flex flex-wrap items-center gap-6 text-xs text-black/60">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-[#DCA963]" />
                      <span>
                        Total RSVPs: <strong className="text-[#201814]">{stats.total}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <span>Attending: {stats.attending}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-800 font-semibold">
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
