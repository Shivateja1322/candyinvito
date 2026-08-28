import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "../lib/auth-context";
import { Button } from "../components/ui/button";
import {
  LayoutDashboard,
  Users,
  Mail,
  Globe,
  BarChart3,
  LogOut,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Invitations", href: "/admin/invitations", icon: Mail },
  { name: "Deployments", href: "/admin/deployments", icon: Globe },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

function AdminLayout() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#141210] flex items-center justify-center text-[#DCA963] font-serif text-lg animate-pulse">
        Loading CandyInvito Console...
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#141210] text-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="font-serif text-2xl mb-2 text-white">Administrator Access Required</h2>
          <p className="text-white/60 text-sm mb-6">
            Your account ({user.email}) is currently registered as a Client. Only platform administrators have access to this portal.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              className="bg-[#DCA963] hover:bg-[#C99750] text-[#141210] font-bold rounded-xl"
              onClick={() => navigate({ to: "/client" })}
            >
              Go to Client Portal
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 rounded-xl"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#FAF9F6] overflow-hidden text-[#201814] font-sans">
      {/* Sidebar - Sleek Luxury Charcoal & Gold */}
      <aside className="w-64 flex flex-col bg-[#141210] text-[#EAE6DF] shrink-0 h-full border-r border-[#27231F] select-none">
        {/* Brand Header */}
        <div className="p-6 pb-5 border-b border-[#27231F]">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="CandyInvito Logo"
              className="w-10 h-10 rounded-full object-cover shadow-sm border border-[#DCA963]/30 shrink-0"
            />
            <div>
              <h1 className="font-serif text-lg font-bold tracking-tight text-white leading-none">
                CandyInvito
              </h1>
              <p className="text-[9px] tracking-[0.25em] uppercase text-[#DCA963] font-bold mt-1">
                Admin Console
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {adminNavigation.map((item) => {
            const isActive =
              item.href === "/admin"
                ? location.pathname === "/admin" || location.pathname === "/admin/"
                : location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                  isActive
                    ? "bg-[#DCA963] text-[#141210] shadow-md font-extrabold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 1.75} />
                  <span>{item.name}</span>
                </div>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-[#141210]" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-[#27231F] bg-[#0E0C0B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-xl bg-[#DCA963]/20 text-[#DCA963] border border-[#DCA963]/30 flex items-center justify-center text-xs font-bold shrink-0">
                {user.avatarInitials || "AD"}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-white truncate">{user.name || "Administrator"}</span>
                <span className="text-[9px] text-[#DCA963] uppercase tracking-widest font-bold">
                  Super Admin
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-[#FAF9F6] flex flex-col relative">
        {/* Top Floating App Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-black/5 shadow-xs">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-black/40">
              Environment: <strong className="text-emerald-700 font-bold">Production Live</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="/client"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-white border border-black/10 hover:border-black/20 text-black px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <ExternalLink size={13} /> View Client Portal
            </a>
            <Link
              to="/admin/deployments"
              className="bg-[#141210] hover:bg-[#DCA963] hover:text-[#141210] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm"
            >
              Review Requests
            </Link>
          </div>
        </header>

        {/* Route View */}
        <div className="flex-1 p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
