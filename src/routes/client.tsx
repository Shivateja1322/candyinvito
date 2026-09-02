import { useEffect, useState } from "react";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  Link,
  useLocation,
} from "@tanstack/react-router";
import { useAuth } from "../lib/auth-context";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Sparkles,
  Globe,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/client")({
  component: ClientLayout,
});

const clientNavigation = [
  { name: "Dashboard", href: "/client", icon: LayoutDashboard },
  { name: "Templates", href: "/client/templates", icon: FileText },
  { name: "RSVP", href: "/client/rsvp", icon: Users },
  { name: "Deployments", href: "/client/deployments", icon: Globe },
];

function ClientLayout() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Desktop sidebar collapse state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("candyinvito-client-sidebar-collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch (_) {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("candyinvito-client-sidebar-collapsed", String(next));
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
      navigate({ to: "/" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#DCA963] border-t-transparent mb-4"></div>
        <span className="font-serif text-[#201814]/70 tracking-wide text-sm">Loading Your Studio...</span>
      </div>
    );
  }

  // Allow both CLIENT and ADMIN to view client area
  if (user.role !== "CLIENT" && user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-black/10 shadow-lg space-y-4">
          <p className="font-serif text-2xl font-bold text-[#201814]">
            Access Denied
          </p>
          <p className="text-sm text-[#201814]/60">
            You are logged in, but not authorized for this area.
          </p>
          <Button
            className="bg-[#201814] text-[#FAF9F6] hover:bg-[#342820] rounded-xl px-6 py-2.5"
            onClick={() => navigate({ to: "/" })}
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // If we're inside the builder, hide the sidebar so the canvas is full width
  const isBuilder = location.pathname.includes("/client/builder");

  if (isBuilder) {
    return <Outlet />;
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white text-[#201814] border-r border-[#201814]/10 transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full w-72"
        }`}
      >
        {/* Mobile Sidebar Header */}
        <div className="p-5 border-b border-[#201814]/10 flex items-center justify-between">
          <Link to="/client" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="CandyInvito Logo"
              className="w-9 h-9 rounded-full object-cover shadow-xs shrink-0"
            />
            <div>
              <h1 className="font-serif text-base font-bold text-[#201814] leading-tight">
                CandyInvito
              </h1>
              <p className="text-[8px] tracking-[0.2em] uppercase text-[#201814]/50 font-bold">
                Client Portal
              </p>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-black/50 hover:text-black hover:bg-black/5 rounded-xl transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {clientNavigation.map((item) => {
            const isActive =
              item.href === "/client"
                ? location.pathname === "/client" || location.pathname === "/client/"
                : location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-[#201814] text-white shadow-sm"
                    : "text-[#201814]/60 hover:text-[#201814] hover:bg-[#201814]/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                  <span>{item.name}</span>
                </div>
                {isActive && <Sparkles className="h-3.5 w-3.5 text-[#DCA963]" />}
              </Link>
            );
          })}
        </nav>

        {/* Mobile User Profile Footer */}
        <div className="p-4 border-t border-[#201814]/10 bg-[#FAF9F6]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-xl bg-[#201814]/5 text-[#201814] border border-black/5 flex items-center justify-center text-xs font-bold shrink-0">
                {user.avatarInitials || user.name?.substring(0, 2).toUpperCase() || "CL"}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-[#201814] truncate">{user.name || "Client"}</span>
                <span className="text-[9px] text-[#201814]/40 uppercase tracking-widest font-bold">
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-[#201814]/40 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
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
        className={`hidden md:flex flex-col bg-white shrink-0 h-full border-r border-[#201814]/10 select-none transition-all duration-300 ease-in-out relative ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className={`p-5 border-b border-[#201814]/10 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <Link to="/client" className="flex items-center gap-3 overflow-hidden">
            <img
              src="/logo.png"
              alt="CandyInvito Logo"
              className="w-10 h-10 rounded-full object-cover shadow-xs shrink-0"
            />
            {!isCollapsed && (
              <div className="animate-fade-in truncate">
                <h1 className="font-serif text-lg font-bold tracking-tight text-[#201814] leading-tight">
                  CandyInvito
                </h1>
                <p className="text-[9px] tracking-[0.2em] uppercase text-[#201814]/50 font-bold">
                  Client Portal
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {clientNavigation.map((item) => {
            const isActive =
              item.href === "/client"
                ? location.pathname === "/client" || location.pathname === "/client/"
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
                    ? "bg-[#201814] text-white shadow-sm"
                    : "text-[#201814]/60 hover:text-[#201814] hover:bg-[#201814]/5"
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                  <item.icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </div>
                {!isCollapsed && isActive && <Sparkles className="h-3.5 w-3.5 text-[#DCA963]" />}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#201814] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-black/10">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle Button */}
        <div className="px-3 py-2 border-t border-[#201814]/10 flex items-center justify-center">
          <button
            onClick={toggleCollapse}
            className="w-full flex items-center justify-center gap-2 py-2 text-[#201814]/40 hover:text-[#201814] hover:bg-black/5 rounded-xl text-xs transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-wider"><ChevronLeft size={16} /><span>Collapse</span></div>}
          </button>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-[#201814]/10 bg-[#FAF9F6]">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-xl bg-[#201814]/5 text-[#201814] border border-black/5 flex items-center justify-center text-xs font-bold shrink-0">
                {user.avatarInitials || user.name?.substring(0, 2).toUpperCase() || "CL"}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-[#201814] truncate">{user.name || "Client"}</span>
                  <span className="text-[9px] text-[#201814]/40 uppercase tracking-widest font-bold">
                    {user.role}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={handleSignOut}
                className="p-2 text-[#201814]/40 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
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
        {/* Top Mobile Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-black/5 md:hidden shadow-xs">
          <div className="flex items-center gap-3">
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
                CandyInvito Studio
              </span>
            </div>
          </div>

          <Link
            to="/client/templates"
            className="inline-flex items-center gap-1.5 bg-[#201814] text-white px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs"
          >
            <Plus size={13} />
            <span>New</span>
          </Link>
        </header>

        {/* Sub-Route View */}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
