import { supabase } from "./supabase";

/**
 * Upload an invitation image to Supabase Storage.
 *
 * Bucket: "invitations" (public bucket — see supabase/schema.sql)
 * Path:   {userId}/{invitationId}/{slotId}-{timestamp}.{ext}
 *
 * The first path segment MUST be auth.uid() to satisfy the RLS policy
 * "Clients can upload to their invitation".
 */
export async function uploadInvitationImage(
  userId: string,
  invitationId: string,
  slotId: string,
  file: File
): Promise<string> {
  // Validate file type
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
  }

  // Validate file size (5 MB limit)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File is too large. Maximum size is 5MB.");
  }

  const fileExt = file.name.split(".").pop() ?? "jpg";
  // Path format: {userId}/{invitationId}/{slotId}-{timestamp}.{ext}
  // This satisfies the RLS policy which checks path[0] === auth.uid()
  const filePath = `${userId}/${invitationId}/${slotId}-${Date.now()}.${fileExt}`;

  const bucket = "invitations";
  const { error } = await supabase.storage
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
