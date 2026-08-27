import React from 'react';
import { Sparkles, Heart, Music, Utensils, CalendarHeart, Star, PartyPopper, Home } from 'lucide-react';

export const IconRenderer = ({ icon, className = "", size = 24 }: { icon?: string, className?: string, size?: number }) => {
  const IconProps = { className, size, strokeWidth: 1.5 };
  
  switch(icon?.toLowerCase()) {
    case 'sparkles': return <Sparkles {...IconProps} />;
    case 'heart': return <Heart {...IconProps} />;
    case 'music': return <Music {...IconProps} />;
    case 'utensils': return <Utensils {...IconProps} />;
    case 'rings': return <Heart {...IconProps} />; // fallback
    case 'calendar': return <CalendarHeart {...IconProps} />;
    case 'star': return <Star {...IconProps} />;
    case 'party': return <PartyPopper {...IconProps} />;
    case 'home': return <Home {...IconProps} />;
    default: return <Sparkles {...IconProps} />;
  }
}
