import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { rsvpRepository } from "../../lib/repositories";
import { toast } from "sonner";
import { Loader2, Download, Filter, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/rsvps")({
  component: RsvpsPage,
});

function RsvpsPage() {
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRsvps();
  }, []);

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

  const handleExport = () => {
    if (filteredRsvps.length === 0) return;
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
    a.download = "candyinvito_rsvps.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="pb-6 border-b border-[#201814]/5 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-medium text-[#201814]">RSVPs</h1>
          <p className="text-[#201814]/50 mt-1 font-light">Inspect all client RSVP submissions.</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 bg-[#201814] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-black transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </header>

      <div className="rounded-xl border border-[#201814]/5 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#201814]/20" />
          </div>
        ) : filteredRsvps.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-[#201814]/5 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-[#201814]/40" />
            </div>
            <h3 className="text-lg font-medium text-[#201814]">No RSVPs found</h3>
            <p className="text-sm text-[#201814]/50 mt-1">Wait for clients to receive RSVP submissions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#201814]/5 bg-[#FDFBF7]">
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Date</th>
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Guest</th>
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Invitation</th>
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Status</th>
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201814]/5">
                {rsvps.map((req, idx) => (
                  <tr key={req.id || idx} className="hover:bg-[#FDFBF7]/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-[#201814]">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString() : (req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : "")}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#201814]">
                      {req.guest_name || req.guestName}
                      <div className="text-xs text-[#201814]/50 font-light mt-0.5">
                        {req.guests_count || req.guestCount} Guest(s)
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {req.invitation?.title || req.invitationId}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${(req.status === "ATTENDING" || req.attending) ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {(req.status === "ATTENDING" || req.attending) ? "ATTENDING" : "NOT ATTENDING"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#201814]/70 max-w-[200px] truncate" title={req.message || req.dietaryRestrictions}>
                      {req.message || req.dietaryRestrictions || "-"}
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
