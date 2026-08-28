import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useBuilder } from "./BuilderContext";
import { Image as ImageIcon, Loader2, Move, ZoomIn, Check, Sliders } from "lucide-react";
import { getByPath } from "../../lib/fieldPath";
import { uploadInvitationImage } from "../../lib/storage";
import { toast } from "sonner";

type EditableImageProps = {
  path?: string;
  dataKey?: string;
  defaultSrc?: string;
  defaultImage?: string;
  className?: string;
  alt?: string;
};

export const EditableImage: React.FC<EditableImageProps> = ({
  path,
  dataKey,
  defaultSrc,
  defaultImage,
  className = "",
  alt = "",
}) => {
  const { isBuilderMode, updateData, data, invitationId, userId } = useBuilder();

  const [isSelected, setIsSelected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSliders, setShowSliders] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  const activePath = path || dataKey || "";
  const val = getByPath(data, activePath);
  const src =
    val ||
    defaultSrc ||
    defaultImage ||
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2070&auto=format&fit=crop";

  const posXPath = `${activePath}_posX`;
  const posYPath = `${activePath}_posY`;
  const scalePath = `${activePath}_scale`;

  const posX = typeof getByPath(data, posXPath) === "number" ? getByPath(data, posXPath) : 50;
  const posY = typeof getByPath(data, posYPath) === "number" ? getByPath(data, posYPath) : 50;
  const scale = typeof getByPath(data, scalePath) === "number" ? getByPath(data, scalePath) : 100;

  // Handle click outside to deselect
  useEffect(() => {
    if (!isBuilderMode) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSelected(false);
        setShowSliders(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isBuilderMode]);

  // Window-level dragging handlers so panning doesn't drop when cursor leaves element
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging || !dragStartRef.current || !containerRef.current) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      const rect = containerRef.current.getBoundingClientRect();
      const sensitivity = 100 / Math.max(rect.width, 100);
      const percentX = -(dx * sensitivity);
      const percentY = -(dy * sensitivity);

      let newPosX = dragStartRef.current.posX + percentX;
      let newPosY = dragStartRef.current.posY + percentY;

      newPosX = Math.max(0, Math.min(100, Math.round(newPosX)));
      newPosY = Math.max(0, Math.min(100, Math.round(newPosY)));

      updateData(posXPath, newPosX);
      updateData(posYPath, newPosY);
    },
    [isDragging, posXPath, posYPath, updateData],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  if (!isBuilderMode) {
    return (
      <div className="w-full h-full overflow-hidden relative">
        <img
          src={src}
          alt={alt}
          className={`${className} w-full h-full object-cover`}
          style={{
            objectPosition: `${posX}% ${posY}%`,
            transform: scale !== 100 ? `scale(${scale / 100})` : undefined,
          }}
        />
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePath) return;

    try {
      setIsUploading(true);
      const slotId = activePath.replace(/[^a-zA-Z0-9-]/g, "-");
      const url = await uploadInvitationImage(
        userId || "anonymous",
        invitationId || "temp",
        slotId,
        file,
      );
      updateData(activePath, url);
      updateData(posXPath, 50);
      updateData(posYPath, 50);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePointerDown = (clientX: number, clientY: number, e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (!isSelected) {
      setIsSelected(true);
    }
    setIsDragging(true);
    dragStartRef.current = { x: clientX, y: clientY, posX, posY };
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block h-full w-full overflow-hidden select-none ${
        isSelected ? "ring-2 ring-[#DCA963] ring-offset-2 z-30" : ""
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (!isSelected) setIsSelected(true);
      }}
    >
      <div
        className={`w-full h-full relative ${
          isSelected ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
        }`}
        onPointerDown={(e) => handlePointerDown(e.clientX, e.clientY, e)}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            objectPosition: `${posX}% ${posY}%`,
            transform: scale !== 100 ? `scale(${scale / 100})` : undefined,
          }}
          className={`${className} w-full h-full object-cover transition-none pointer-events-none ${
            isSelected && !isUploading ? "brightness-95" : ""
          } ${isUploading ? "opacity-50 blur-sm" : ""}`}
        />
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/40">
          <Loader2 size={24} className="animate-spin text-[#DCA963] drop-shadow-md" />
        </div>
      )}

      {isSelected && !isUploading && (
        <div
          className="absolute top-2 right-2 flex flex-col gap-1.5 z-40"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-full shadow-2xl border border-white/20">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-black px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-[#DCA963] hover:text-white transition-colors"
              title="Replace image file"
            >
              <ImageIcon size={11} /> Replace
            </button>

            <button
              onClick={() => setShowSliders(!showSliders)}
              className={`p-1.5 rounded-full text-xs transition-colors ${
                showSliders ? "bg-[#DCA963] text-black" : "text-white hover:bg-white/20"
              }`}
              title="Adjust Framing & Zoom"
            >
              <Sliders size={12} />
            </button>

            <div
              className="text-white/80 px-2 py-1 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 cursor-grab"
              title="Click and drag anywhere on the image to pan"
            >
              <Move size={11} /> Pan: {posX}% {posY}%
            </div>
          </div>

          {/* Slider Drawer for Fine Tuning */}
          {showSliders && (
            <div className="bg-black/90 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-white/20 space-y-2.5 w-48 text-[10px]">
              <div>
                <div className="flex justify-between font-bold mb-1 uppercase tracking-wider text-white/70">
                  <span>Zoom / Scale</span>
                  <span>{scale}%</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="250"
                  value={scale}
                  onChange={(e) => updateData(scalePath, parseInt(e.target.value))}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#DCA963]"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1 uppercase tracking-wider text-white/70">
                  <span>Horizontal Pan</span>
                  <span>{posX}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={posX}
                  onChange={(e) => updateData(posXPath, parseInt(e.target.value))}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#DCA963]"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1 uppercase tracking-wider text-white/70">
                  <span>Vertical Pan</span>
                  <span>{posY}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={posY}
                  onChange={(e) => updateData(posYPath, parseInt(e.target.value))}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#DCA963]"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
