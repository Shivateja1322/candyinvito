/**
 * CandyInvito domain model.
 * Shared by the mock datasets, repository layer and UI.
 *
 * Production/Supabase types are included alongside the existing
 * application-facing domain types so the migration can happen
 * without breaking the current UI.
 */

export type Role = "ADMIN" | "CLIENT" | "GUEST";

export type UserRole = "ADMIN" | "CLIENT";

export type DeploymentState =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "LIVE"
  | "EXPIRING"
  | "EXPIRED"
  | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarInitials: string;
  status?: string;
}

export interface Client {
  id: string;
  coupleName: string;
  partnerA: string;
  partnerB: string;
  email: string;
  phone: string;
  city: string;
  weddingDate: string;
  status: "ACTIVE" | "INACTIVE";
  plan: "Essence" | "Atelier" | "Maison";
  createdAt: string;
  invitationIds: string[];
}

export interface Invitation {
  id: string;
  slug: string;
  clientId: string;
  client_id: string; // DB snake_case alias
  title: string;
  couple_names: string; // DB column name
  templateId: string;
  template_id: string; // DB snake_case alias
  themeId: string;
  state: DeploymentState;
  status: string;
  weddingDate: string;
  venue: string;
  city: string;
  coverImage: string;
  updatedAt: string;
  updated_at: string;
  created_at: string;
  views: number;
  rsvpCount: number;
  musicEnabled: boolean;
  livestreamEnabled: boolean;
  content: Record<string, unknown>;
}

export type SectionKind =
  | "hero"
  | "couple"
  | "story"
  | "events"
  | "venue"
  | "gallery"
  | "rsvp"
  | "livestream"
  | "footer";

export interface InvitationSection {
  id: string;
  invitationId: string;
  kind: SectionKind;
  label: string;
  order: number;
  visible: boolean;
}

export interface Template {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  style: "Classic" | "Editorial" | "Botanical" | "Minimal" | "Royal";
  sections: SectionKind[];
  previewImage: string;
  popularity: number;
  isPremium: boolean;
}

export interface Theme {
  id: string;
  name: string;
  palette: { name: string; value: string }[];
  displayFont: string;
  bodyFont: string;
  mood: string;
}

export interface Rsvp {
  id: string;
  invitationId: string;
  guestName: string;
  attending: "YES" | "NO" | "MAYBE";
  guests: number;
  events: string[];
  message: string;
  email?: string;
  phone?: string;
  submittedAt: string;
}

export interface Deployment {
  id: string;
  invitationId: string;
  requestedBy: string;
  requestedAt: string;
  state: DeploymentState;
  durationDays: number | null;
  liveFrom: string | null;
  expiresAt: string | null;
  reviewNote: string | null;
}

export interface AnalyticsPoint {
  date: string;
  views: number;
  visitors: number;
  rsvps: number;
}

export interface AnalyticsSummary {
  invitationId: string | "ALL";
  totalViews: number;
  uniqueVisitors: number;
  rsvpSubmissions: number;
  attendingGuests: number;
  avgTimeOnPage: string;
  devices: { name: string; value: number }[];
  regions: { name: string; value: number }[];
  timeline: AnalyticsPoint[];
}

/**
 * Production/Supabase deployment request.
 *
 * These fields mirror the deployment_requests table and are intentionally
 * kept separate from the existing UI-facing Deployment model above.
 */
export interface DeploymentRequest {
  id: string;
  invitation_id: string;
  requested_by: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "HOSTED";
  rejection_reason?: string;
  expires_at?: string;
  hosted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

/**
 * Production/Supabase hosted deployment record.
 *
 * This is kept under a distinct name because the existing Deployment
 * interface is already consumed by the current client UI.
 */
export interface HostedDeployment {
  id: string;
  invitation_id: string;
  deployment_request_id?: string;
  vercel_deployment_id?: string;
  public_url?: string;
  status: "INITIALIZING" | "LIVE" | "ERROR" | "EXPIRED";
  duration_days?: number;
  live_from?: string;
  expires_at?: string;
  created_at: string;
}

/**
 * Database-shaped invitation returned by Supabase.
 *
 * This is separate from the existing UI-facing Invitation model because
 * the repository currently bridges database snake_case fields into the
 * application model.
 */
export interface SupabaseInvitation {
  id: string;
  slug: string;
  client_id: string;
  couple_names: string;
  template_id: string;
  status: string;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}