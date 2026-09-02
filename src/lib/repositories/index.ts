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

const getLocalInvites = () => {
  try {
    return JSON.parse(localStorage.getItem('local_invitations') || '{}');
  } catch (e) {
    return {};
  }
};
const setLocalInvites = (invs: any) => {
  try {
    localStorage.setItem('local_invitations', JSON.stringify(invs));
  } catch (e) {}
};

/**
 * Normalizes a raw DB row (snake_case) to the Invitation interface (which
 * historically used camelCase). Preserves the original snake_case fields too,
 * since some code (e.g. the builder ownership check) reads client_id directly.
 */
const normalizeInvitation = (raw: any): Invitation => {
  if (!raw) return raw;
  return {
    ...raw,
    // Map DB columns → type fields
    clientId: raw.client_id ?? raw.clientId ?? "",
    client_id: raw.client_id ?? raw.clientId ?? "",
    title: raw.couple_names ?? raw.title ?? "",
    couple_names: raw.couple_names ?? raw.title ?? "",
    templateId: raw.template_id ?? raw.templateId ?? "",
    template_id: raw.template_id ?? raw.templateId ?? "",
    updated_at: raw.updated_at ?? "",
    created_at: raw.created_at ?? "",
    // Provide defaults for optional fields that may not come from DB
    themeId: raw.template_id ?? raw.templateId ?? raw.themeId ?? "",
    state: raw.state ?? "DRAFT",
    weddingDate: raw.wedding_date ?? raw.weddingDate ?? "",
    venue: raw.venue ?? "",
    city: raw.city ?? "",
    coverImage: raw.cover_image ?? raw.coverImage ?? "",
    updatedAt: raw.updated_at ?? raw.updatedAt ?? "",
    views: raw.views ?? 0,
    rsvpCount: raw.rsvp_count ?? raw.rsvpCount ?? 0,
    musicEnabled: raw.music_enabled ?? raw.musicEnabled ?? false,
    livestreamEnabled: raw.livestream_enabled ?? raw.livestreamEnabled ?? false,
    content: raw.content ?? {},
  } as Invitation;
};

export function generateSlugFromNames(names?: string): string {
  if (!names || !names.trim() || names === "New Couple" || names === "Wedding Invitation") {
    return `wedding-${crypto.randomUUID().split("-")[0]}`;
  }
  const clean = names
    .toLowerCase()
    .replace(/[&❤️+]/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  
  return clean ? `${clean}-${crypto.randomUUID().split("-")[0].substring(0, 4)}` : `wedding-${crypto.randomUUID().split("-")[0]}`;
}

export const invitationRepository = {
  list: async (): Promise<Invitation[]> => {
    try {
      const { data, error } = await supabase.from("invitations").select("*").order("created_at", { ascending: false });
      if (!error && data) return data.map(normalizeInvitation);
    } catch(e) {}
    return Object.values(getLocalInvites()).map(normalizeInvitation);
  },
  listByClient: async (clientId: string): Promise<Invitation[]> => {
    let dbInvites: any[] = [];
    try {
      const { data, error } = await supabase.from("invitations").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
      if (!error && data) dbInvites = data;
    } catch (e) {}
    
    const local = Object.values(getLocalInvites()).filter((i: any) => i.client_id === clientId);
    return [...dbInvites, ...local].map(normalizeInvitation);
  },
  get: async (id: string): Promise<Invitation | null> => {
    try {
      const { data, error } = await supabase.from("invitations").select("*").eq("id", id).single();
      if (!error && data) return normalizeInvitation(data);
    } catch(e) {}
    
    const local = getLocalInvites();
    const match = Object.values(local).find((i: any) => i.id === id);
    return match ? normalizeInvitation(match) : null;
  },
  getBySlug: async (slug: string): Promise<Invitation | null> => {
    try {
      const { data, error } = await supabase.from("invitations").select("*").eq("slug", slug).single();
      if (!error && data) return normalizeInvitation(data);
    } catch(e) {}
    
    const local = getLocalInvites();
    if (local[slug]) return normalizeInvitation(local[slug]);
    return null;
  },
  create: async (userId: string, title: string = "New Couple", templateId: string): Promise<Invitation> => {
    const slug = generateSlugFromNames(title);
    const generatedId = crypto.randomUUID();
    const payload = {
      id: generatedId,
      client_id: userId,
      title: title,
      couple_names: title,
      template_id: templateId,
      slug,
      content: {},
      status: "Draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    try {
      const { data, error } = await supabase.from("invitations").insert({
        id: generatedId,
        client_id: userId,
        title: title,
        couple_names: title,
        template_id: templateId,
        slug,
        content: {},
        status: "Draft",
      }).select().single();
      if (error) {
        console.warn("Supabase insert invitation warning:", error);
      }
      if (!error && data) {
        const normalized = normalizeInvitation(data);
        const local = getLocalInvites();
        local[slug] = normalized;
        setLocalInvites(local);
        return normalized;
      }
    } catch (e) {
      console.warn("Supabase insert invitation exception:", e);
    }
    
    // Fallback to local storage if DB fails
    const local = getLocalInvites();
    local[slug] = payload;
    setLocalInvites(local);
    return normalizeInvitation(payload);
  },
  update: async (invitationId: string, patch: Partial<Invitation>): Promise<Invitation> => {
    const updateData: any = { ...patch };
    if (patch.couple_names && !patch.title) {
      updateData.title = patch.couple_names;
    } else if (patch.title && !patch.couple_names) {
      updateData.couple_names = patch.title;
    }
    updateData.updated_at = new Date().toISOString();

    try {
      const { data, error } = await supabase.from("invitations").update(updateData).eq("id", invitationId).select().single();
      if (!error && data) return normalizeInvitation(data);
    } catch(e) {}
    
    const local = getLocalInvites();
    const slug = Object.keys(local).find(k => local[k].id === invitationId);
    if (slug) {
      local[slug] = { ...local[slug], ...updateData };
      setLocalInvites(local);
      return normalizeInvitation(local[slug]);
    }
    throw new Error("Invitation not found");
  },
  remove: async (invitationId: string): Promise<boolean> => {
    try {
      // 1. Delete dependent deployment requests
      await supabase.from("deployment_requests").delete().eq("invitation_id", invitationId);
      // 2. Delete dependent rsvps
      await supabase.from("rsvps").delete().eq("invitation_id", invitationId);
      // 3. Delete the invitation itself
      const { error } = await supabase.from("invitations").delete().eq("id", invitationId);
      if (error) {
        console.error("Failed to delete invitation from Supabase:", error);
      }
    } catch (e) {
      console.error("Error in invitation remove:", e);
    }

    const local = getLocalInvites();
    const slug = Object.keys(local).find((k) => local[k].id === invitationId);
    if (slug) {
      delete local[slug];
      setLocalInvites(local);
    }
    return true;
  },
};

import { themeCapabilities } from "../../templates/TemplateRegistry";

// Convert canonical themeCapabilities into Template objects
const canonicalTemplates: Template[] = Object.values(themeCapabilities).map(theme => ({
  id: theme.id,
  slug: theme.id,
  name: theme.name,
  tagline: theme.description,
  style: theme.styleCategory,
  sections: theme.sections.map(s => s.id),
  previewImage: theme.thumbnail,
  popularity: 100,
  isPremium: false
}));

export const templateRepository = {
  list: async () => canonicalTemplates,
  get: async (templateId: string) => canonicalTemplates.find((t) => t.id === templateId) ?? null,
  getBySlug: async (slug: string) => canonicalTemplates.find((t) => t.slug === slug) ?? null,
  create: async (input: Omit<Template, "id">) => {
    throw new Error("Cannot create templates at runtime");
  },
  update: async (templateId: string, patch: Partial<Template>) => {
    throw new Error("Cannot update templates at runtime");
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
    let dbRsvps: any[] = [];
    try {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .eq("invitation_id", invitationId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        dbRsvps = data;
      }
    } catch (e) {}

    let localRsvps: any[] = [];
    try {
      const stored = JSON.parse(localStorage.getItem("local_rsvps") || "[]");
      localRsvps = stored.filter(
        (r: any) => r.invitation_id === invitationId || r.invitationId === invitationId,
      );
    } catch (_) {}

    const idSet = new Set(dbRsvps.map((r) => r.id));
    const combined = [...dbRsvps];
    for (const lr of localRsvps) {
      if (!idSet.has(lr.id)) {
        combined.push(lr);
      }
    }
    return combined;
  },
  list: async () => {
    let dbRsvps: any[] = [];
    try {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*, invitation:invitations(title, couple_names, slug)")
        .order("created_at", { ascending: false });
      if (!error && data) {
        dbRsvps = data;
      }
    } catch (e) {}

    let localRsvps: any[] = [];
    try {
      localRsvps = JSON.parse(localStorage.getItem("local_rsvps") || "[]");
    } catch (_) {}

    const idSet = new Set(dbRsvps.map((r) => r.id));
    const combined = [...dbRsvps];
    for (const lr of localRsvps) {
      if (!idSet.has(lr.id)) {
        combined.push(lr);
      }
    }
    return combined;
  },
  create: async (input: any) => {
    const invitationId = input.invitation_id || input.invitationId || "";
    const guestName = input.guest_name || input.guestName || input.name || "Guest";
    const email = input.email || "";
    const isAttending =
      input.attending === "YES" ||
      input.attending === true ||
      input.status === "ATTENDING" ||
      input.status === "YES";
    const status = isAttending ? "ATTENDING" : "NOT_ATTENDING";
    const guestsCount =
      input.guests_count !== undefined
        ? Number(input.guests_count)
        : input.guestCount !== undefined
          ? Number(input.guestCount)
          : input.guests !== undefined
            ? Number(input.guests)
            : isAttending ? 1 : 0;
    const message = input.message || input.dietaryRestrictions || "";

    const row = {
      invitation_id: invitationId,
      guest_name: guestName,
      email: email,
      status: status,
      attending: isAttending ? "YES" : "NO",
      guests_count: guestsCount,
      message: message,
    };

    let insertedData: any = null;

    try {
      const { data, error } = await supabase.from("rsvps").insert(row).select().single();
      if (!error && data) {
        insertedData = data;
      } else if (error) {
        console.warn("Supabase RSVP insert warning:", error);
      }
    } catch (e) {
      console.warn("Supabase RSVP insert exception:", e);
    }

    // Always store a backup copy in local storage cache
    const finalRecord = insertedData || {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...row,
    };

    try {
      const localRsvps = JSON.parse(localStorage.getItem("local_rsvps") || "[]");
      localRsvps.unshift(finalRecord);
      localStorage.setItem("local_rsvps", JSON.stringify(localRsvps));
    } catch (_) {}

    return finalRecord;
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
  list: async (userId?: string) => {
    let query = supabase.from("deployment_requests").select("*").order("created_at", { ascending: false });
    if (userId) {
      query = query.eq("requested_by", userId);
    }
    const { data, error } = await query;
    if (error) {
      console.error("deployment_requests error", error);
      return [];
    }
    return data as DeploymentRequest[];
  },
  create: async (data: Partial<DeploymentRequest>) => {
    const { data: created, error } = await supabase
      .from("deployment_requests")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return created as DeploymentRequest;
  },
  request: async (invitationId: string, userId: string) => {
    const { data: existing } = await supabase
      .from("deployment_requests")
      .select("*")
      .eq("invitation_id", invitationId)
      .eq("status", "PENDING")
      .maybeSingle();

    if (existing) {
      throw new Error("A deployment request is already pending for this invitation.");
    }

    const { data, error } = await supabase
      .from("deployment_requests")
      .insert({
        invitation_id: invitationId,
        requested_by: userId,
        status: "PENDING",
      })
      .select()
      .single();
    if (error) throw error;
    return data as DeploymentRequest;
  },
  updateStatus: async (
    requestId: string,
    status: "APPROVED" | "REJECTED" | "HOSTED",
    reviewedBy: string,
    rejectionReason?: string,
    additionalData?: any,
  ) => {
    const patch: any = {
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      ...(additionalData || {}),
    };
    if (rejectionReason) patch.rejection_reason = rejectionReason;
    const { data, error } = await supabase
      .from("deployment_requests")
      .update(patch)
      .eq("id", requestId)
      .select()
      .single();
    if (error) throw error;
    return data as DeploymentRequest;
  },
  remove: async (requestId: string): Promise<boolean> => {
    try {
      const { data: req } = await supabase
        .from("deployment_requests")
        .select("invitation_id")
        .eq("id", requestId)
        .maybeSingle();

      const { error } = await supabase
        .from("deployment_requests")
        .delete()
        .eq("id", requestId);
      if (error) {
        console.error("Error deleting deployment request:", error);
      }

      if (req?.invitation_id) {
        await supabase
          .from("invitations")
          .update({ status: "Draft" })
          .eq("id", req.invitation_id);
      }
      return true;
    } catch (err) {
      console.error("Failed to remove deployment request:", err);
      throw err;
    }
  },
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

