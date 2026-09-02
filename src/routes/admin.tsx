import { useEffect, useState } from "react";
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
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Invitations", href: "/admin/invitations", icon: Mail },
  { name: "Deployments", href: "/admin/deployments", icon: Globe },
  { name: "RSVPs", href: "/admin/rsvps", icon: MessageSquare },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

function AdminLayout() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Desktop sidebar collapse state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("candyinvito-admin-sidebar-collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch (_) {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("candyinvito-admin-sidebar-collapsed", String(next));
      } catch (_) {}
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#DCA963] border-t-transparent rounded-full animate-spin" />
          <span>Loading CandyInvito Console...</span>
        </div>
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#141210] text-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="font-serif text-2xl mb-2 text-white font-bold">Administrator Access Required</h2>
          <p className="text-white/60 text-sm mb-6 leading-relaxed">
            Your account (<span className="text-[#DCA963] font-mono">{user.email}</span>) is registered as a Client. Only platform administrators have access to this portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="bg-[#DCA963] hover:bg-[#C99750] text-[#141210] font-bold rounded-xl px-6 py-2.5 shadow-sm"
              onClick={() => navigate({ to: "/client" })}
            >
              Go to Client Portal
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 rounded-xl px-6 py-2.5"
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
      {/* ========================================================================= */}
      {/* MOBILE DRAWER BACKDROP & SIDEBAR                                          */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#141210] text-[#EAE6DF] border-r border-[#27231F] transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full w-72"
        }`}
      >
        {/* Mobile Sidebar Header */}
        <div className="p-5 border-b border-[#27231F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="CandyInvito Logo"
              className="w-9 h-9 rounded-full object-cover border border-[#DCA963]/30 shrink-0"
            />
            <div>
              <h1 className="font-serif text-base font-bold text-white leading-tight">
                CandyInvito
              </h1>
              <p className="text-[8px] tracking-[0.2em] uppercase text-[#DCA963] font-bold">
                Admin Console
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
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
                  <item.icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.5 : 1.75} />
                  <span>{item.name}</span>
                </div>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-[#141210]" />}
              </Link>
            );
          })}
        </nav>

        {/* Mobile User Profile Footer */}
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
              className="p-2 text-white/40 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* DESKTOP COLLAPSIBLE SIDEBAR                                               */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col bg-[#141210] text-[#EAE6DF] shrink-0 h-full border-r border-[#27231F] select-none transition-all duration-300 ease-in-out relative ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className={`p-5 border-b border-[#27231F] flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/logo.png"
              alt="CandyInvito Logo"
              className="w-10 h-10 rounded-full object-cover shadow-sm border border-[#DCA963]/30 shrink-0"
            />
            {!isCollapsed && (
              <div className="animate-fade-in truncate">
                <h1 className="font-serif text-lg font-bold tracking-tight text-white leading-none">
                  CandyInvito
                </h1>
                <p className="text-[9px] tracking-[0.22em] uppercase text-[#DCA963] font-bold mt-1">
                  Admin Console
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {adminNavigation.map((item) => {
            const isActive =
              item.href === "/admin"
                ? location.pathname === "/admin" || location.pathname === "/admin/"
                : location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center ${
                  isCollapsed ? "justify-center px-0 py-3" : "justify-between px-4 py-3"
                } rounded-xl text-xs uppercase tracking-wider font-bold transition-all group relative ${
                  isActive
                    ? "bg-[#DCA963] text-[#141210] shadow-md font-extrabold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                  <item.icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.5 : 1.75} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </div>
                {!isCollapsed && isActive && <div className="h-1.5 w-1.5 rounded-full bg-[#141210]" />}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#201814] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-white/10">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle Button */}
        <div className="px-3 py-2 border-t border-[#27231F] flex items-center justify-center">
          <button
            onClick={toggleCollapse}
            className="w-full flex items-center justify-center gap-2 py-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl text-xs transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-wider"><ChevronLeft size={16} /><span>Collapse</span></div>}
          </button>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-[#27231F] bg-[#0E0C0B]">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-xl bg-[#DCA963]/20 text-[#DCA963] border border-[#DCA963]/30 flex items-center justify-center text-xs font-bold shrink-0">
                {user.avatarInitials || "AD"}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-white truncate">{user.name || "Administrator"}</span>
                  <span className="text-[9px] text-[#DCA963] uppercase tracking-widest font-bold">
                    Super Admin
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={handleSignOut}
                className="p-2 text-white/40 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA                                                         */}
      {/* ========================================================================= */}
      <main className="flex-1 overflow-y-auto bg-[#FAF9F6] flex flex-col relative w-full">
        {/* Top Header Bar (Desktop & Mobile) */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-black/5 shadow-xs">
          {/* Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-[#201814] hover:bg-black/5 rounded-xl transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="CandyInvito" className="w-7 h-7 rounded-full object-cover" />
              <span className="font-serif font-bold text-sm tracking-tight text-[#201814]">
                CandyInvito Admin
              </span>
            </div>
          </div>

          {/* Desktop Status Pill */}
          <div className="hidden md:flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck size={13} className="text-emerald-600" /> Production Live
            </span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/client"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-white border border-black/10 hover:border-black/20 text-[#201814] px-3 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Client Portal</span>
            </a>
            <Link
              to="/admin/deployments"
              className="bg-[#141210] hover:bg-[#DCA963] hover:text-[#141210] text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
            >
              Deployments
            </Link>
          </div>
        </header>

        {/* Sub-Route View */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
