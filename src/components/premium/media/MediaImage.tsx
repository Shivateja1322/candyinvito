import React, { useState } from "react";

export interface MediaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  objectFit?: "cover" | "contain" | "fill";
  aspectRatio?: string;
  priority?: boolean;
}

export const MediaImage: React.FC<MediaImageProps> = ({
  src,
  alt = "",
  fallbackSrc = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  className = "",
  objectFit = "cover",
  aspectRatio,
  priority = false,
  style,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const finalSrc = hasError || !src ? fallbackSrc : src;

  return (
    <div
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{ aspectRatio, ...style }}
    >
      {/* Skeleton loader / placeholder */}
      {!isLoaded && !hasError && <div className="absolute inset-0 animate-pulse bg-gray-200" />}

      <img
        src={finalSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full transition-opacity duration-700 ease-in-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ objectFit }}
        {...props}
      />
    </div>
  );
};
