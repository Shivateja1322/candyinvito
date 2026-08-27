import { supabase } from "../supabase";
import {
  mockAnalytics,
  mockClients,
  mockDeployments,
  mockInvitations,
  mockRsvps,
  mockSections,
  mockSettings,
  mockTemplates,
  mockThemes,
  mockUsers,
} from "@/lib/mock";
import type {
  AnalyticsSummary,
  Client,
  Deployment,
  Invitation,
  InvitationSection,
  Rsvp,
  Template,
  Theme,
  User,
  DeploymentRequest
} from "@/lib/types";

const LATENCY = 220;

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));
}

const db = {
  users: [...mockUsers],
  clients: [...mockClients],
  invitations: [...mockInvitations],
  sections: [...mockSections],
  templates: [...mockTemplates],
  themes: [...mockThemes],
  rsvps: [...mockRsvps],
  deployments: [...mockDeployments],
  analytics: [...mockAnalytics],
  settings: { ...mockSettings },
};

const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

export const userRepository = {
  get: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
    if (error) {
      console.error("userRepository.get error", error);
      return null;
    }
    return data as User;
  }
};

export const clientRepository = {
  list: () => delay(db.clients),
  get: (clientId: string) => delay(db.clients.find((c) => c.id === clientId) ?? null),
  create: (input: Omit<Client, "id" | "createdAt" | "invitationIds">) => {
    const created: Client = {
      ...input,
      id: id("c"),
    };
    db.clients = [created, ...db.clients];
    return delay(created);
  },
  update: (clientId: string, patch: Partial<Client>) => {
    db.clients = db.clients.map((c) => (c.id === clientId ? { ...c, ...patch } : c));
    return delay(db.clients.find((c) => c.id === clientId)!);
  },
  remove: (clientId: string) => {
    db.clients = db.clients.filter((c) => c.id !== clientId);
    return delay(true);
  },
};

export const invitationRepository = {
  list: async (): Promise<Invitation[]> => {
    const { data, error } = await supabase.from("invitations").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data as Invitation[];
  },
  listByClient: async (clientId: string): Promise<Invitation[]> => {
    const { data, error } = await supabase.from("invitations").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
    if (error) throw error;
    return data as Invitation[];
  },
  get: async (id: string): Promise<Invitation | null> => {
    const { data, error } = await supabase.from("invitations").select("*").eq("id", id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Invitation;
  },
  getBySlug: async (slug: string): Promise<Invitation | null> => {
    const { data, error } = await supabase.from("invitations").select("*").eq("slug", slug).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Invitation;
  },
  create: async (userId: string, title: string, templateId: string): Promise<Invitation> => {
    const slug = crypto.randomUUID().split("-")[0];
    const { data, error } = await supabase
      .from("invitations")
      .insert({
        client_id: userId,
        couple_names: title,
        template_id: templateId,
        slug,
        content: {},
        status: "DRAFT"
      })
      .select()
      .single();
    if (error) throw error;
    return data as Invitation;
  },
  update: async (invitationId: string, patch: Partial<Invitation>): Promise<Invitation> => {
    const { data, error } = await supabase
      .from("invitations")
      .update(patch)
      .eq("id", invitationId)
      .select()
      .single();
    if (error) throw error;
    return data as Invitation;
  },
  remove: async (invitationId: string): Promise<boolean> => {
    const { error } = await supabase.from("invitations").delete().eq("id", invitationId);
    if (error) throw error;
    return true;
  }
};

export const templateRepository = {
  list: () => delay(db.templates),
  get: (templateId: string) => delay(db.templates.find((t) => t.id === templateId) ?? null),
  getBySlug: (slug: string) => delay(db.templates.find((t) => t.slug === slug) ?? null),
  create: (input: Omit<Template, "id">) => {
    const created: Template = { ...input, id: id("t") };
    db.templates = [created, ...db.templates];
    return delay(created);
  },
  update: (templateId: string, patch: Partial<Template>) => {
    db.templates = db.templates.map((t) => (t.id === templateId ? { ...t, ...patch } : t));
    return delay(db.templates.find((t) => t.id === templateId)!);
  },
};

export const themeRepository = {
  list: () => delay(db.themes),
  get: (themeId: string) => delay(db.themes.find((t) => t.id === themeId) ?? null),
  create: (input: Omit<Theme, "id">) => {
    const created: Theme = { ...input, id: id("th") };
    db.themes = [created, ...db.themes];
    return delay(created);
  },
};

export const rsvpRepository = {
  listByInvitation: async (invitationId: string) => {
    const { data, error } = await supabase.from("rsvps").select("*").eq("invitation_id", invitationId).order("created_at", { ascending: false });
    if (error) {
      // Fallback to mock
      return delay(db.rsvps.filter((r) => r.invitationId === invitationId));
    }
    return data;
  },
  list: async () => {
    const { data, error } = await supabase.from("rsvps").select("*, invitation:invitations(title, slug)").order("created_at", { ascending: false });
    if (error) {
      return delay(db.rsvps);
    }
    return data;
  },
  create: async (input: Omit<Rsvp, "id" | "submittedAt">) => {
    const row = {
      invitation_id: input.invitationId,
      guest_name: input.guestName,
      status: input.attending ? "ATTENDING" : "NOT_ATTENDING",
      guests_count: input.guestCount || 1,
      message: input.dietaryRestrictions || "",
      email: "guest@example.com"
    };
    const { data, error } = await supabase.from("rsvps").insert(row).select().single();
    if (error) {
      const created: Rsvp = { ...input, id: id("r"), submittedAt: new Date().toISOString() } as any;
      db.rsvps = [created, ...db.rsvps];
      return delay(created);
    }
    return data;
  },
};

export const deploymentRepository = {
  list: () => delay(db.deployments),
  listByInvitation: (invitationId: string) =>
    delay(db.deployments.filter((d) => d.invitationId === invitationId)),
  request: (invitationId: string, requestedBy: string) => {
    const created: Deployment = {
      id: id("d"),
      invitationId,
      requestedBy,
      requestedAt: new Date().toISOString(),
      state: "PENDING_REVIEW",
      durationDays: null,
      liveFrom: null,
      expiresAt: null,
      reviewNote: null,
    } as any;
    db.deployments = [created, ...db.deployments];
    return delay(created);
  },
  review: (
    deploymentId: string,
    decision: { approved: boolean; durationDays?: number; note?: string },
  ) => {
    db.deployments = db.deployments.map((d) =>
      d.id === deploymentId
        ? {
            ...d,
            state: decision.approved ? "LIVE" : "REJECTED",
            durationDays: decision.durationDays ?? d.durationDays,
            liveFrom: decision.approved ? new Date().toISOString() : null,
            reviewNote: decision.note ?? null,
          } as any
        : d,
    );
    return delay(db.deployments.find((d) => d.id === deploymentId)!);
  },
};

export const deploymentRequestRepository = {
  list: async () => {
    const { data, error } = await supabase.from("deployment_requests").select("*").order("created_at", { ascending: false });
    if (error) {
        console.error("deployment_requests error", error);
        return [];
    }
    return data as DeploymentRequest[];
  },
  request: async (invitationId: string, userId: string) => {
    // Check for existing pending request to prevent duplicates
    const { data: existing, error: fetchErr } = await supabase.from("deployment_requests")
      .select("*")
      .eq("invitation_id", invitationId)
      .eq("status", "PENDING")
      .maybeSingle();
      
    if (existing) {
      throw new Error("A deployment request is already pending for this invitation.");
    }
    
    const { data, error } = await supabase.from("deployment_requests").insert({
      invitation_id: invitationId,
      requested_by: userId,
      status: "PENDING"
    }).select().single();
    if (error) throw error;
    return data as DeploymentRequest;
  },
  updateStatus: async (requestId: string, status: "APPROVED" | "REJECTED" | "HOSTED", reviewedBy: string, rejectionReason?: string, additionalData?: any) => {
    const patch = { status, reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() };
    if (rejectionReason) (patch as any).rejection_reason = rejectionReason;
    const { data, error } = await supabase.from("deployment_requests").update(patch).eq("id", requestId).select().single();
    if (error) throw error;
    return data as DeploymentRequest;
  }
};

export const analyticsRepository = {
  summary: (invitationId: string | "ALL" = "ALL"): Promise<AnalyticsSummary | null> =>
    delay(db.analytics.find((a) => a.invitationId === invitationId) ?? null),
};

export const settingsRepository = {
  get: () => delay(db.settings),
  update: (patch: Partial<typeof mockSettings>) => {
    db.settings = { ...db.settings, ...patch };
    return delay(db.settings);
  },
};

export const authRepository = {
  signIn: (email: string, role: "ADMIN" | "CLIENT"): Promise<User> => {
    const user =
      db.users.find((u) => u.email === email && u.role === role) ??
      ({
        id: id("u"),
        name: role === "ADMIN" ? "Platform Admin" : "CandyInvito Client",
        email,
        role,
        avatarInitials: email.slice(0, 2).toUpperCase(),
      } as any);
    return delay(user, 400);
  },
  signOut: () => delay(true, 120),
};
