import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { MediaImage } from "../media/MediaImage";
import { EditableImage } from "../../builder/EditableImage";

export interface GalleryItem {
  id?: string;
  url: string;
  caption?: string;
  path?: string;
}

export type GalleryLayout = "grid" | "masonry" | "carousel";

export interface GalleryProps {
  items: GalleryItem[];
  layout?: GalleryLayout;
  className?: string;
}

export const Gallery: React.FC<GalleryProps> = ({ items, layout = "grid", className = "" }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % items.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
    }
  };

  const fallbackImage = "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2070&auto=format&fit=crop";

  const renderGrid = () => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {items.map((item, idx) => (
        <motion.div
          key={item.id || idx}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="aspect-square cursor-pointer overflow-hidden rounded-lg shadow-sm"
          onClick={() => openLightbox(idx)}
        >
          {item.path ? (
            <EditableImage path={item.path} defaultSrc={item.url || fallbackImage} className="w-full h-full object-contain" />
          ) : (
            <MediaImage
              src={item.url || fallbackImage}
              alt={item.caption || `Gallery image ${idx + 1}`}
              className="w-full h-full object-contain"
            />
          )}
        </motion.div>
      ))}
    </div>
  );

  const renderMasonry = () => (
    <div className={`columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4 ${className}`}>
      {items.map((item, idx) => (
        <motion.div
          key={item.id || idx}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="break-inside-avoid cursor-pointer overflow-hidden rounded-lg shadow-sm"
          onClick={() => openLightbox(idx)}
        >
          {/* Using a pseudo aspect ratio variation based on index to simulate masonry difference if real sizes aren't known */}
          {item.path ? (
            <EditableImage path={item.path} defaultSrc={item.url || fallbackImage} className="w-full object-contain" />
          ) : (
            <MediaImage
              src={item.url || fallbackImage}
              alt={item.caption}
              className="w-full object-cover"
              style={{ minHeight: idx % 2 === 0 ? "300px" : "450px" }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );

  return (
    <>
      {layout === "masonry" ? renderMasonry() : renderGrid()}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white z-50 p-2"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X size={32} />
            </button>

            {items.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 z-50"
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={48} strokeWidth={1} />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 z-50"
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  <ChevronRight size={48} strokeWidth={1} />
                </button>
              </>
            )}

            {items[selectedIndex] && (
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <img
                  src={items[selectedIndex].url}
                  alt={items[selectedIndex].caption || "Gallery image"}
                  className="max-w-full max-h-full object-contain drop-shadow-2xl"
                />
                {items[selectedIndex].caption && (
                  <div className="absolute bottom-0 inset-x-0 p-4 text-center text-white/90 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="font-serif text-lg tracking-wide">
                      {items[selectedIndex].caption}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
