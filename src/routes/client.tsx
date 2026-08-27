import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "../lib/auth-context";
import {
  LayoutDashboard,
  Mail,
  FileText,
  Palette,
  Eye,
  Users,
  Globe,
  BarChart,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/client")({
  component: ClientLayout,
});

const clientNavigation = [
  { name: "Dashboard", href: "/client", icon: LayoutDashboard },
  { name: "Templates", href: "/client/templates", icon: FileText },
  { name: "RSVP", href: "/client/rsvp", icon: Users },
  { name: "Deployment", href: "/client/deployment", icon: Globe },
];

function ClientLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (!user) {
    // Let Tanstack Router or auth context handle redirect natively, or redirect cleanly
    return <Navigate to="/" />;
  }
  if (user.role !== "CLIENT") {
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

  // If we're inside the builder, hide the sidebar so the canvas is full width
  const isBuilder = location.pathname.includes("/client/builder");

  if (isBuilder) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen w-full bg-[#FDFBF7] overflow-hidden text-[#201814]">
      {/* Sidebar - Client Portal */}
      <aside className="w-64 flex flex-col bg-[#FDFBF7] shrink-0 h-full border-r border-[#201814]/10">
        <div className="p-8 pb-6">
          <h1 className="font-display text-2xl font-medium tracking-wide text-[#201814]">
            CandyInvito
          </h1>
          <p className="text-[10px] tracking-widest uppercase text-[#201814]/50 mt-1 font-semibold">
            Client Portal
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {clientNavigation.map((item) => {
            // Precise exact match for dashboard, includes for others
            const isActive =
              item.href === "/client"
                ? location.pathname === "/client" || location.pathname === "/client/"
                : location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#201814] text-white shadow-md"
                    : "text-[#201814]/60 hover:text-[#201814] hover:bg-[#201814]/5"
                }`}
              >
                <item.icon className="h-4 w-4 mr-3" strokeWidth={isActive ? 2 : 1.5} />
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#201814]/10">
          <div className="flex items-center justify-between px-2 pt-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-amber-900/10 text-amber-900 flex items-center justify-center text-xs font-bold mr-3">
                {user.avatarInitials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#201814]">{user.name}</span>
                <span className="text-[9px] text-[#201814]/40 uppercase tracking-widest font-bold">
                  Premium Plan
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-[#201814]/40 hover:text-red-500 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-[#F5F3ED] flex flex-col relative">
        <Outlet />
      </main>
    </div>
  );
}
