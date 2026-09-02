import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Users,
  FileText,
  Globe,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Activity,
  Sparkles,
  Loader2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { deploymentRequestRepository } from "../../lib/repositories";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    invitations: 0,
    pendingReqs: 0,
    hosted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  const loadStats = async () => {
    try {
      const [
        { count: clientCount },
        { count: invCount },
        { count: hostedCount },
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "CLIENT"),
        supabase.from("invitations").select("*", { count: "exact", head: true }),
        supabase.from("deployment_requests").select("*", { count: "exact", head: true }).eq("status", "HOSTED"),
      ]);

      const reqs = await deploymentRequestRepository.list();
      const pendingCount = reqs.filter((r) => r.status === "PENDING").length;

      setStats({
        clients: clientCount || 0,
        invitations: invCount || 0,
        pendingReqs: pendingCount,
        hosted: hostedCount || 0,
      });

      setRecentRequests(reqs.slice(0, 5));
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    // Enable realtime sync
    const channel = supabase
      .channel("admin-dashboard-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "deployment_requests" }, () =>
        loadStats(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "invitations" }, () =>
        loadStats(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () =>
        loadStats(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const statCards = [
    {
      title: "Registered Clients",
      value: stats.clients,
      icon: Users,
      trend: "Active couples in studio",
      href: "/admin/users",
      highlight: false,
    },
    {
      title: "Total Invitations",
      value: stats.invitations,
      icon: FileText,
      trend: "Bespoke designs created",
      href: "/admin/invitations",
      highlight: false,
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReqs,
      icon: Clock,
      trend: stats.pendingReqs > 0 ? "Action Required" : "All reviews up to date",
      href: "/admin/deployments",
      highlight: stats.pendingReqs > 0,
    },
    {
      title: "Hosted & Live Sites",
      value: stats.hosted,
      icon: Globe,
      trend: "Live celebration links",
      href: "/admin/deployments",
      highlight: false,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-10">
      {/* Page Header */}
      <header className="pb-6 border-b border-[#201814]/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#201814]/50 font-bold mb-1.5 flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#DCA963]" /> Studio Executive Console
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#201814]">
            Overview Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs">
            <CheckCircle2 size={13} className="text-emerald-600" /> Database Live
          </span>
        </div>
      </header>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.href}
            className={`rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group ${
              stat.highlight
                ? "border-amber-400/80 bg-amber-50/70"
                : "border-black/10 bg-white"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-black/60 group-hover:text-black transition-colors">
                {stat.title}
              </span>
              <div
                className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${
                  stat.highlight
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-[#201814]/5 text-[#201814]"
                }`}
              >
                <stat.icon size={18} />
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-[#201814] mb-1.5 tracking-tight">
                {loading ? (
                  <div className="h-9 w-16 bg-black/5 animate-pulse rounded-lg" />
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-xs font-medium text-black/50">
                {stat.trend}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Deployment Requests */}
        <div className="lg:col-span-2 rounded-2xl border border-black/10 bg-white p-5 sm:p-6 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-black/5">
            <h3 className="text-lg font-serif font-bold text-[#201814]">
              Recent Deployment Activity
            </h3>
            <Link
              to="/admin/deployments"
              className="text-xs font-bold uppercase tracking-wider text-[#DCA963] hover:text-[#201814] transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full text-left border-collapse min-w-[480px]">
              <thead>
                <tr className="border-b border-black/5 text-[10px] uppercase font-bold tracking-widest text-black/40">
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2">Client Request</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                    <td className="py-3.5 px-2 text-xs font-semibold text-[#201814]">
                      {new Date(req.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-2 text-xs text-black/70 font-mono">
                      {req.requested_by.substring(0, 10)}...
                    </td>
                    <td className="py-3.5 px-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          req.status === "PENDING"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : req.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : req.status === "HOSTED"
                                ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <Link
                        to="/admin/deployments"
                        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#201814] hover:text-[#DCA963] transition-colors"
                      >
                        Review <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentRequests.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-xs text-black/40 italic">
                      No recent deployment activity.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-black/40">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#DCA963] mb-2" />
                      Loading activity...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Studio Quick Actions */}
        <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#201814] pb-3 border-b border-black/5">
              Quick Management
            </h3>

            <div className="space-y-3 mt-4">
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-4 rounded-xl border border-black/5 hover:border-[#DCA963] hover:bg-[#FAF9F6] transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#201814]/5 text-[#201814] rounded-xl group-hover:bg-[#DCA963] group-hover:text-white transition-colors">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#201814]">
                      Add Client Account
                    </p>
                    <p className="text-[11px] text-black/50">Register couples & assign roles</p>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-black/30 group-hover:text-[#201814] transition-colors" />
              </Link>

              <Link
                to="/admin/invitations"
                className="flex items-center justify-between p-4 rounded-xl border border-black/5 hover:border-[#DCA963] hover:bg-[#FAF9F6] transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#201814]/5 text-[#201814] rounded-xl group-hover:bg-[#DCA963] group-hover:text-white transition-colors">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#201814]">
                      Manage Invitations
                    </p>
                    <p className="text-[11px] text-black/50">Preview designs and live registry</p>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-black/30 group-hover:text-[#201814] transition-colors" />
              </Link>

              <Link
                to="/admin/analytics"
                className="flex items-center justify-between p-4 rounded-xl border border-black/5 hover:border-[#DCA963] hover:bg-[#FAF9F6] transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#201814]/5 text-[#201814] rounded-xl group-hover:bg-[#DCA963] group-hover:text-white transition-colors">
                    <Activity size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#201814]">
                      Platform Analytics
                    </p>
                    <p className="text-[11px] text-black/50">Response counts & system metrics</p>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-black/30 group-hover:text-[#201814] transition-colors" />
              </Link>
            </div>
          </div>

          <div className="p-4 bg-[#FAF9F6] rounded-xl border border-black/5 text-center">
            <p className="text-xs font-serif italic text-black/60">
              CandyInvito Studio Production v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
