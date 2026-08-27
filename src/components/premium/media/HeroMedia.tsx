import React from "react";
import { MediaImage } from "./MediaImage";
import { BackgroundVideo } from "./BackgroundVideo";

export type HeroMediaType = "image" | "video";

export interface HeroMediaProps {
  type?: HeroMediaType;
  src?: string; // Primary source (image or video URL)
  fallbackSrc?: string; // Fallback image if video fails, or default image
  overlay?: string;
  className?: string;
}

export const HeroMedia: React.FC<HeroMediaProps> = ({
  type = "image",
  src,
  fallbackSrc,
  overlay = "bg-black/30",
  className = "",
}) => {
  if (type === "video") {
    return (
      <div className={`absolute inset-0 w-full h-full ${className}`}>
        <BackgroundVideo src={src || ""} poster={fallbackSrc as string} overlay={overlay} />
      </div>
    );
  }

  // Default to image
  return (
    <div className={`absolute inset-0 w-full h-full ${className}`}>
      <MediaImage
        src={src || fallbackSrc || ""}
        fallbackSrc={fallbackSrc as string}
        className="w-full h-full"
        priority
      />
      <div className={`absolute inset-0 ${overlay}`} />
    </div>
  );
};
