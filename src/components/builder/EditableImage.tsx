import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { useBuilder } from "./BuilderContext";
import { Image as ImageIcon, Loader2, Move } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number, y: number, posX: number, posY: number } | null>(null);

  const activePath = path || dataKey || "";
  const val = getByPath(data, activePath);
  const src = val || defaultSrc || defaultImage || "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2070&auto=format&fit=crop";

  const posXPath = `${activePath}_posX`;
  const posYPath = `${activePath}_posY`;
  const posX = getByPath(data, posXPath) ?? 50;
  const posY = getByPath(data, posYPath) ?? 50;

  useEffect(() => {
    if (!isBuilderMode) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isBuilderMode]);

  if (!isBuilderMode) {
    return <img src={src} alt={alt} className={className} style={{ objectPosition: `${posX}% ${posY}%` }} />;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !invitationId || !activePath) return;

    try {
      setIsUploading(true);
      const slotId = activePath.replace(/[^a-zA-Z0-9-]/g, '-');
      const url = await uploadInvitationImage(userId || "anonymous", invitationId, slotId, file);
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

  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!isSelected) {
      setIsSelected(true);
      return;
    }
    setIsDragging(true);
    dragStartRef.current = { x: clientX, y: clientY, posX, posY };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current) return;
    
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    
    const rect = containerRef.current.getBoundingClientRect();
    const percentX = -(dx / rect.width) * 100;
    const percentY = -(dy / rect.height) * 100;
    
    let newPosX = dragStartRef.current.posX + percentX;
    let newPosY = dragStartRef.current.posY + percentY;
    
    newPosX = Math.max(0, Math.min(100, newPosX));
    newPosY = Math.max(0, Math.min(100, newPosY));
    
    updateData(posXPath, newPosX);
    updateData(posYPath, newPosY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block h-full w-full ${isSelected ? 'ring-2 ring-[#DCA963] ring-offset-2 z-50' : ''}`}
      onClick={(e) => {
         e.stopPropagation();
         if (!isSelected) setIsSelected(true);
      }}
    >
      <div 
        className="w-full h-full relative cursor-pointer"
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handlePointerUp}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{ objectPosition: `${posX}% ${posY}%` }}
          className={`${className} transition-none ${isSelected && !isUploading ? "brightness-95" : ""} ${isUploading ? "opacity-50 blur-sm" : ""} pointer-events-none`}
        />
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 size={24} className="animate-spin text-white drop-shadow-md" />
        </div>
      )}

      {isSelected && !isUploading && (
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10" onClick={e => e.stopPropagation()}>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/90 backdrop-blur-sm text-black px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-xl hover:bg-white transition-colors"
          >
            <ImageIcon size={12} /> Replace
          </button>
          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-xl select-none cursor-move">
            <Move size={12} /> Drag to pan
          </div>
        </div>
      )}
    </div>
  );
};
