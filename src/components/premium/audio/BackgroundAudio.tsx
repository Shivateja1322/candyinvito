import React, { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";
import { motion } from "framer-motion";

export interface BackgroundAudioProps {
  src?: string;
  autoPlay?: boolean;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  className?: string;
}

export const BackgroundAudio: React.FC<BackgroundAudioProps> = ({
  src,
  autoPlay = false,
  position = "bottom-right",
  className = "",
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Clean background music is rarely intrusive, but browser policies strictly block autoplay with sound
  // unless the user has interacted with the document.

  useEffect(() => {
    if (!audioRef.current || !src) return;

    // If autoPlay was requested, try to play
    if (autoPlay && !hasInteracted) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch((error) => {
            // Autoplay prevented by browser
            console.log("Audio autoplay prevented by browser policy", error);
            setIsPlaying(false);
          });
      }
    }
  }, [src, autoPlay, hasInteracted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    setHasInteracted(true);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error("Error playing audio", e));
    }
  };

  if (!src) return null;

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        onClick={togglePlay}
        className={`fixed z-[100] p-3 rounded-full backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center
          ${
            isPlaying
              ? "bg-white/90 text-gray-900 border border-gray-200"
              : "bg-black/60 text-white border border-white/20 hover:bg-black/80"
          } ${positionClasses[position]} ${className}`}
        aria-label={isPlaying ? "Mute background music" : "Play background music"}
      >
        {isPlaying ? (
          <Volume2 size={20} className="animate-pulse" />
        ) : (
          <div className="relative">
            <VolumeX size={20} />
            {!hasInteracted && autoPlay && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
        )}
      </motion.button>
    </>
  );
};
