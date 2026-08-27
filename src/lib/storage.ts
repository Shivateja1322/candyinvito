import { supabase } from "./supabase";

export async function uploadInvitationImage(
  invitationId: string,
  slotId: string,
  file: File
): Promise<string> {
  // Validate file type
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
  }
  
  // Validate file size (e.g., 5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File is too large. Maximum size is 5MB.");
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${invitationId}/images/${slotId}-${Date.now()}.${fileExt}`;

  const bucket = "invitations";
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true });

  if (error) {
    throw new Error(`Upload failed for bucket '${bucket}', path '${filePath}': ${error.message}`);
  }

  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicData.publicUrl;
}
