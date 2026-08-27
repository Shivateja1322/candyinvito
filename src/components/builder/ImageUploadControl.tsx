import React, { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadInvitationImage } from "../../lib/storage";

export function ImageUploadControl({
  label,
  value,
  onUpload,
  invitationId,
  slotId,
}: {
  label: string;
  value: string;
  onUpload: (url: string) => void;
  invitationId: string;
  slotId: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadInvitationImage(invitationId, slotId, file);
      onUpload(url);
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

  return (
    <div className="mb-4">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {value && <img src={value} alt="preview" className="w-10 h-10 object-cover rounded shadow-sm" />}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 flex items-center justify-center gap-2 border border-dashed border-black/20 p-2 rounded text-xs font-semibold text-black/60 hover:bg-black/5 disabled:opacity-50"
        >
          {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
          {isUploading ? "Uploading..." : value ? "Replace" : "Upload Image"}
        </button>
        {value && (
          <button
            onClick={() => onUpload("")}
            className="p-2 border border-black/10 rounded text-red-500 hover:bg-red-50 transition-colors"
            title="Remove Image"
          >
            <span className="sr-only">Remove</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </button>
        )}
      </div>
    </div>
  );
}
