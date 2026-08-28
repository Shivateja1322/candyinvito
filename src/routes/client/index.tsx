import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { invitationRepository, rsvpRepository, deploymentRepository, deploymentRequestRepository } from "../../lib/repositories";
import { themeCapabilities } from "../../templates/TemplateRegistry";
import { Invitation, Rsvp, Deployment } from "../../lib/types";
import { 
  Loader2, 
  Settings, 
  ExternalLink, 
  Copy, 
  Edit3, 
  Eye, 
  LayoutTemplate,
  CalendarHeart,
  Users
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/client/")({
  component: ClientDashboard,
});

function ClientDashboard() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, Rsvp[]>>({});
  const [deployments, setDeployments] = useState<Record<string, Deployment[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [deploymentReqs, setDeploymentReqs] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const invs = await invitationRepository.listByClient(user.id);
        setInvitations(invs);
        
        const rsvpMap: Record<string, Rsvp[]> = {};
        const deployMap: Record<string, Deployment[]> = {};
        const reqMap: Record<string, any> = {};
        
        for (const inv of invs) {
          const invRsvps = await rsvpRepository.listByInvitation(inv.id);
          rsvpMap[inv.id] = invRsvps;
          
          try {
            const invDeploys = await deploymentRepository.listByInvitation(inv.id);
            deployMap[inv.id] = invDeploys;
            try {
              const reqs = await deploymentRequestRepository.list();
              reqMap[inv.id] = reqs.find((r: any) => r.invitation_id === inv.id && ["PENDING", "APPROVED", "HOSTED", "REJECTED"].includes(r.status));
            } catch(e) {}

          } catch(e) {
            // deployment module might be incomplete, safely ignore
            deployMap[inv.id] = [];
          }
        }
        setRsvps(rsvpMap);
        setDeployments(deployMap);
        setDeploymentReqs(reqMap);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
      </div>
    );
  }

  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedDrafts(invitations.map(i => i.id));
    else setSelectedDrafts([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedDrafts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteSelected = async () => {
    if (selectedDrafts.length === 0) return;
    if (window.confirm(`Delete ${selectedDrafts.length} invitation(s)?\n\nThis action cannot be undone.`)) {
      try {
        await Promise.all(selectedDrafts.map(id => invitationRepository.remove(id)));
        setInvitations(prev => prev.filter(i => !selectedDrafts.includes(i.id)));
        setSelectedDrafts([]);
        toast.success("Draft(s) deleted.");
      } catch (err: any) {
        toast.error("Failed to delete some drafts.");
        console.error(err);
      }
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (window.confirm("Delete this draft?\n\nThis action cannot be undone.")) {
      try {
        await invitationRepository.remove(id);
        setInvitations((prev) => prev.filter((i) => i.id !== id));
        toast.success("Draft deleted.");
      } catch (err: any) {
        toast.error("Failed to delete draft.");
        console.error(err);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="w-full h-full text-[#201814] pb-24 overflow-y-auto font-sans">
      <main className="max-w-6xl mx-auto px-6 md:px-10 mt-12 animate-fade-in">
        <div className="mb-12 border-b border-black/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#201814]/50 font-bold mb-2">
              Welcome back
            </p>
            <h2 className="text-4xl font-display font-medium text-[#201814] tracking-tight">
              {user?.name || "Client Dashboard"}
            </h2>
          </div>
          
          <Link 
            to="/client/templates" 
            className="inline-flex items-center justify-center bg-[#201814] hover:bg-[#3A2D25] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-lg"
          >
            Create New Invitation
          </Link>
        </div>
        
        {invitations.length > 0 && (
          <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl border border-black/5 shadow-sm">
            <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
              <input type="checkbox" checked={invitations.length > 0 && selectedDrafts.length === invitations.length} onChange={handleSelectAll} className="w-4 h-4 rounded border-gray-300 text-[#201814] focus:ring-[#201814]" />
              Select All
            </label>
            {selectedDrafts.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-black/50">Selected: {selectedDrafts.length}</span>
                <button onClick={handleDeleteSelected} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        )}


        {invitations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-black/10 p-16 text-center shadow-sm">
            <CalendarHeart className="w-16 h-16 mx-auto text-black/20 mb-6" />
            <h3 className="text-2xl font-serif text-[#201814] mb-2">No Invitations Yet</h3>
            <p className="text-black/50 mb-8 max-w-md mx-auto">
              Start by creating your first luxury wedding invitation. You can customize the design, text, and photos.
            </p>
            <Link 
              to="/client/templates" 
              className="inline-block bg-[#DCA963] text-white px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#C99750] transition-colors"
            >
              Browse Templates
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {invitations.map(invitation => {
              const theme = themeCapabilities[invitation.template_id] || { name: "Default Theme" };
              const invRsvps = rsvps[invitation.id] || [];
              const invDeploys = deployments[invitation.id] || [];
              const activeDeploy = invDeploys.find(d => d.status === "LIVE");
              
              const stats = {
                total: invRsvps.length,
                attending: invRsvps.filter(r => r.attending === "YES").length,
                declined: invRsvps.filter(r => r.attending === "NO").length,
                guests: invRsvps.filter(r => r.attending === "YES").reduce((sum, r) => sum + ((r.guests_count || r.guests) || 1), 0)
              };

              const publicUrl = activeDeploy?.public_url || `${(typeof window !== "undefined" ? window.location.origin : "")}/i/${invitation.slug}`;
              const isPublished = invitation.status === "PUBLISHED" || activeDeploy;

              const req = deploymentReqs[invitation.id];
              let statusLabel = 'Draft';
              let statusColor = 'bg-amber-100 text-amber-700';
              if (req) {
                if (req.status === 'PENDING') { statusLabel = 'Waiting for Admin Approval'; statusColor = 'bg-blue-100 text-blue-700'; }
                else if (req.status === 'APPROVED') { statusLabel = 'Approved - Awaiting Hosting'; statusColor = 'bg-emerald-100 text-emerald-700'; }
                else if (req.status === 'HOSTED') { 
                  if (req.expires_at && new Date(req.expires_at) < new Date()) { statusLabel = 'Expired'; statusColor = 'bg-gray-100 text-gray-700'; }
                  else { statusLabel = 'Hosted'; statusColor = 'bg-indigo-100 text-indigo-700'; }
                }
                else if (req.status === 'REJECTED') { statusLabel = 'Rejected'; statusColor = 'bg-rose-100 text-rose-700'; }
              } else if (isPublished) {
                statusLabel = 'Live'; statusColor = 'bg-green-100 text-green-700';
              }


              return (
                
                <div key={invitation.id} className={`bg-white rounded-3xl border ${selectedDrafts.includes(invitation.id) ? 'border-[#201814]' : 'border-black/10'} shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-colors`}>
                  <div className="p-8 md:p-10 border-b border-black/5 bg-gradient-to-r from-white to-[#F8F9FA] flex flex-col lg:flex-row justify-between gap-8">
                    <div className="flex-1 relative">
                      <div className="absolute -left-4 -top-4 md:-left-6 md:-top-6 z-10">
                        <input type="checkbox" checked={selectedDrafts.includes(invitation.id)} onChange={() => toggleSelect(invitation.id)} className="w-5 h-5 rounded border-gray-300 text-[#201814] focus:ring-[#201814] cursor-pointer shadow-sm" />
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>
                          {statusLabel}
                        </span>
                        <span className="bg-black/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-black/60">
                          {theme.name}
                        </span>
                      </div>
                      
                      <h3 className="text-3xl font-serif text-[#201814] mb-2">
                        {invitation.couple_names || "Untitled Wedding"}
                      </h3>
                      <p className="text-black/50 text-sm mb-4 flex items-center gap-2">
                        <span>Last Updated {new Date(invitation.updated_at || invitation.created_at || Date.now()).toLocaleString()}</span>
                        <span>•</span>
                        <span>{invitation.slug}</span>
                      </p>

                      
                      {req && req.status === "REJECTED" && req.rejection_reason && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-6 max-w-lg">
                          <p className="text-xs font-bold text-red-800 uppercase tracking-widest mb-1">Reason for Rejection</p>
                          <p className="text-sm text-red-700">{req.rejection_reason}</p>
                        </div>
                      )}
                      
                      {req && req.status === "HOSTED" && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5 mb-6 max-w-xl flex flex-col gap-2 shadow-xs">
                          <div className="flex items-center gap-2 text-indigo-900">
                            <Sparkles className="w-4 h-4 text-[#DCA963]" />
                            <p className="text-xs font-bold uppercase tracking-widest">
                              Your Wedding Invitation is Live!
                            </p>
                          </div>
                          <div className="flex items-center gap-2 bg-white/80 border border-indigo-100 rounded-xl p-2.5">
                            <span className="text-xs font-mono text-indigo-900 font-semibold truncate flex-1">
                              {publicUrl}
                            </span>
                            <button
                              onClick={() => copyToClipboard(publicUrl)}
                              className="bg-[#201814] text-white hover:bg-[#DCA963] hover:text-[#201814] px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1"
                            >
                              <Copy size={12} /> Copy
                            </button>
                            <a
                              href={publicUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1"
                            >
                              <ExternalLink size={12} /> Open
                            </a>
                          </div>
                          {req.expires_at && (
                            <p className="text-[11px] text-indigo-700 font-medium">
                              Active & Hosted until: {new Date(req.expires_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}


                      <div className="flex flex-wrap items-center gap-3">
                        <Link 
                          to={`/client/builder/${invitation.slug}`} 
                          className="flex items-center gap-2 bg-[#DCA963] hover:bg-[#C99750] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
                        >
                          <Edit3 size={16} /> Edit Design
                        </Link>
                        
                        <a 
                          href={`/i/${invitation.slug}?mode=preview`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 bg-black/5 hover:bg-black/10 text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                          <Eye size={16} /> Preview
                        </a>

                        <button 
                          onClick={() => copyToClipboard(publicUrl)}
                          className="flex items-center gap-2 bg-white border border-black/10 hover:border-black/20 text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                          <Copy size={16} /> Copy Link
                        </button>
                      </div>
                    </div>
                    
                    {/* RSVP Mini-Dashboard */}
                    <div className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-black/50 flex items-center gap-2">
                          <Users size={14} /> RSVP Summary
                        </h4>
                        <Link to="/client/rsvp" className="text-[#DCA963] hover:text-[#C99750] text-xs font-bold">
                          View All
                        </Link>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-3xl font-serif text-[#201814]">{stats.total}</p>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 mt-1">Responses</p>
                        </div>
                        <div>
                          <p className="text-3xl font-serif text-[#201814]">{stats.guests}</p>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 mt-1">Guests</p>
                        </div>
                        <div>
                          <p className="text-xl font-serif text-green-700">{stats.attending}</p>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-green-600/70 mt-1">Attending</p>
                        </div>
                        <div>
                          <p className="text-xl font-serif text-red-700">{stats.declined}</p>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-red-600/70 mt-1">Declined</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {invRsvps.length > 0 && (
                    <div className="p-8 md:p-10 bg-white">
                      <h4 className="font-bold text-xs uppercase tracking-widest text-black/50 mb-4">
                        Recent Responses
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {invRsvps.slice(0, 3).map(rsvp => (
                          <div key={rsvp.id} className="p-4 rounded-xl border border-black/5 hover:border-black/10 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-bold text-sm truncate">{(rsvp.guest_name || rsvp.name || rsvp.guestName)}</p>
                              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                                rsvp.attending === "YES" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}>
                                {rsvp.attending}
                              </span>
                            </div>
                            {rsvp.attending === "YES" && (
                              <p className="text-xs text-black/60 mb-2">{(rsvp.guests_count || rsvp.guests)} Guests</p>
                            )}
                            <p className="text-[10px] text-black/40">
                              {new Date(rsvp.created_at || rsvp.submittedAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
