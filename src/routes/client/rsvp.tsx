import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { invitationRepository, rsvpRepository } from "../../lib/repositories";
import { Download, Search, Users, Mail, MessageSquare, Loader2, CalendarHeart } from "lucide-react";
import { toast } from "sonner";
import { Invitation, Rsvp } from "../../lib/types";

export const Route = createFileRoute("/client/rsvp")({
  component: ClientRsvpComponent,
});

function ClientRsvpComponent() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvId, setSelectedInvId] = useState<string>("");
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filter, setFilter] = useState<"ALL" | "YES" | "NO">("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchInit = async () => {
      try {
        if (!user) return;
        const invs = await invitationRepository.listByClient(user.id);
        setInvitations(invs);
        if (invs.length > 0) {
          setSelectedInvId(invs[0].id);
        }
      } catch (err) {
        toast.error("Failed to load invitations");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInit();
  }, [user]);

  useEffect(() => {
    const fetchRsvps = async () => {
      if (!selectedInvId) return;
      setIsLoading(true);
      try {
        const data = await rsvpRepository.listByInvitation(selectedInvId);
        setRsvps(data);
      } catch (err) {
        toast.error("Failed to load RSVPs");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRsvps();
  }, [selectedInvId]);

  if (isLoading && !invitations.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="p-10 animate-fade-in max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#201814]/50 font-bold mb-2">
            Client Portal
          </p>
          <h2 className="text-4xl font-display font-medium text-[#201814] tracking-tight">RSVP Management</h2>
        </div>
        <div className="rounded-2xl border border-dashed border-black/20 p-16 text-center bg-white/50">
          <CalendarHeart className="w-12 h-12 text-black/20 mx-auto mb-6" />
          <p className="text-lg text-[#201814]/80 mb-2 font-medium">No Invitations Found</p>
          <p className="text-sm text-[#201814]/50 max-w-md mx-auto mb-8">
            You need to create and publish an invitation before you can start receiving guest RSVPs.
          </p>
          <a href="/client/templates" className="inline-block bg-[#DCA963] text-white px-8 py-3 rounded-xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#C99750] transition-colors">
            Browse Templates
          </a>
        </div>
      </div>
    );
  }

  const filteredRsvps = rsvps
    .filter(r => filter === "ALL" || r.attending === filter)
    .filter(r => (r.guest_name || r.name || r.guestName).toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.attending === "YES").length,
    declined: rsvps.filter(r => r.attending === "NO").length,
    guests: rsvps.filter(r => r.attending === "YES").reduce((sum, r) => sum + ((r.guests_count || r.guests) || 1), 0)
  };

  const exportCSV = () => {
    const headers = ["Guest Name,Email,Attending,Guests Count,Message,Submitted At"];
    const rows = filteredRsvps.map(r => 
      `"${(r.guest_name || r.name || r.guestName)}","${r.email || ""}","${r.attending}","${(r.guests_count || r.guests) || 0}","${(r.message || "").replace(/"/g, '""')}","${new Date(r.created_at || r.submittedAt || Date.now()).toLocaleDateString()}"`
    );
    const csv = headers.concat(rows).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvp-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-10 animate-fade-in max-w-7xl mx-auto font-sans">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#201814]/50 font-bold mb-2">
            Client Portal
          </p>
          <h2 className="text-4xl font-display font-medium text-[#201814] tracking-tight">RSVP Management</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={selectedInvId}
            onChange={e => setSelectedInvId(e.target.value)}
            className="border border-black/10 rounded-xl px-4 py-2.5 text-sm bg-white font-medium outline-none focus:border-[#DCA963]"
          >
            {invitations.map(inv => (
              <option key={inv.id} value={inv.id}>{inv.title || "Untitled Invitation"}</option>
            ))}
          </select>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-[#1C1C1E] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#DCA963] transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 mb-2">Total Responses</p>
          <p className="text-3xl font-serif text-[#201814]">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-green-600/70 mb-2">Attending</p>
          <p className="text-3xl font-serif text-green-800">{stats.attending}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 mb-2">Total Guests</p>
          <p className="text-3xl font-serif text-[#201814]">{stats.guests}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-red-600/70 mb-2">Declined</p>
          <p className="text-3xl font-serif text-red-800">{stats.declined}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-black/5 p-1 rounded-lg">
            {["ALL", "YES", "NO"].map(opt => (
              <button 
                key={opt}
                onClick={() => setFilter(opt as any)}
                className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${
                  filter === opt ? "bg-white text-black shadow-sm" : "text-black/50 hover:text-black/80"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search guests..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-black/10 rounded-lg text-sm outline-none focus:border-[#DCA963] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredRsvps.length === 0 ? (
            <div className="p-16 text-center text-black/40">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No RSVPs found for the selected filters.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-black/[0.02] text-[10px] uppercase tracking-widest text-black/50">
                  <th className="p-4 pl-6 font-semibold">Guest</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Party Size</th>
                  <th className="p-4 font-semibold">Message</th>
                  <th className="p-4 font-semibold text-right pr-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredRsvps.map(rsvp => (
                  <tr key={rsvp.id} className="hover:bg-black/[0.01] transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-black">{(rsvp.guest_name || rsvp.name || rsvp.guestName)}</div>
                      {rsvp.email && <div className="text-xs text-black/50 flex items-center gap-1 mt-1"><Mail className="w-3 h-3" /> {rsvp.email}</div>}
                    </td>
                    <td className="p-4">
                      {rsvp.attending === "YES" ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Attending</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Declined</span>
                      )}
                    </td>
                    <td className="p-4 font-serif text-lg">
                      {rsvp.attending === "YES" ? (rsvp.guests_count || rsvp.guests) : "-"}
                    </td>
                    <td className="p-4 max-w-[200px] truncate text-black/60">
                      {rsvp.message ? (
                        <div className="flex items-center gap-2" title={rsvp.message}>
                          <MessageSquare className="w-4 h-4 text-[#DCA963]" /> 
                          <span className="truncate">{rsvp.message}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-4 text-right pr-6 text-xs text-black/40">
                      {new Date(rsvp.created_at || rsvp.submittedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
