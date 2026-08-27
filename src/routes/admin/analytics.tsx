import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { BarChart3, Users, Mail, Globe, CheckCircle, Clock, XCircle, UsersRound } from "lucide-react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const clientsRes = await supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "CLIENT");
        const invRes = await supabase.from("invitations").select("*", { count: "exact", head: true });
        
        const depRes = await supabase.from("deployment_requests").select("status");
        const deployments = depRes.data || [];
        const pending = deployments.filter(d => d.status === "PENDING").length;
        const approved = deployments.filter(d => d.status === "APPROVED").length;
        const hosted = deployments.filter(d => d.status === "HOSTED").length;
        const rejected = deployments.filter(d => d.status === "REJECTED").length;

        const rsvpRes = await supabase.from("rsvps").select("attending, guests_count, guests");
        const rsvps = rsvpRes.data || [];
        const totalRsvps = rsvps.length;
        const attendingRsvps = rsvps.filter(r => r.attending === "YES").length;
        
        setStats({
          clients: clientsRes.count || 0,
          invitations: invRes.count || 0,
          deployments: deployments.length,
          pending,
          approved,
          hosted,
          rejected,
          totalRsvps,
          attendingRsvps
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-10 flex items-center justify-center"><Loader2 className="animate-spin text-black/50" /></div>;

  return (
    <div className="p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#201814]">Analytics</h1>
        <p className="text-black/50">Real-time platform metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Clients" value={stats?.clients} />
        <StatCard icon={<Mail className="w-5 h-5" />} label="Total Invitations" value={stats?.invitations} />
        <StatCard icon={<Globe className="w-5 h-5" />} label="Total Deployments" value={stats?.deployments} />
        <StatCard icon={<UsersRound className="w-5 h-5" />} label="Total RSVPs" value={stats?.totalRsvps} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Clock className="w-5 h-5" />} label="Pending Deployments" value={stats?.pending} />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Approved Deployments" value={stats?.approved} />
        <StatCard icon={<Globe className="w-5 h-5" />} label="Hosted Invitations" value={stats?.hosted} />
        <StatCard icon={<XCircle className="w-5 h-5" />} label="Rejected Deployments" value={stats?.rejected} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
      <div className="flex items-center gap-4 mb-4 text-[#DCA963]">
        {icon}
      </div>
      <p className="text-sm font-medium text-black/50 mb-1">{label}</p>
      <p className="text-3xl font-serif text-[#201814]">{value || 0}</p>
    </div>
  );
}
