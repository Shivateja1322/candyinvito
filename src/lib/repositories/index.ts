/**
 * Repository layer.
 *
 * UI → repositories → mock implementation (today) → Supabase (later).
 * Every method is async and latency-simulated so real loading/empty/error
 * states are exercised during frontend development.
 */
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
} from "@/lib/types";

const LATENCY = 220;

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));
}

/** In-memory session state. Mutations do not survive a reload — by design. */
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

export const clientRepository = {
  list: () => delay(db.clients),
  get: (clientId: string) => delay(db.clients.find((c) => c.id === clientId) ?? null),
  create: (input: Omit<Client, "id" | "createdAt" | "invitationIds">) => {
    const created: Client = {
      ...input,
      id: id("c"),
      createdAt: new Date().toISOString().slice(0, 10),
      invitationIds: [],
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
  list: () => delay(db.invitations),
  listByClient: (clientId: string) =>
    delay(db.invitations.filter((i) => i.clientId === clientId)),
  get: (invitationId: string) =>
    delay(db.invitations.find((i) => i.id === invitationId) ?? null),
  getBySlug: (slug: string) => delay(db.invitations.find((i) => i.slug === slug) ?? null),
  sections: (invitationId: string) =>
    delay(
      db.sections
        .filter((s) => s.invitationId === invitationId)
        .sort((a, b) => a.order - b.order),
    ),
  updateSections: (invitationId: string, sections: InvitationSection[]) => {
    db.sections = [...db.sections.filter((s) => s.invitationId !== invitationId), ...sections];
    return delay(sections);
  },
  create: (input: Omit<Invitation, "id" | "views" | "rsvpCount" | "updatedAt">) => {
    const created: Invitation = {
      ...input,
      id: id("i"),
      views: 0,
      rsvpCount: 0,
      updatedAt: new Date().toISOString(),
    };
    db.invitations = [created, ...db.invitations];
    return delay(created);
  },
  update: (invitationId: string, patch: Partial<Invitation>) => {
    db.invitations = db.invitations.map((i) =>
      i.id === invitationId ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i,
    );
    return delay(db.invitations.find((i) => i.id === invitationId)!);
  },
  remove: (invitationId: string) => {
    db.invitations = db.invitations.filter((i) => i.id !== invitationId);
    return delay(true);
  },
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
  listByInvitation: (invitationId: string) =>
    delay(db.rsvps.filter((r) => r.invitationId === invitationId)),
  list: () => delay(db.rsvps),
  create: (input: Omit<Rsvp, "id" | "submittedAt">) => {
    const created: Rsvp = { ...input, id: id("r"), submittedAt: new Date().toISOString() };
    db.rsvps = [created, ...db.rsvps];
    return delay(created);
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
    };
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
          }
        : d,
    );
    return delay(db.deployments.find((d) => d.id === deploymentId)!);
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
  /** Mock sign-in. Replaced by Supabase Auth in the backend phase. */
  signIn: (email: string, role: "ADMIN" | "CLIENT"): Promise<User> => {
    const user =
      db.users.find((u) => u.email === email && u.role === role) ??
      ({
        id: id("u"),
        name: role === "ADMIN" ? "Platform Admin" : "CandyInvito Client",
        email,
        role,
        avatarInitials: email.slice(0, 2).toUpperCase(),
      } satisfies User);
    return delay(user, 400);
  },
  signOut: () => delay(true, 120),
};
