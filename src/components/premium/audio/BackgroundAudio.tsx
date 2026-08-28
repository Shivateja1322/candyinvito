import React, { useRef, useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Music, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface BackgroundAudioProps {
  src?: string;
  autoPlay?: boolean;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  className?: string;
}

export const BackgroundAudio: React.FC<BackgroundAudioProps> = ({
  src,
  autoPlay = true,
  position = "bottom-right",
  className = "",
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const startPlayback = useCallback(() => {
    if (!audioRef.current || !src) return;
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsBlocked(false);
      })
      .catch((error) => {
        console.warn("Audio autoplay blocked by browser policy:", error);
        setIsPlaying(false);
        setIsBlocked(true);
      });
  }, [src]);

  useEffect(() => {
    if (!src || !audioRef.current) return;

    if (autoPlay) {
      startPlayback();

      // Listen for first user interaction anywhere on document to start audio if blocked
      const handleFirstInteraction = () => {
        if (audioRef.current && audioRef.current.paused) {
          startPlayback();
        }
      };

      window.addEventListener("click", handleFirstInteraction, { once: true });
      window.addEventListener("touchstart", handleFirstInteraction, { once: true });
      window.addEventListener("scroll", handleFirstInteraction, { once: true });

      return () => {
        window.removeEventListener("click", handleFirstInteraction);
        window.removeEventListener("touchstart", handleFirstInteraction);
        window.removeEventListener("scroll", handleFirstInteraction);
      };
    }
  }, [src, autoPlay, startPlayback]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsBlocked(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsBlocked(false);
        })
        .catch((e) => {
          console.error("Error playing audio:", e);
        });
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
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className={`fixed z-[100] ${positionClasses[position]} ${className}`}>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onClick={togglePlay}
          className={`group px-3 py-2 rounded-full backdrop-blur-md shadow-xl transition-all flex items-center gap-2 border ${
            isPlaying
              ? "bg-[#201814]/90 text-[#DCA963] border-[#DCA963]/30 hover:bg-[#201814]"
              : "bg-white/90 text-[#201814] border-black/10 hover:bg-white"
          }`}
          aria-label={isPlaying ? "Mute music" : "Play music"}
        >
          {isPlaying ? (
            <>
              <div className="flex items-end gap-0.5 h-3.5 px-0.5">
                <span className="w-0.5 bg-[#DCA963] rounded-full animate-[bounce_0.8s_infinite] h-3"></span>
                <span className="w-0.5 bg-[#DCA963] rounded-full animate-[bounce_0.6s_infinite] h-2"></span>
                <span className="w-0.5 bg-[#DCA963] rounded-full animate-[bounce_1s_infinite] h-3.5"></span>
                <span className="w-0.5 bg-[#DCA963] rounded-full animate-[bounce_0.7s_infinite] h-2.5"></span>
              </div>
              <Volume2 size={15} />
            </>
          ) : (
            <>
              <VolumeX size={15} className="text-black/60" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-black/70 group-hover:text-black">
                Play Music
              </span>
            </>
          )}
        </motion.button>
      </div>
    </>
  );
};
