import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { invitationRepository } from "../../lib/repositories";
import { toast } from "sonner";
import { Loader2, Search, Filter, Eye } from "lucide-react";
import { Invitation } from "../../lib/types";

export const Route = createFileRoute("/admin/invitations")({
  component: InvitationsPage,
});

function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const data = await invitationRepository.list();
      setInvitations(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const filtered = invitations.filter(inv => {
    if (statusFilter !== "ALL" && inv.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        inv.title.toLowerCase().includes(term) ||
        inv.slug.toLowerCase().includes(term) ||
        inv.client_id.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="pb-6 border-b border-[#201814]/5 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-medium text-[#201814]">Invitations</h1>
          <p className="text-[#201814]/50 mt-1 font-light">Manage all client invitations.</p>
        </div>
      </header>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#201814]/40" />
          <input
            type="text"
            placeholder="Search by title, slug, or client ID..."
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
          <option value="DRAFT">Draft</option>
          <option value="READY">Ready</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="rounded-xl border border-[#201814]/5 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#201814]/20" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-[#201814]/5 flex items-center justify-center mx-auto mb-4">
              <Filter className="h-6 w-6 text-[#201814]/40" />
            </div>
            <h3 className="text-lg font-medium text-[#201814]">No invitations found</h3>
            <p className="text-sm text-[#201814]/50 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#201814]/5 bg-[#FDFBF7]">
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Title & Slug</th>
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Client ID</th>
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Template</th>
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Status</th>
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Created</th>
                  <th className="px-6 py-4 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201814]/5">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FDFBF7]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#201814]">{inv.title}</span>
                        <span className="text-xs text-[#201814]/50">/{inv.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#201814]/70 font-light font-mono">
                      {inv.client_id.substring(0,8)}...
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-[#201814]">
                      {inv.template_id}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${inv.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-[#201814]/5 text-[#201814]/70'}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-[#201814]">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={`/i/${inv.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#201814] hover:bg-[#201814]/5 rounded transition-colors"
                      >
                        <Eye size={14} /> Preview
                      </a>
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
