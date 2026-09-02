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
  Activity,
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
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#DCA963]" />
        <span className="text-xs text-black/40 font-sans">Compiling live analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in font-sans pb-10">
      {/* Header */}
      <header className="pb-6 border-b border-[#201814]/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#201814]/50 font-bold mb-1.5 flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#DCA963]" /> Studio Intelligence & Metrics
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#201814]">
            Platform Analytics
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Activity size={12} className="text-emerald-600 animate-pulse" /> Live Realtime Sync
          </span>
        </div>
      </header>

      {/* Primary Overview Cards */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-black/50">
          Core Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-black/50">
          Hosting Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            icon={<Clock size={20} />}
            label="Pending Reviews"
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
    amber: "text-amber-800 bg-amber-100 border border-amber-200",
    emerald: "text-emerald-800 bg-emerald-100 border border-emerald-200",
    indigo: "text-indigo-800 bg-indigo-100 border border-indigo-200",
    rose: "text-rose-800 bg-rose-100 border border-rose-200",
  };

  const currentIconColor = color ? iconColors[color] : "text-[#141210] bg-[#DCA963]/20 border border-[#DCA963]/30";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-black/10 flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-black/60 group-hover:text-black transition-colors">
          {label}
        </span>
        <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${currentIconColor}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl sm:text-4xl font-serif font-bold text-[#201814] mb-1.5 tracking-tight">
          {value || 0}
        </p>
        {description && (
          <p className="text-xs text-black/50 font-medium">{description}</p>
        )}
      </div>
    </div>
  );
}
