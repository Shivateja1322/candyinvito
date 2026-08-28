import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { invitationRepository } from "../../lib/repositories";
import { toast } from "sonner";
import { Loader2, Search, Filter, Eye, Trash2, Copy, ExternalLink } from "lucide-react";
import { Invitation } from "../../lib/types";

export const Route = createFileRoute("/admin/invitations")({
  component: InvitationsPage,
});

function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

  useEffect(() => {
    fetchInvitations();

    // Enable realtime sync on invitations table
    const channel = supabase
      .channel("admin-invitations-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "invitations" }, () =>
        fetchInvitations(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteInvitation = async (id: string, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete invitation "${title}"?\n\nThis will remove all associated RSVPs and deployment requests permanently.`,
      )
    ) {
      return;
    }

    setIsDeleting(id);
    try {
      await invitationRepository.remove(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
      toast.success(`Invitation "${title}" deleted.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete invitation.");
    } finally {
      setIsDeleting(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  const filtered = invitations.filter((inv) => {
    if (statusFilter !== "ALL") {
      const invStatus = (inv.status || "Draft").toUpperCase();
      if (invStatus !== statusFilter.toUpperCase()) return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (inv.title || "").toLowerCase().includes(term) ||
        (inv.slug || "").toLowerCase().includes(term) ||
        (inv.client_id || "").toLowerCase().includes(term) ||
        (inv.template_id || "").toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <header className="pb-6 border-b border-[#201814]/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#201814]/50 font-bold mb-1">
            Studio Invitations
          </p>
          <h1 className="text-3xl font-display font-medium text-[#201814]">
            Invitation Registry
          </h1>
        </div>
        <span className="text-xs text-[#201814]/60">
          Showing <strong className="text-[#201814]">{filtered.length}</strong> of {invitations.length} invitations
        </span>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#201814]/40" />
          <input
            type="text"
            placeholder="Search by couple title, slug, or theme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#201814]/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#DCA963] shadow-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-[#201814]/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#DCA963] shadow-xs cursor-pointer font-medium"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="HOSTED">Hosted / Live</option>
        </select>
      </div>

      {/* Invitations Table Card */}
      <div className="rounded-2xl border border-[#201814]/10 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#DCA963]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="h-12 w-12 rounded-full bg-[#201814]/5 flex items-center justify-center mx-auto mb-4">
              <Filter className="h-6 w-6 text-[#201814]/40" />
            </div>
            <h3 className="text-lg font-serif font-medium text-[#201814]">No invitations found</h3>
            <p className="text-xs text-[#201814]/50 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#201814]/5 bg-[#FAF9F6]">
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-[#201814]/50">
                    Couple & Slug
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-[#201814]/50">
                    Theme / Template
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-[#201814]/50">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-[#201814]/50">
                    Created Date
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-[#201814]/50 text-right pr-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201814]/5">
                {filtered.map((inv) => {
                  const previewUrl = `/i/${inv.slug}?mode=preview`;
                  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/i/${inv.slug}`;
                  const isPublished = (inv.status || "").toLowerCase() === "published";

                  return (
                    <tr key={inv.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#201814]">
                            {inv.couple_names || inv.title || "Untitled Wedding"}
                          </span>
                          <span className="text-xs text-[#201814]/50 font-mono">
                            /{inv.slug}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-[#201814]">
                        <span className="bg-black/5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-black/70">
                          {inv.template_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPublished
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {inv.status || "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#201814]/70 font-medium">
                        {new Date(inv.created_at || Date.now()).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {/* Preview Link (Never 404s) */}
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#201814] bg-black/5 hover:bg-[#DCA963] hover:text-white rounded-lg transition-colors"
                            title="Preview Invitation"
                          >
                            <Eye size={13} /> Preview
                          </a>

                          {/* Copy Public Link */}
                          <button
                            onClick={() => copyToClipboard(publicUrl)}
                            className="p-2 text-black/50 hover:text-black hover:bg-black/5 rounded-lg transition-colors"
                            title="Copy Public Link"
                          >
                            <Copy size={14} />
                          </button>

                          {/* Delete Invitation */}
                          <button
                            onClick={() =>
                              handleDeleteInvitation(
                                inv.id,
                                inv.couple_names || inv.title || inv.slug,
                              )
                            }
                            disabled={isDeleting === inv.id}
                            className="p-2 text-black/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Invitation"
                          >
                            {isDeleting === inv.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
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
    </div>
  );
}
