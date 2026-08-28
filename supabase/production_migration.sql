-- ============================================================
-- CandyInvito Production Database Migration
-- Run in Supabase SQL Editor (Project: ushrpnifluurtqkpcysx)
-- ============================================================

-- ============================================================
-- PART 1: Schema Corrections
-- ============================================================

-- 1a. Add status column to public.users (required by auth-context.tsx)
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE' 
  CHECK (status IN ('ACTIVE', 'HOLD', 'DELETED'));

-- 1b. Fix is_invitation_published_and_live to check deployment_requests (status = 'HOSTED')
CREATE OR REPLACE FUNCTION public.is_invitation_published_and_live(inv_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.deployment_requests dr
    WHERE dr.invitation_id = inv_id
      AND dr.status = 'HOSTED'
      AND (dr.expires_at IS NULL OR dr.expires_at > now())
  ) OR EXISTS (
    SELECT 1 FROM public.deployments d
    WHERE d.invitation_id = inv_id
      AND d.status = 'LIVE'
      AND (d.expires_at IS NULL OR d.expires_at > now())
  ) OR EXISTS (
    SELECT 1 FROM public.invitations i
    WHERE i.id = inv_id
      AND (i.status = 'Published' OR i.status = 'PUBLISHED')
  );
$$;

REVOKE ALL ON FUNCTION public.is_invitation_published_and_live(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_invitation_published_and_live(UUID) TO anon, authenticated;

-- 1c. Fix the invitations public RLS policy so public guests can read published/hosted invitations
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can read active published invitations" ON public.invitations;
  CREATE POLICY "Public can read active published invitations" ON public.invitations FOR SELECT USING (
    (status = 'Published' OR status = 'PUBLISHED') OR public.is_invitation_published_and_live(id)
  );
END $$;

-- ============================================================
-- PART 2: Admin Helper SQL Functions
-- ============================================================

-- 2a. get_all_users() — used by Admin User Management page
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE(
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    u.id, 
    u.email, 
    u.name, 
    u.role,
    COALESCE(u.status, 'ACTIVE') AS status,
    u.created_at
  FROM public.users u
  WHERE public.is_admin()
  ORDER BY u.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_all_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;

-- 2b. delete_user() — used by Admin User Management page to hard-delete a user
CREATE OR REPLACE FUNCTION public.delete_user(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only admins can delete users
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: caller is not an admin';
  END IF;
  -- Prevent admin self-deletion
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;
  -- Delete dependent child rows first before deleting auth.users
  DELETE FROM public.deployment_requests WHERE requested_by = target_user_id;
  DELETE FROM public.invitations WHERE client_id = target_user_id;
  DELETE FROM public.users WHERE id = target_user_id;
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user(UUID) TO authenticated;

-- 2c. admin_set_user_password() — used by Admin to directly set a password for any user
CREATE OR REPLACE FUNCTION public.admin_set_user_password(target_user_id UUID, new_password TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: caller is not an admin';
  END IF;
  
  UPDATE auth.users
  SET encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')),
      updated_at = NOW()
  WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_password(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_user_password(UUID, TEXT) TO authenticated;

-- ============================================================
-- PART 3: Auto-create public.users row when auth user signs up
-- ============================================================

-- This trigger runs after every INSERT into auth.users and creates a
-- matching row in public.users with role=CLIENT by default.
-- ADMIN role must be set manually via Admin User Management page.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, name, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENT'),
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'ACTIVE'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Remove old trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create fresh trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PART 4: Backfill existing auth users who have no public.users row
-- ============================================================
-- This handles users who signed up BEFORE the trigger was created.
-- Run once — safe to re-run due to ON CONFLICT DO NOTHING.

INSERT INTO public.users (id, email, role, name, status)
SELECT 
  au.id,
  au.email,
  'CLIENT' AS role,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) AS name,
  'ACTIVE' AS status
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PART 5: Storage Bucket Setup
-- ============================================================

-- Create the 'invitations' bucket (public) for image uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invitations', 'invitations', true) 
ON CONFLICT DO NOTHING;

-- Storage RLS policies for 'invitations' bucket
DO $$
BEGIN
  -- Clients can upload images to their own folder: {userId}/{invitationId}/...
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Clients can upload invitation media' 
      AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Clients can upload invitation media" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'invitations' 
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
      );
  END IF;

  -- Clients can update/replace their images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Clients can update invitation media' 
      AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Clients can update invitation media" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'invitations' 
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
      );
  END IF;

  -- Clients can delete their own images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Clients can delete invitation media' 
      AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Clients can delete invitation media" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'invitations' 
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
      );
  END IF;

  -- Public can read from the invitations bucket (images are publicly viewable)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Public can read invitation media' 
      AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public can read invitation media" ON storage.objects
      FOR SELECT USING (bucket_id = 'invitations');
  END IF;
END $$;

-- ============================================================
-- PART 6: Elevate admin user
-- Run this ONCE for the admin account (replace with actual auth.uid)
-- ============================================================

-- To set a user as ADMIN, run:
-- UPDATE public.users SET role = 'ADMIN' WHERE email = 'your-admin@email.com';

-- For the known admin emails in auth-context.tsx:
UPDATE public.users 
SET role = 'ADMIN' 
WHERE email IN ('admin@candyinvito.com', 'shivatejabogadameedi@gmail.com')
  AND role = 'CLIENT';

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- After running, verify with:

-- SELECT id, email, role, status FROM public.users ORDER BY created_at DESC LIMIT 10;
-- SELECT COUNT(*) FROM auth.users au LEFT JOIN public.users pu ON pu.id = au.id WHERE pu.id IS NULL;
-- SELECT * FROM storage.buckets WHERE id = 'invitations';
-- SELECT proname FROM pg_proc WHERE proname IN ('get_all_users', 'delete_user', 'handle_new_user', 'is_admin');
