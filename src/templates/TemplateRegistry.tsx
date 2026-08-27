import React from "react";
import { Loader2 } from "lucide-react";

import RoyalHeritage from "./RoyalHeritage";
import EditorialRomance from "./EditorialRomance";
import GardenReverie from "./GardenReverie";
import MediterraneanElan from "./MediterraneanElan";
import ContemporaryNoir from "./ContemporaryNoir";
import { canonicalSections, ThemeSchema, ThemeSection, TemplateControl } from "./CanonicalSections";

const templates: Record<string, React.ComponentType<{ data: any; invitationId?: string }>> = {
  "royal-heritage": RoyalHeritage,
  "editorial-romance": EditorialRomance,
  "garden-reverie": GardenReverie,
  "mediterranean-elan": MediterraneanElan,
  "contemporary-noir": ContemporaryNoir,
};

export type EditorMode = "editor" | "preview" | "published";

export function TemplateRenderer({
  templateId,
  data,
  invitationId,
  mode = "published",
}: {
  templateId: string;
  data: any;
  invitationId?: string;
  mode?: EditorMode;
}) {
  const Template = templates[templateId] || RoyalHeritage;

  return (
    <div className="w-full h-full animate-in fade-in duration-500 relative">
      <Template data={data} invitationId={invitationId} />
    </div>
  );
}

export type { ThemeSchema, ThemeSection, TemplateControl };

export const themeCapabilities: Record<string, ThemeSchema> = {
  "royal-heritage": {
    id: "royal-heritage",
    name: "Royal Heritage",
    description: "Traditional Indian royal wedding",
    styleCategory: "Traditional",
    thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800",
    sections: canonicalSections,
  },
  "editorial-romance": {
    id: "editorial-romance",
    name: "Editorial Romance",
    description: "High-fashion cinematic editorial",
    styleCategory: "Editorial",
    thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
    sections: canonicalSections,
  },
  "garden-reverie": {
    id: "garden-reverie",
    name: "Garden Reverie",
    description: "Botanical European estate wedding",
    styleCategory: "Botanical",
    thumbnail: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800",
    sections: canonicalSections,
  },
  "mediterranean-elan": {
    id: "mediterranean-elan",
    name: "Mediterranean Élan",
    description: "Architectural coastal destination wedding",
    styleCategory: "Destination",
    thumbnail: "https://images.unsplash.com/photo-1532442488836-8c2020e98585?auto=format&fit=crop&q=80&w=800",
    sections: canonicalSections,
  },
  "contemporary-noir": {
    id: "contemporary-noir",
    name: "Contemporary Noir",
    description: "A sophisticated evening wedding invitation",
    styleCategory: "Modern",
    thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800",
    sections: canonicalSections,
  },
};
