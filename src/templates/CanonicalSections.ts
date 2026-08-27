export type FieldType = "text" | "textarea" | "image" | "date" | "time" | "url" | "font" | "color" | "select" | "alignment" | "toggle";

export type TemplateControl = {
  id: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
};

export type ThemeSection = {
  id: string;
  label: string;
  icon: string;
  isArray?: boolean;
  arrayPath?: string;
  enablePath?: string; // Path to the boolean enabled flag
  controls: TemplateControl[];
};

export type ThemeSchema = {
  id: string;
  name: string;
  description: string;
  styleCategory: string;
  thumbnail?: string;
  sections: ThemeSection[];
};

export const canonicalSections: ThemeSection[] = [
  {
    id: "hero",
    label: "Hero",
    icon: "Home",
    controls: [
      { id: "hero.video_url", label: "Background Video (MP4 URL)", type: "url" },
      { id: "hero.audio_url", label: "Background Audio (MP3 URL)", type: "url" },
    ],
  },
  {
    id: "couple",
    label: "Couple",
    icon: "Users",
    controls: [], // Entirely edited on canvas
  },
  {
    id: "story",
    label: "Story Timeline",
    icon: "BookOpen",
    isArray: true,
    arrayPath: "story",
    defaultItem: { year: "", title: "", content: "" },
    controls: [], // Add/Remove handled in sidebar, edit on canvas
  },
  {
    id: "events",
    label: "Events",
    icon: "CalendarHeart",
    isArray: true,
    arrayPath: "events",
    defaultItem: { title: "", date: "", time: "", venue_name: "", description: "", icon: "sparkles" },
    controls: [
      {
        id: "icon",
        label: "Icon",
        type: "select",
        options: [
          { value: "sparkles", label: "Sparkles" },
          { value: "heart", label: "Heart" },
          { value: "music", label: "Music" },
          { value: "utensils", label: "Dining" },
          { value: "rings", label: "Rings" },
          { value: "calendar", label: "Calendar" },
          { value: "star", label: "Star" },
          { value: "party", label: "Party" },
          { value: "home", label: "Home" },
          { value: "church", label: "Church" },
        ],
      }
    ],
  },
  {
    id: "venue",
    label: "Venue & Map",
    icon: "MapPin",
    enablePath: "venue.enabled",
    controls: [
      { id: "venue.map_query", label: "Map Query (e.g., SVR Gardens Karimnagar)", type: "text" },
      { id: "venue.gmap_link", label: "Google Maps URL", type: "url" },
    ],
  },
  {
    id: "gallery",
    label: "Photo Gallery",
    icon: "Image",
    enablePath: "gallery.enabled",
    isArray: true,
    arrayPath: "gallery.images",
    defaultItem: { image_url: "", alt: "" },
    controls: [],
  },
  {
    id: "livestream",
    label: "Live Stream",
    icon: "Monitor",
    enablePath: "livestream.enabled",
    controls: [
      { id: "livestream.url", label: "Stream URL (YouTube/Zoom)", type: "url" },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    icon: "Info",
    enablePath: "contact.enabled",
    controls: [], // Edit phone/email on canvas
  },
  {
    id: "rsvp",
    label: "RSVP",
    icon: "Mail",
    enablePath: "rsvp.enabled",
    controls: [], // Edit title/deadline on canvas
  },
  {
    id: "footer",
    label: "Footer",
    icon: "LayoutTemplate",
    enablePath: "footer.enabled",
    controls: [], // Edit initials/text on canvas
  },
];
