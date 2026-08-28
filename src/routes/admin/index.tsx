import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Users, FileText, Globe, Clock, ArrowUpRight, CheckCircle2, Shield, Activity, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
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
      value: loading ? "--" : stats.clients,
      icon: Users,
      trend: "Active couples",
      href: "/admin/users",
      highlight: false,
    },
    {
      title: "Total Invitations",
      value: loading ? "--" : stats.invitations,
      icon: FileText,
      trend: "Designs created",
      href: "/admin/invitations",
      highlight: false,
    },
    {
      title: "Pending Reviews",
      value: loading ? "--" : stats.pendingReqs,
      icon: Clock,
      trend: stats.pendingReqs > 0 ? "Action Required" : "All clear",
      href: "/admin/deployments",
      highlight: stats.pendingReqs > 0,
    },
    {
      title: "Hosted & Live Sites",
      value: loading ? "--" : stats.hosted,
      icon: Globe,
      trend: "Publicly accessible",
      href: "/admin/deployments",
      highlight: false,
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in font-sans">
      <header className="pb-6 border-b border-[#201814]/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#201814]/50 font-bold mb-1">
            Studio Overview
          </p>
          <h1 className="text-3xl font-display font-medium tracking-tight text-[#201814]">
            Executive Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 size={12} /> Database Connected
          </span>
        </div>
      </header>

      {/* Metric Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.href}
            className={`rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5 ${
              stat.highlight
                ? "border-amber-400/60 bg-amber-50/50"
                : "border-black/10 bg-white"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-black/60">
                {stat.title}
              </span>
              <div
                className={`p-2.5 rounded-xl ${
                  stat.highlight
                    ? "bg-amber-500 text-white"
                    : "bg-[#201814]/5 text-[#201814]"
                }`}
              >
                <stat.icon size={18} />
              </div>
            </div>
            <div>
              <div className="text-4xl font-serif font-bold text-[#201814] mb-2">
                {stat.value}
              </div>
              <div className="text-xs font-medium text-black/50">
                {stat.trend}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Deployment Requests */}
        <div className="lg:col-span-2 rounded-2xl border border-black/10 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-black/5">
            <h3 className="text-lg font-serif font-medium text-[#201814]">
              Recent Deployment Activity
            </h3>
            <Link
              to="/admin/deployments"
              className="text-xs font-bold uppercase tracking-wider text-[#DCA963] hover:text-[#201814] transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 text-[10px] uppercase font-bold tracking-widest text-black/40">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Client Request</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#FAF9F6]/50 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-medium text-[#201814]">
                      {new Date(req.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-black/70 font-mono">
                      {req.requested_by.substring(0, 10)}...
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          req.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : req.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : req.status === "HOSTED"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to="/admin/deployments"
                        className="text-xs font-bold uppercase tracking-wider text-[#201814] hover:text-[#DCA963]"
                      >
                        Review
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
              </tbody>
            </table>
          </div>
        </div>

        {/* Studio Quick Actions */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-serif font-medium text-[#201814] pb-3 border-b border-black/5">
            Quick Actions
          </h3>

          <div className="space-y-3">
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-4 rounded-xl border border-black/5 hover:border-[#DCA963] hover:bg-[#FAF9F6] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#201814]/5 text-[#201814] rounded-lg group-hover:bg-[#DCA963] group-hover:text-white transition-colors">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#201814]">
                    Add Client Account
                  </p>
                  <p className="text-[11px] text-black/50">Register couples & assign roles</p>
                </div>
              </div>
              <ArrowUpRight size={14} className="text-black/30 group-hover:text-[#201814]" />
            </Link>

            <Link
              to="/admin/invitations"
              className="flex items-center justify-between p-4 rounded-xl border border-black/5 hover:border-[#DCA963] hover:bg-[#FAF9F6] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#201814]/5 text-[#201814] rounded-lg group-hover:bg-[#DCA963] group-hover:text-white transition-colors">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#201814]">
                    Manage Invitations
                  </p>
                  <p className="text-[11px] text-black/50">Preview designs and live registry</p>
                </div>
              </div>
              <ArrowUpRight size={14} className="text-black/30 group-hover:text-[#201814]" />
            </Link>

            <Link
              to="/admin/analytics"
              className="flex items-center justify-between p-4 rounded-xl border border-black/5 hover:border-[#DCA963] hover:bg-[#FAF9F6] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#201814]/5 text-[#201814] rounded-lg group-hover:bg-[#DCA963] group-hover:text-white transition-colors">
                  <Activity size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#201814]">
                    View Live Analytics
                  </p>
                  <p className="text-[11px] text-black/50">Response counts & system metrics</p>
                </div>
              </div>
              <ArrowUpRight size={14} className="text-black/30 group-hover:text-[#201814]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
