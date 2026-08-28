import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  BarChart3,
  Users,
  Mail,
  Globe,
  CheckCircle2,
  Clock,
  XCircle,
  UsersRound,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [usersRes, invRes, depRes, rsvpRes] = await Promise.all([
        supabase.from("users").select("role"),
        supabase.from("invitations").select("*", { count: "exact", head: true }),
        supabase.from("deployment_requests").select("status"),
        supabase.from("rsvps").select("status, attending, guests_count"),
      ]);

      const users = usersRes.data || [];
      const clientsCount = users.filter((u) => u.role?.toUpperCase() === "CLIENT").length;

      const deployments = depRes.data || [];
      const pending = deployments.filter((d) => d.status === "PENDING").length;
      const approved = deployments.filter((d) => d.status === "APPROVED").length;
      const hosted = deployments.filter((d) => d.status === "HOSTED").length;
      const rejected = deployments.filter((d) => d.status === "REJECTED").length;

      const rsvps = rsvpRes.data || [];
      const totalRsvps = rsvps.length;
      const attendingRsvps = rsvps.filter(
        (r) => r.status === "ATTENDING" || r.attending === "YES" || r.attending === true,
      ).length;

      setStats({
        clients: clientsCount,
        invitations: invRes.count || 0,
        deployments: deployments.length,
        pending,
        approved,
        hosted,
        rejected,
        totalRsvps,
        attendingRsvps,
      });
    } catch (e) {
      console.error("Analytics loadData error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Enable real-time updates via Supabase Broadcast / Postgres Changes
    const channel = supabase
      .channel("admin-analytics-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "deployment_requests" }, () =>
        loadData(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "invitations" }, () =>
        loadData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#DCA963]" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in font-sans">
      <header className="pb-6 border-b border-[#201814]/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#201814]/50 font-bold mb-1">
            Studio Intelligence
          </p>
          <h1 className="text-3xl font-display font-medium tracking-tight text-[#201814]">
            Platform Analytics
          </h1>
        </div>
        <span className="text-xs text-[#201814]/60">
          Real-time Live Sync: <strong className="text-emerald-700">Active</strong>
        </span>
      </header>

      {/* Primary Overview Cards */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-black/50 mb-4">
          Core Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users size={20} />}
            label="Total Clients"
            value={stats?.clients}
            description="Registered couple accounts"
          />
          <StatCard
            icon={<Mail size={20} />}
            label="Total Invitations"
            value={stats?.invitations}
            description="Created wedding designs"
          />
          <StatCard
            icon={<Globe size={20} />}
            label="Total Deployments"
            value={stats?.deployments}
            description="Submitted hosting requests"
          />
          <StatCard
            icon={<UsersRound size={20} />}
            label="Total RSVPs"
            value={stats?.totalRsvps}
            description={`${stats?.attendingRsvps || 0} Attending guests`}
          />
        </div>
      </div>

      {/* Deployment Breakdown */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-black/50 mb-4">
          Hosting Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Clock size={20} />}
            label="Pending Deployments"
            value={stats?.pending}
            description="Awaiting admin approval"
            color="amber"
          />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Approved Requests"
            value={stats?.approved}
            description="Ready for domain hosting"
            color="emerald"
          />
          <StatCard
            icon={<Globe size={20} />}
            label="Hosted & Live"
            value={stats?.hosted}
            description="Accessible to wedding guests"
            color="indigo"
          />
          <StatCard
            icon={<XCircle size={20} />}
            label="Rejected Requests"
            value={stats?.rejected}
            description="Revision requested"
            color="rose"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  description?: string;
  color?: "amber" | "emerald" | "indigo" | "rose";
}) {
  const iconColors = {
    amber: "text-amber-700 bg-amber-50",
    emerald: "text-emerald-700 bg-emerald-50",
    indigo: "text-indigo-700 bg-indigo-50",
    rose: "text-rose-700 bg-rose-50",
  };

  const currentIconColor = color ? iconColors[color] : "text-[#DCA963] bg-[#DCA963]/10";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-black/10 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-black/60">
          {label}
        </span>
        <div className={`p-2 rounded-xl ${currentIconColor}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-4xl font-serif font-bold text-[#201814] mb-1">{value || 0}</p>
        {description && (
          <p className="text-xs text-black/50 font-medium">{description}</p>
        )}
      </div>
    </div>
  );
}
