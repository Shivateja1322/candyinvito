import React from "react";
import {
  Sparkles,
  Heart,
  Music,
  Utensils,
  Gem,
  Calendar,
  Star,
  PartyPopper,
  Home,
  Church,
  Clock,
  MapPin,
  Flame,
  Sun,
  Moon,
  GlassWater,
  Smile,
} from "lucide-react";

export const AVAILABLE_EVENT_ICONS = [
  { value: "sparkles", label: "Sparkles", Icon: Sparkles },
  { value: "heart", label: "Heart", Icon: Heart },
  { value: "music", label: "Music / DJ", Icon: Music },
  { value: "utensils", label: "Dining / Feast", Icon: Utensils },
  { value: "rings", label: "Rings / Vows", Icon: Gem },
  { value: "calendar", label: "Calendar", Icon: Calendar },
  { value: "star", label: "Star", Icon: Star },
  { value: "party", label: "Party / Sangeet", Icon: PartyPopper },
  { value: "home", label: "Home / Reception", Icon: Home },
  { value: "church", label: "Church / Mandap", Icon: Church },
  { value: "clock", label: "Clock", Icon: Clock },
  { value: "mappin", label: "Location", Icon: MapPin },
  { value: "flame", label: "Sacred Fire / Pheras", Icon: Flame },
  { value: "sun", label: "Haldi / Morning", Icon: Sun },
  { value: "moon", label: "Cocktails / Night", Icon: Moon },
  { value: "drinks", label: "Drinks", Icon: GlassWater },
];

export function EventIcon({
  name,
  className = "w-5 h-5",
}: {
  name?: string;
  className?: string;
}) {
  const iconKey = (name || "sparkles").toLowerCase().trim();
  const found = AVAILABLE_EVENT_ICONS.find(
    (i) => i.value === iconKey || i.label.toLowerCase().includes(iconKey),
  );

  const IconComponent = found?.Icon || Sparkles;
  return <IconComponent className={className} />;
}
