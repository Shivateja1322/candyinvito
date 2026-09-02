import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { rsvpRepository } from "../../lib/repositories";
import { toast } from "sonner";
import { Loader2, Download, Filter, FileText, Sparkles, MessageSquare, Mail } from "lucide-react";

export const Route = createFileRoute("/admin/rsvps")({
  component: RsvpsPage,
});

function RsvpsPage() {
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRsvps = async () => {
    try {
      setLoading(true);
      const data = await rsvpRepository.list();
      setRsvps(data);
    } catch (err: any) {
      toast.error("Failed to load RSVPs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRsvps();

    const channel = supabase
      .channel("admin-rsvps-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, () => fetchRsvps())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleExport = () => {
    if (rsvps.length === 0) return;
    const headers = ["Date", "Invitation", "Guest Name", "Status", "Guests Count", "Message"];
    const csvRows = [headers.join(",")];
    for (const r of rsvps) {
      const date = r.created_at ? new Date(r.created_at).toLocaleDateString() : (r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "");
      const invTitle = r.invitation?.title || r.invitationId || "";
      const name = r.guest_name || r.guestName || "";
      const status = r.status || (r.attending ? "ATTENDING" : "NOT_ATTENDING");
      const count = r.guests_count || r.guestCount || 1;
      const message = r.message || r.dietaryRestrictions || "";
      const escapeCSV = (str: string) => `"${String(str).replace(/"/g, '""')}"`;
      csvRows.push(`${escapeCSV(date)},${escapeCSV(invTitle)},${escapeCSV(name)},${escapeCSV(status)},${escapeCSV(count)},${escapeCSV(message)}`);
    }
    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candyinvito_rsvps_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("RSVPs exported to CSV!");
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-10">
      {/* Header */}
      <header className="pb-6 border-b border-[#201814]/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#201814]/50 font-bold mb-1.5 flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#DCA963]" /> Guest Attendance & Registry
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#201814]">
            Global RSVPs
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={rsvps.length === 0}
            className="flex items-center gap-2 bg-[#141210] hover:bg-[#DCA963] hover:text-[#141210] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs disabled:opacity-50"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </header>

      {/* RSVPs Table Card */}
      <div className="rounded-2xl border border-[#201814]/10 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#DCA963]" />
            <span className="text-xs text-black/40">Loading guest RSVP responses...</span>
          </div>
        ) : rsvps.length === 0 ? (
          <div className="p-16 text-center">
            <div className="h-12 w-12 rounded-full bg-[#201814]/5 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-[#201814]/40" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#201814]">No RSVPs found</h3>
            <p className="text-xs text-[#201814]/50 mt-1">Guest submissions will appear here once invitations are live.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-[#201814]/5 bg-[#FAF9F6]">
                  <th className="px-5 py-4 text-[10px] font-bold tracking-widest uppercase text-[#201814]/50">
                    Date
                  </th>
                  <th className="px-5 py-4 text-[10px] font-bold tracking-widest uppercase text-[#201814]/50">
                    Guest Name
                  </th>
                  <th className="px-5 py-4 text-[10px] font-bold tracking-widest uppercase text-[#201814]/50">
                    Invitation
                  </th>
                  <th className="px-5 py-4 text-[10px] font-bold tracking-widest uppercase text-[#201814]/50">
                    Status
                  </th>
                  <th className="px-5 py-4 text-[10px] font-bold tracking-widest uppercase text-[#201814]/50">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201814]/5">
                {rsvps.map((req, idx) => {
                  const isAttending = req.status === "ATTENDING" || req.attending === "YES" || req.attending === true;

                  return (
                    <tr key={req.id || idx} className="hover:bg-[#FAF9F6]/60 transition-colors">
                      <td className="px-5 py-4 text-xs font-semibold text-[#201814]">
                        {req.created_at
                          ? new Date(req.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : req.submittedAt
                            ? new Date(req.submittedAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : ""}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-sm text-[#201814]">
                          {req.guest_name || req.guestName}
                        </div>
                        <div className="text-xs text-[#201814]/50 font-medium mt-0.5">
                          {req.guests_count || req.guestCount || 1} Guest(s)
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-[#201814]">
                        {req.invitation?.title || req.invitationId || "Wedding"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isAttending
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {isAttending ? "ATTENDING" : "DECLINED"}
                        </span>
                      </td>
                      <td
                        className="px-5 py-4 text-xs text-[#201814]/70 max-w-[240px] truncate"
                        title={req.message || req.dietaryRestrictions}
                      >
                        {req.message || req.dietaryRestrictions || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
