import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, Navigate, Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "../lib/auth-context";
import { Button } from "../components/ui/button";
import {
  LayoutDashboard,
  Users,
  Mail,
  FileText,
  Palette,
  Globe,
  BarChart,
  Settings,
  LogOut,
  Sparkles,
  ArrowRightToLine,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Invitations", href: "/admin/invitations", icon: Mail },
  { name: "Deployments", href: "/admin/deployments", icon: Globe },
  { name: "RSVPs", href: "/admin/rsvps", icon: FileText },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart },
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
      navigate({ to: "/" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">Loading...</div>;
  }
  if (user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center space-y-4">
        <p className="font-display text-xl text-[#201814]">
          Access Denied. You are logged in, but not authorized for this area.
        </p>
        <Button
          className="bg-[#201814] text-[#FDFBF7] hover:bg-[#342820]"
          onClick={() => navigate({ to: "/" })}
        >
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#FDFBF7] overflow-hidden text-[#201814]">
      {/* Sidebar - Dark Luxury */}
      <aside className="w-64 flex flex-col bg-[#201814] text-[#ece6dc] shrink-0 h-full border-r border-[#342820]">
        <div className="p-8 pb-6">
          <h1 className="font-display text-2xl font-medium tracking-wide">CandyInvito</h1>
          <p className="text-[10px] tracking-widest uppercase text-white/50 mt-1 font-medium">
            Studio Console
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {adminNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-light transition-all ${
                  isActive
                    ? "bg-[#ece6dc] text-[#201814] font-medium shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="h-4 w-4 mr-3" strokeWidth={isActive ? 2 : 1.5} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? "bg-[#201814] text-[#ece6dc]" : "bg-white/10 text-white"}`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && (
                  <div className="h-1.5 w-1.5 rounded-full bg-[#201814]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 space-y-4">
          {/* User Profile */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-amber-900/40 text-amber-500/80 flex items-center justify-center text-xs font-medium mr-3">
                {user.avatarInitials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white/90">{user.name}</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest">Owner</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-white/40 hover:text-white transition-colors"
              title="Sign Out"
            >
              <ArrowRightToLine className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-[#FDFBF7] flex flex-col relative">
        {/* Subtle noise texture or gradient could go here */}

        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-5 bg-[#FDFBF7]/90 backdrop-blur-md">
          <div className="relative w-96">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#201814]/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search clients, invitations, templates..."
              className="w-full bg-white border border-[#201814]/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#201814]/30 placeholder:text-[#201814]/40 transition-shadow shadow-sm"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="h-10 w-10 rounded-full border border-[#201814]/10 bg-white flex items-center justify-center text-[#201814]/60 hover:text-[#201814] transition-colors shadow-sm relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-red-400 rounded-full border border-white"></div>
            </button>
            <button className="bg-[#201814] text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center shadow-md hover:shadow-lg hover:bg-[#342820] transition-all">
              <span className="text-lg leading-none mr-2">+</span> New invitation
            </button>
          </div>
        </header>

        <div className="flex-1 px-8 pb-12 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
