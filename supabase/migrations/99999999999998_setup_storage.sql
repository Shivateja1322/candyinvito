-- Set up Storage for Invitations

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('invitations', 'invitations', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the invitations bucket

-- 1. Allow public read access (everyone can see the images)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'invitations' );

-- 2. Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'invitations' );

-- 3. Allow authenticated users to update/delete their files
CREATE POLICY "Authenticated users can update files"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'invitations' );

CREATE POLICY "Authenticated users can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'invitations' );
