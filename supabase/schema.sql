-- CandyInvito Database Schema Definition

-- 1. Users (Auth mapping)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'CLIENT')),
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Invitations
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  couple_names TEXT NOT NULL,
  template_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Ready', 'Published', 'Archived')) DEFAULT 'Draft',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Deployment Requests
CREATE TABLE IF NOT EXISTS public.deployment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'HOSTED')) DEFAULT 'PENDING',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  hosted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure only one PENDING deployment request per invitation
CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_deployment_request 
ON public.deployment_requests (invitation_id) 
WHERE status = 'PENDING';

-- 4. Deployments
CREATE TABLE IF NOT EXISTS public.deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  deployment_request_id UUID REFERENCES public.deployment_requests(id) ON DELETE SET NULL,
  vercel_deployment_id TEXT,
  public_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('INITIALIZING', 'LIVE', 'ERROR', 'EXPIRED')) DEFAULT 'INITIALIZING',
  duration_days INTEGER,
  live_from TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. RSVPs
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ATTENDING', 'NOT_ATTENDING')),
  guests_count INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================================
-- ENABLE ROW LEVEL SECURITY
-- ====================================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- ====================================================================================
-- RLS SECURITY HELPER FUNCTIONS
-- ====================================================================================

-- 1. Create the heavily restricted SECURITY DEFINER helper function for ADMIN checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
    );
$$;

-- 2. Create the heavily restricted SECURITY DEFINER helper function
CREATE OR REPLACE FUNCTION public.is_invitation_published_and_live(inv_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.deployments d
    WHERE d.invitation_id = inv_id
      AND d.status = 'LIVE'
      AND d.live_from <= now()
      AND (d.expires_at IS NULL OR d.expires_at > now())
  );
$$;

-- 2. Restrict execution privileges
REVOKE ALL ON FUNCTION public.is_invitation_published_and_live(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_invitation_published_and_live(UUID) TO anon, authenticated;

-- ====================================================================================
-- RLS POLICIES (Idempotent execution via DO blocks)
-- ====================================================================================

DO $$
BEGIN
    -- Users
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own data' AND tablename = 'users') THEN
        CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);
    END IF;

    -- Admins
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins full access users' AND tablename = 'users') THEN
        CREATE POLICY "Admins full access users" ON public.users FOR ALL USING (public.is_admin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins full access invitations' AND tablename = 'invitations') THEN
        CREATE POLICY "Admins full access invitations" ON public.invitations FOR ALL USING (public.is_admin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins full access deployment_requests' AND tablename = 'deployment_requests') THEN
        CREATE POLICY "Admins full access deployment_requests" ON public.deployment_requests FOR ALL USING (public.is_admin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins full access deployments' AND tablename = 'deployments') THEN
        CREATE POLICY "Admins full access deployments" ON public.deployments FOR ALL USING (public.is_admin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins full access notifications' AND tablename = 'notifications') THEN
        CREATE POLICY "Admins full access notifications" ON public.notifications FOR ALL USING (public.is_admin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins full access rsvps' AND tablename = 'rsvps') THEN
        CREATE POLICY "Admins full access rsvps" ON public.rsvps FOR ALL USING (public.is_admin());
    END IF;

    -- Invitations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients can manage own invitations' AND tablename = 'invitations') THEN
        CREATE POLICY "Clients can manage own invitations" ON public.invitations FOR ALL USING (client_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read active published invitations' AND tablename = 'invitations') THEN
        CREATE POLICY "Public can read active published invitations" ON public.invitations FOR SELECT USING (
          status = 'PUBLISHED' AND public.is_invitation_published_and_live(id)
        );
    ELSE
        DROP POLICY "Public can read active published invitations" ON public.invitations;
        CREATE POLICY "Public can read active published invitations" ON public.invitations FOR SELECT USING (
          status = 'PUBLISHED' AND public.is_invitation_published_and_live(id)
        );
    END IF;

    -- Deployment Requests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients can read own deployment requests' AND tablename = 'deployment_requests') THEN
        CREATE POLICY "Clients can read own deployment requests" ON public.deployment_requests FOR SELECT USING (requested_by = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients can insert own deployment requests' AND tablename = 'deployment_requests') THEN
        CREATE POLICY "Clients can insert own deployment requests" ON public.deployment_requests FOR INSERT WITH CHECK (requested_by = auth.uid() AND status = 'PENDING');
    END IF;

    -- Deployments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients can read own deployments' AND tablename = 'deployments') THEN
        CREATE POLICY "Clients can read own deployments" ON public.deployments FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.invitations i 
            WHERE i.id = public.deployments.invitation_id 
            AND i.client_id = auth.uid()
          )
        );
    END IF;

    -- Notifications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients can read own notifications' AND tablename = 'notifications') THEN
        CREATE POLICY "Clients can read own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients can update own notifications' AND tablename = 'notifications') THEN
        CREATE POLICY "Clients can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
    END IF;

    -- RSVPs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients can read own RSVPs' AND tablename = 'rsvps') THEN
        CREATE POLICY "Clients can read own RSVPs" ON public.rsvps FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.invitations i 
            WHERE i.id = public.rsvps.invitation_id 
            AND i.client_id = auth.uid()
          )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can insert RSVP for active published invitations' AND tablename = 'rsvps') THEN
        CREATE POLICY "Public can insert RSVP for active published invitations" ON public.rsvps FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.invitations i
            WHERE i.id = public.rsvps.invitation_id
              AND i.status = 'PUBLISHED'
              AND public.is_invitation_published_and_live(i.id)
          )
        );
    ELSE
        DROP POLICY "Public can insert RSVP for active published invitations" ON public.rsvps;
        CREATE POLICY "Public can insert RSVP for active published invitations" ON public.rsvps FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.invitations i
            WHERE i.id = public.rsvps.invitation_id
              AND i.status = 'PUBLISHED'
              AND public.is_invitation_published_and_live(i.id)
          )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients can insert own RSVPs' AND tablename = 'rsvps') THEN
        CREATE POLICY "Clients can insert own RSVPs" ON public.rsvps FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.invitations i
            WHERE i.id = public.rsvps.invitation_id
              AND i.client_id = auth.uid()
          )
        );
    ELSE
        DROP POLICY "Clients can insert own RSVPs" ON public.rsvps;
        CREATE POLICY "Clients can insert own RSVPs" ON public.rsvps FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.invitations i
            WHERE i.id = public.rsvps.invitation_id
              AND i.client_id = auth.uid()
          )
        );
    END IF;

END
$$;

-- ====================================================================================
-- STORAGE BUCKET: MEDIA
-- ====================================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT DO NOTHING;

-- Storage policies must be checked similarly, but pg_policies does not track storage.objects in some schemas easily 
-- We'll use a direct DO block to check for their existence in pg_policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients can manage their own media' AND tablename = 'objects') THEN
        CREATE POLICY "Clients can manage their own media" ON storage.objects FOR ALL USING (
          bucket_id = 'media' AND
          (string_to_array(name, '/'))[1] = auth.uid()::text AND
          EXISTS (
            SELECT 1 FROM public.invitations i
            WHERE i.id::text = (string_to_array(name, '/'))[2]
              AND i.client_id = auth.uid()
          )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read published active media' AND tablename = 'objects') THEN
        CREATE POLICY "Public can read published active media" ON storage.objects FOR SELECT USING (
          bucket_id = 'media' AND
          EXISTS (
            SELECT 1 FROM public.invitations i
            WHERE i.id::text = (string_to_array(name, '/'))[2]
              AND i.status = 'PUBLISHED'
              AND EXISTS (
                SELECT 1 FROM public.deployments d
                WHERE d.invitation_id = i.id
                  AND d.status = 'LIVE'
                  AND d.live_from <= now()
                  AND (d.expires_at IS NULL OR d.expires_at > now())
              )
          )
        );
    END IF;
END
$$;
