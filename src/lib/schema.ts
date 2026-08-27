import { z } from "zod";

export const HeroSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  image_url: z.string().optional(),
  video_url: z.string().optional(),
  audio_url: z.string().optional(),
  auspicious_time: z.string().optional(),
});

export const PartnerSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  parents: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().optional(),
});

export const CoupleSchema = z.object({
  partnerA: PartnerSchema.optional(),
  partnerB: PartnerSchema.optional(),
});

export const EventSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  venue_name: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  image_url: z.string().optional(),
});

export const StorySchema = z.object({
  id: z.string(),
  year: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  image_url: z.string().optional(),
});

export const VenueSchema = z.object({
  enabled: z.boolean().default(true),
  name: z.string().optional(),
  address: z.string().optional(),
  map_query: z.string().optional(),
  gmap_link: z.string().optional(),
  image_url: z.string().optional(),
});

export const LivestreamSchema = z.object({
  enabled: z.boolean().default(false),
  title: z.string().optional(),
  message: z.string().optional(),
  url: z.string().optional(),
});

export const ContactSchema = z.object({
  enabled: z.boolean().default(true),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export const RsvpSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().optional(),
  deadline: z.string().optional(),
});

export const FooterSchema = z.object({
  enabled: z.boolean().default(true),
  initials: z.string().optional(),
  text: z.string().optional(),
});

export const GalleryImageSchema = z.object({
  id: z.string(),
  image_url: z.string().optional(),
  alt: z.string().optional(),
});

export const GallerySchema = z.object({
  enabled: z.boolean().default(false),
  title: z.string().optional(),
  images: z.array(GalleryImageSchema).default([]),
});

export const InvitationContentSchema = z.object({
  hero: HeroSchema.optional().default({}),
  couple: CoupleSchema.optional().default({}),
  events: z.array(EventSchema).optional().default([]),
  story: z.array(StorySchema).optional().default([]),
  venue: VenueSchema.optional().default({ enabled: true }),
  livestream: LivestreamSchema.optional().default({ enabled: false }),
  contact: ContactSchema.optional().default({ enabled: true }),
  rsvp: RsvpSchema.optional().default({ enabled: true }),
  footer: FooterSchema.optional().default({ enabled: true }),
  gallery: GallerySchema.optional().default({ enabled: false, images: [] }),
});

export type InvitationContent = z.infer<typeof InvitationContentSchema>;
