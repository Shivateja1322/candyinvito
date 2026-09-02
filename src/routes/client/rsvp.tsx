import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase";
import { invitationRepository, rsvpRepository } from "../../lib/repositories";
import { Download, Search, Users, Mail, MessageSquare, Loader2, CalendarHeart, Sparkles } from "lucide-react";
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

  const fetchRsvps = async () => {
    if (!selectedInvId) return;
    try {
      const data = await rsvpRepository.listByInvitation(selectedInvId);
      setRsvps(data);
    } catch (err) {
      toast.error("Failed to load RSVPs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedInvId) return;
    setIsLoading(true);
    fetchRsvps();

    // Subscribe to real-time RSVP updates
    const channel = supabase
      .channel(`client-rsvps-${selectedInvId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rsvps", filter: `invitation_id=eq.${selectedInvId}` },
        () => fetchRsvps(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedInvId]);

  if (isLoading && !invitations.length) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#DCA963]" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans animate-fade-in pb-16">
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#201814]/50 font-bold mb-1.5 flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#DCA963]" /> Guest Registry
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#201814] tracking-tight">
            RSVP Management
          </h1>
        </div>
        <div className="rounded-3xl border border-black/10 p-10 sm:p-16 text-center bg-white shadow-xs">
          <CalendarHeart className="w-14 h-14 text-black/20 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#201814] mb-2">No Invitations Found</h2>
          <p className="text-xs sm:text-sm text-[#201814]/60 max-w-md mx-auto mb-6">
            You need to create an invitation design before you can start receiving guest RSVPs.
          </p>
          <a
            href="/client/templates"
            className="inline-block bg-[#141210] text-white px-8 py-3 rounded-xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#DCA963] hover:text-[#141210] transition-all shadow-xs"
          >
            Browse Themes
          </a>
        </div>
      </div>
    );
  }

  const isAttending = (r: any) => r.status === "ATTENDING" || r.attending === "YES" || r.attending === true;

  const filteredRsvps = rsvps
    .filter((r: any) => {
      if (filter === "ALL") return true;
      if (filter === "YES") return isAttending(r);
      if (filter === "NO") return !isAttending(r);
      return true;
    })
    .filter((r: any) =>
      (r.guest_name || r.name || r.guestName || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.email || "").toLowerCase().includes(search.toLowerCase()),
    );

  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(isAttending).length,
    declined: rsvps.filter((r) => !isAttending(r)).length,
    guests: rsvps.filter(isAttending).reduce((sum, r: any) => sum + ((r.guests_count || r.guests) || 1), 0),
  };

  const exportCSV = () => {
    const headers = ["Guest Name,Email,Attending,Guests Count,Message,Submitted At"];
    const rows = filteredRsvps.map((r) =>
      `"${(r.guest_name || r.name || r.guestName)}","${r.email || ""}","${r.attending}","${(r.guests_count || r.guests) || 0}","${(r.message || "").replace(/"/g, '""')}","${new Date(r.created_at || r.submittedAt || Date.now()).toLocaleDateString()}"`,
    );
    const csv = headers.concat(rows).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvp-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("RSVP export downloaded!");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans animate-fade-in pb-16 space-y-8">
      {/* Header */}
      <header className="pb-6 border-b border-black/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#201814]/50 font-bold mb-1.5 flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#DCA963]" /> Guest Registry & Responses
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#201814] tracking-tight">
            RSVP Management
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <select
            value={selectedInvId}
            onChange={(e) => setSelectedInvId(e.target.value)}
            className="border border-black/10 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-white outline-none focus:border-[#DCA963] shadow-xs cursor-pointer"
          >
            {invitations.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.couple_names || inv.title || "Untitled Invitation"}
              </option>
            ))}
          </select>
          <button
            onClick={exportCSV}
            disabled={filteredRsvps.length === 0}
            className="flex items-center justify-center gap-2 bg-[#141210] hover:bg-[#DCA963] hover:text-[#141210] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs disabled:opacity-50"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </header>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-xs">
          <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">Total Responses</p>
          <p className="text-3xl font-serif font-bold text-[#201814]">{stats.total}</p>
        </div>
        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-800/70 mb-1">Attending</p>
          <p className="text-3xl font-serif font-bold text-emerald-800">{stats.attending}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-xs">
          <p className="text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">Total Guests</p>
          <p className="text-3xl font-serif font-bold text-[#201814]">{stats.guests}</p>
        </div>
        <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 shadow-xs">
          <p className="text-[10px] uppercase tracking-widest font-bold text-rose-800/70 mb-1">Declined</p>
          <p className="text-3xl font-serif font-bold text-rose-800">{stats.declined}</p>
        </div>
      </div>

      {/* Table & Controls Card */}
      <div className="bg-white rounded-3xl border border-black/10 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="flex bg-black/5 p-1 rounded-xl">
            {["ALL", "YES", "NO"].map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt as any)}
                className={`flex-1 sm:flex-none px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  filter === opt ? "bg-white text-[#201814] shadow-xs" : "text-black/50 hover:text-black"
                }`}
              >
                {opt === "ALL" ? "All" : opt === "YES" ? "Attending" : "Declined"}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Search guests by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-black/10 rounded-xl text-xs sm:text-sm outline-none focus:border-[#DCA963] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredRsvps.length === 0 ? (
            <div className="p-16 text-center text-black/40">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-xs font-medium">No RSVPs found for the selected filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-black/5 text-[10px] uppercase font-bold tracking-widest text-black/50">
                  <th className="py-3.5 pl-6 font-bold">Guest</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Party Size</th>
                  <th className="py-3.5 px-4 font-bold">Message</th>
                  <th className="py-3.5 pr-6 font-bold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-sm">
                {filteredRsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-[#FAF9F6]/50 transition-colors">
                    <td className="py-4 pl-6">
                      <div className="font-bold text-sm text-[#201814]">
                        {rsvp.guest_name || rsvp.name || rsvp.guestName}
                      </div>
                      {rsvp.email && (
                        <div className="text-xs text-black/50 flex items-center gap-1 mt-0.5 font-normal">
                          <Mail className="w-3 h-3 text-[#DCA963]" /> {rsvp.email}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {isAttending(rsvp) ? (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          Attending
                        </span>
                      ) : (
                        <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          Declined
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-serif font-bold text-base text-[#201814]">
                      {isAttending(rsvp) ? (rsvp.guests_count || rsvp.guests || 1) : "-"}
                    </td>
                    <td className="py-4 px-4 max-w-[220px] truncate text-xs text-black/70">
                      {rsvp.message ? (
                        <div className="flex items-center gap-1.5" title={rsvp.message}>
                          <MessageSquare className="w-3.5 h-3.5 text-[#DCA963] shrink-0" />
                          <span className="truncate">{rsvp.message}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-4 pr-6 text-right text-xs text-black/40 font-mono">
                      {new Date(rsvp.created_at || rsvp.submittedAt || Date.now()).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
