import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Users, FileText, Globe, Clock, ArrowUpRight, Activity } from "lucide-react";
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

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          { count: clientCount },
          { count: invCount },
          { count: hostedCount },
        ] = await Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "CLIENT"),
          supabase.from("invitations").select("*", { count: "exact", head: true }),
          supabase.from("deployment_requests").select("*", { count: "exact", head: true }).eq("status", "APPROVED"),
        ]);

        const reqs = await deploymentRequestRepository.list();
        const pendingCount = reqs.filter(r => r.status === "PENDING").length;

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
    }
    loadStats();
  }, []);

  const statCards = [
    {
      title: "Total Clients",
      value: loading ? "--" : stats.clients,
      icon: Users,
      trend: "+2%",
      subtitle: "vs last month",
      href: "/admin/users",
      highlight: false,
    },
    {
      title: "Active Invitations",
      value: loading ? "--" : stats.invitations,
      icon: FileText,
      trend: "+12%",
      subtitle: "vs last month",
      href: "/admin/invitations",
      highlight: false,
    },
    {
      title: "Pending Deployments",
      value: loading ? "--" : stats.pendingReqs,
      icon: Clock,
      trend: stats.pendingReqs > 0 ? "Action Required" : "All clear",
      subtitle: "Needs review",
      href: "/admin/deployments",
      highlight: stats.pendingReqs > 0,
    },
    {
      title: "Approved / Hosted",
      value: loading ? "--" : stats.hosted,
      icon: Globe,
      trend: "+5%",
      subtitle: "Active sites",
      href: "/admin/deployments",
      highlight: false,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="pb-6 border-b border-[#201814]/5">
        <h1 className="text-3xl font-display font-medium text-[#201814]">Dashboard</h1>
        <p className="text-[#201814]/50 mt-1 font-light">Overview of your CandyInvito Studio performance.</p>
      </header>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.href} className={`rounded-[1.25rem] border ${stat.highlight ? 'border-amber-300 bg-amber-50' : 'border-[#201814]/5 bg-white'} p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-transform hover:-translate-y-1`}>
            <div className="flex justify-between items-start mb-4">
              <span className={`text-sm font-medium ${stat.highlight ? 'text-amber-900' : 'text-[#201814]/70'}`}>{stat.title}</span>
              <div className={`p-2 rounded-lg ${stat.highlight ? 'bg-amber-200 text-amber-700' : 'bg-[#FDFBF7] text-[#201814]/40 border border-[#201814]/5'}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className={`text-3xl font-display font-medium leading-none mb-3 ${stat.highlight ? 'text-amber-900' : 'text-[#201814]'}`}>
                {stat.value}
              </div>
              <div className="flex items-center text-xs">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm mr-2 font-medium ${stat.highlight ? 'bg-amber-200 text-amber-800' : 'bg-emerald-100/60 text-emerald-700'}`}>
                  {stat.trend}
                </span>
                <span className={stat.highlight ? 'text-amber-700' : 'text-[#201814]/50'}>{stat.subtitle}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[1.25rem] border border-[#201814]/5 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display font-medium text-[#201814]">Recent Deployment Requests</h3>
            <Link to="/admin/deployments" className="text-xs text-[#201814]/50 hover:text-[#201814] transition-colors flex items-center">
              View all <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#201814]/5">
                  <th className="px-4 py-3 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Date</th>
                  <th className="px-4 py-3 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Client</th>
                  <th className="px-4 py-3 text-[10px] font-semibold tracking-widest uppercase text-[#201814]/40">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201814]/5">
                {recentRequests.map(req => (
                  <tr key={req.id} className="hover:bg-[#FDFBF7]/50">
                    <td className="px-4 py-3 text-xs font-medium text-[#201814]">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs text-[#201814]/60 font-mono">{req.requested_by.substring(0,8)}...</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentRequests.length === 0 && !loading && (
                  <tr><td colSpan={3} className="py-8 text-center text-xs text-[#201814]/40 italic">No recent requests.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-[#201814]/5 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-display font-medium text-[#201814] mb-6">System Activity</h3>
          <div className="space-y-5">
            <div className="flex">
              <div className="mt-1 mr-4 flex flex-col items-center">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
              <div>
                <p className="text-xs text-[#201814]/80 leading-relaxed">
                  <span className="font-semibold text-[#201814]">System</span> Live connection established to database
                </p>
                <p className="text-[10px] text-[#201814]/40 mt-1">Operational</p>
              </div>
            </div>
            {stats.pendingReqs > 0 && (
              <div className="flex">
                <div className="mt-1 mr-4 flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"></div>
                </div>
                <div>
                  <p className="text-xs text-[#201814]/80 leading-relaxed">
                    <span className="font-semibold text-[#201814]">Action Required</span> You have pending deployment requests
                  </p>
                  <p className="text-[10px] text-[#201814]/40 mt-1">Pending review</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

