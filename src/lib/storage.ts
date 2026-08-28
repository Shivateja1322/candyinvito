import { supabase } from "./supabase";

/**
 * Upload an invitation image or media (audio/video) to Supabase Storage.
 *
 * Bucket: "invitations" (public bucket — see supabase/schema.sql)
 * Path:   {userId}/{invitationId}/{slotId}-{timestamp}.{ext}
 */
export async function uploadInvitationImage(
  userId: string,
  invitationId: string,
  slotId: string,
  file: File,
): Promise<string> {
  return uploadInvitationMedia(userId, invitationId, slotId, file);
}

export async function uploadInvitationMedia(
  userId: string,
  invitationId: string,
  slotId: string,
  file: File,
): Promise<string> {
  // Validate file size (50 MB limit for videos/audio/images)
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("File is too large. Maximum size is 50MB.");
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const filePath = `${userId || "guest"}/${invitationId || "temp"}/${slotId}-${Date.now()}.${fileExt}`;

  const bucket = "invitations";

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || undefined,
      });

    if (error) {
      console.warn(`Storage bucket upload error: ${error.message}. Attempting Base64 fallback.`);
      return await fileToBase64(file);
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicData.publicUrl;
  } catch (err: any) {
    console.warn("Storage upload failed, using Data URL fallback:", err);
    return await fileToBase64(file);
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
