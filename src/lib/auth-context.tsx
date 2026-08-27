import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import type { User, Role } from "./types";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string, email: string): Promise<User> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("role, name, status")
        .eq("id", userId)
        .single();

      const fetchedRole = data?.role?.toUpperCase().trim();
      const normalizedEmail = email.toLowerCase().trim();

      let role: Role = "CLIENT";
      if (
        fetchedRole === "ADMIN" ||
        normalizedEmail === "admin@candyinvito.com" ||
        normalizedEmail === "shivatejabogadameedi@gmail.com"
      ) {
        role = "ADMIN";
      }

      const name = data?.name || (role === "ADMIN" ? "Platform Admin" : "CandyInvito Client");

      return {
        id: userId,
        email,
        role,
        name,
        avatarInitials: email.slice(0, 2).toUpperCase(),
        status: data?.status || "ACTIVE",
      };
    } catch (err: any) {
      console.error("Error fetching user profile from public.users:", err);

      // If the error is PGRST116 (0 rows returned), the user might not exist in public.users or RLS is blocking them
      if (err.code === "PGRST116" || err.message?.includes("Row Level Security")) {
        toast.error(
          "Security Error: Unable to read your user profile. Please ensure RLS policies are applied.",
          { duration: 5000 },
        );
      }

      // Fallback if table doesn't exist yet or RLS blocks
      const normalizedEmail = email.toLowerCase();
      const role: Role =
        normalizedEmail === "admin@candyinvito.com" ||
        normalizedEmail === "shivatejabogadameedi@gmail.com"
          ? "ADMIN"
          : "CLIENT";
      return {
        id: userId,
        email,
        role,
        name: role === "ADMIN" ? "Platform Admin" : "CandyInvito Client",
        avatarInitials: email.slice(0, 2).toUpperCase(),
      };
    }
  };

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const fullUser = await fetchUserProfile(session.user.id, session.user.email!);
        setUser(fullUser);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const fullUser = await fetchUserProfile(session.user.id, session.user.email!);
        if (fullUser.status === "HOLD" || fullUser.status === "DELETED") {
          await supabase.auth.signOut();
          setUser(null);
          toast.error("Your account has been suspended or deleted. Please contact support.");
        } else {
          setUser(fullUser);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const sessionUser = data.user;
      if (!sessionUser || !sessionUser.email) throw new Error("No user data returned.");

      const fullUser = await fetchUserProfile(sessionUser.id, sessionUser.email);
      if (fullUser.status === "HOLD" || fullUser.status === "DELETED") {
        await supabase.auth.signOut();
        throw new Error("Your account has been suspended or deleted. Please contact support.");
      }

      setUser(fullUser);
      return fullUser;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.success("Successfully logged out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
