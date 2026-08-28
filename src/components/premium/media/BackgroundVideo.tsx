import React, { useRef, useEffect, useState } from "react";
import { MediaImage } from "./MediaImage";

export interface BackgroundVideoProps {
  src?: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  overlay?: string; // CSS background for overlay, e.g. "bg-black/30"
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  src,
  poster,
  className = "",
  autoPlay = true,
  loop = true,
  muted = true,
  overlay = "bg-black/20",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    if (!videoRef.current || !src) return;

    videoRef.current.load();
    if (autoPlay) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsVideoPlaying(true))
          .catch((error) => {
            console.warn("Video autoplay prevented:", error);
            setIsVideoPlaying(false);
          });
      }
    }
  }, [autoPlay, src]);

  // If no video source or an error occurred, render fallback image/poster
  if (!src || hasError) {
    if (!poster) return null;
    return (
      <div className={`relative w-full h-full ${className}`}>
        <MediaImage src={poster} className="absolute inset-0 w-full h-full" priority />
        <div className={`absolute inset-0 ${overlay}`} />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
      {poster && (
        <MediaImage
          src={poster}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 z-0 ${
            isVideoPlaying ? "opacity-0" : "opacity-100"
          }`}
          priority
        />
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline
        preload="auto"
        onError={() => setHasError(true)}
        onPlaying={() => setIsVideoPlaying(true)}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Overlay to ensure text readability */}
      <div className={`absolute inset-0 z-10 ${overlay}`} />
    </div>
  );
};
