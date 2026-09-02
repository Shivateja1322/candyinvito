import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — CandyInvito Studio" },
      { name: "description", content: "Access your CandyInvito luxury stationery dashboard." },
    ],
  }),
  component: UnifiedLogin,
});

function UnifiedLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      const loggedInUser = await signIn(email, password);
      toast.success(`Welcome back, ${loggedInUser.name || "Valued Guest"}!`);

      // Route based on role
      if (loggedInUser.role === "ADMIN") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/client" });
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(error.message || "Failed to sign in. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] flex font-sans select-none">
      {/* Left Editorial Visual Panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#141210] overflow-hidden flex-col justify-between p-12 text-white">
        {/* Ambient Background Image */}
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600"
          alt="Luxury wedding setting"
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/40 to-transparent" />

        {/* Top Branding */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="CandyInvito Logo"
              className="w-12 h-12 rounded-full object-cover border border-[#DCA963]/40 shadow-md group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white block leading-none">
                CandyInvito
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#DCA963] font-bold mt-1 block">
                Haute Wedding Stationery
              </span>
            </div>
          </Link>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-[#DCA963] border border-white/10">
            <Sparkles size={11} /> Bespoke Invitation Studio
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight">
            Every love story deserves an unforgettable entrance.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed font-light">
            Design cinematic digital invitations with background audio, video hero, and seamless guest RSVP tracking.
          </p>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile Brand Header */}
          <div className="text-center lg:text-left space-y-3">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <img
                src="/logo.png"
                alt="CandyInvito Logo"
                className="w-12 h-12 rounded-full object-cover border border-black/10 shadow-xs"
              />
              <div className="text-left">
                <span className="font-serif text-2xl font-bold text-[#201814] block leading-none">
                  CandyInvito
                </span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#DCA963] font-bold block mt-1">
                  Studio Portal
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#201814] tracking-tight">
              Sign In to Your Studio
            </h1>
            <p className="text-xs sm:text-sm text-black/50">
              Enter your credentials to access your wedding invitations and console.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/10 shadow-sm space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-black/60 block mb-1.5">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl border-black/10 focus-visible:ring-[#DCA963] text-sm py-2.5"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-black/60 block mb-1.5">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-xl border-black/10 focus-visible:ring-[#DCA963] text-sm py-2.5 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#141210] hover:bg-[#DCA963] hover:text-[#141210] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-xs flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Continue to Studio</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="text-xs text-black/50 hover:text-[#201814] font-medium transition-colors"
            >
              ← Back to Main Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
