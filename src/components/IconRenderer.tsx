import React from "react";
import {
  Sparkles,
  Heart,
  Music,
  Utensils,
  Gem,
  CalendarHeart,
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
} from "lucide-react";

export const IconRenderer = ({
  icon,
  className = "",
  size = 24,
}: {
  icon?: string;
  className?: string;
  size?: number;
}) => {
  const IconProps = { className, size, strokeWidth: 1.5 };
  const key = (icon || "sparkles").toLowerCase().trim();

  switch (key) {
    case "sparkles":
      return <Sparkles {...IconProps} />;
    case "heart":
      return <Heart {...IconProps} />;
    case "music":
      return <Music {...IconProps} />;
    case "utensils":
    case "dining":
      return <Utensils {...IconProps} />;
    case "rings":
    case "gem":
      return <Gem {...IconProps} />;
    case "calendar":
      return <CalendarHeart {...IconProps} />;
    case "star":
      return <Star {...IconProps} />;
    case "party":
    case "sangeet":
      return <PartyPopper {...IconProps} />;
    case "home":
    case "reception":
      return <Home {...IconProps} />;
    case "church":
    case "mandap":
      return <Church {...IconProps} />;
    case "clock":
    case "time":
      return <Clock {...IconProps} />;
    case "mappin":
    case "venue":
      return <MapPin {...IconProps} />;
    case "flame":
    case "pheras":
      return <Flame {...IconProps} />;
    case "sun":
    case "haldi":
      return <Sun {...IconProps} />;
    case "moon":
    case "night":
      return <Moon {...IconProps} />;
    case "drinks":
    case "cocktails":
      return <GlassWater {...IconProps} />;
    default:
      return <Sparkles {...IconProps} />;
  }
};
