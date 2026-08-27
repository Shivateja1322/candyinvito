import { InvitationContent, InvitationContentSchema } from "./schema";

export function normalizeInvitationContent(oldContent: any): InvitationContent {
  if (!oldContent) {
    return InvitationContentSchema.parse({});
  }

  const normalized: any = {
    hero: { ...oldContent.hero },
    couple: { ...oldContent.couple },
    events: Array.isArray(oldContent.events) ? [...oldContent.events] : [],
    story: Array.isArray(oldContent.story) ? [...oldContent.story] : [],
    venue: { ...oldContent.venue },
    livestream: { ...oldContent.livestream },
    contact: { ...oldContent.contact },
    rsvp: { ...oldContent.rsvp },
    footer: { ...oldContent.footer },
  };

  // Convert old flat story object if it exists
  if (oldContent.story && !Array.isArray(oldContent.story)) {
    const oldStory = oldContent.story as any;
    if (oldStory.title || oldStory.content || oldStory.text) {
      normalized.story = [
        {
          id: "story-legacy-1",
          year: "",
          title: oldStory.title || "",
          content: oldStory.content || oldStory.text || "",
          image_url: oldStory.image_url || (oldStory.images && oldStory.images[0]) || "",
        },
      ];
    }
  }

  // Handle old events
  if (normalized.events.length > 0) {
    normalized.events = normalized.events.map((e: any, i: number) => ({
      id: e.id || `event-${i}`,
      title: e.title || e.name || "",
      date: e.date || "",
      time: e.time || "",
      venue_name: e.venue_name || e.venue || "",
      description: e.description || "",
      icon: e.icon || "calendar",
    }));
  }

  // Fallbacks for couple
  if (!normalized.couple.partnerA) normalized.couple.partnerA = {};
  if (!normalized.couple.partnerB) normalized.couple.partnerB = {};

  return InvitationContentSchema.parse(normalized);
}
