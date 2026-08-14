/**
 * CandyInvito domain model.
 * Shared by the mock datasets, the repository layer and the UI.
 */

export type Role = "ADMIN" | "CLIENT" | "GUEST";

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
}

export interface Client {
  id: string;
  coupleName: string;
  partnerA: string;
  partnerB: string;
  email: string;
  phone: string;
  city: string;
  weddingDate: string; // ISO
  status: "ACTIVE" | "INACTIVE";
  plan: "Essence" | "Atelier" | "Maison";
  createdAt: string;
  invitationIds: string[];
}

export interface Invitation {
  id: string;
  slug: string;
  clientId: string;
  title: string;
  templateId: string;
  themeId: string;
  state: DeploymentState;
  weddingDate: string;
  venue: string;
  city: string;
  coverImage: string;
  updatedAt: string;
  views: number;
  rsvpCount: number;
  musicEnabled: boolean;
  livestreamEnabled: boolean;
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
