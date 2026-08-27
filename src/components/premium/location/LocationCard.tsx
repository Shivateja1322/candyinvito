import React from "react";
import { MapPin, Navigation } from "lucide-react";
import { Reveal } from "../motion/Reveal";

export interface LocationData {
  name?: string;
  address?: string;
  map_query?: string;
  gmap_link?: string;
  image_url?: string;
  // Fallbacks for older templates
  venue_name?: string;
  venue_address?: string;
  map_url?: string;
}

export interface LocationCardProps {
  location: LocationData;
  className?: string;
  theme?: "light" | "dark" | "transparent";
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  className = "",
  theme = "light",
}) => {
  const venueName = location.name || location.venue_name;
  const venueAddress = location.address || location.venue_address;
  const mapQuery = location.map_query || venueAddress || venueName;
  const gmapLink = location.gmap_link || location.map_url;

  if (!venueName && !venueAddress) return null;

  const bgClasses = {
    light: "bg-white shadow-xl text-gray-900 border border-gray-100",
    dark: "bg-gray-900 shadow-2xl text-white border border-gray-800",
    transparent: "bg-white/80 backdrop-blur-md shadow-xl text-gray-900 border border-white/20",
  };

  const getMapDirectionUrl = () => {
    if (gmapLink && gmapLink.startsWith("http")) return gmapLink;
    if (mapQuery) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
    return null;
  };

  const directionUrl = getMapDirectionUrl();

  return (
    <Reveal animation="fade-up" className={className}>
      <div className={`rounded-xl overflow-hidden flex flex-col ${bgClasses[theme]}`}>
        <div className="flex flex-col md:flex-row">
          {/* Map Preview or Venue Image */}
          <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-200 relative overflow-hidden flex-shrink-0">
            {location.image_url ? (
              <img
                src={location.image_url}
                alt={venueName || "Venue"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-200/50 flex items-center justify-center">
                <MapPin size={48} className="text-gray-400 opacity-50" />
              </div>
            )}

            {/* Overlay gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent ${location.image_url ? "opacity-60" : "opacity-20"}`}
            />

            <div className="absolute bottom-6 left-6 right-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 text-white">
              <h3 className="font-serif text-2xl md:text-3xl font-bold drop-shadow-lg leading-tight mb-2">
                {venueName}
              </h3>
            </div>
          </div>

          {/* Venue Details */}
          <div className="p-8 md:p-12 w-full md:w-1/2 flex flex-col justify-center">
            <div className="flex items-start gap-4 mb-8">
              <MapPin
                className={`shrink-0 mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-400"}`}
                size={24}
              />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-2">
                  Address
                </h4>
                <p
                  className={`font-serif text-lg leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                >
                  {venueAddress || "Address not provided"}
                </p>
              </div>
            </div>

            {directionUrl && (
              <a
                href={directionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-bold text-sm tracking-widest uppercase transition-all
                  ${
                    theme === "dark"
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
              >
                <Navigation size={16} />
                Get Directions
              </a>
            )}
          </div>
        </div>

        {/* Embedded Map */}
        {mapQuery && (
          <div className="w-full h-64 border-t border-black/10">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen
            />
          </div>
        )}
      </div>
    </Reveal>
  );
};
