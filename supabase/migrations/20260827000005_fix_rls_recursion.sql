BEGIN;

-- 1. Create SECURITY DEFINER function to prevent RLS recursion on the users table
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

-- 2. Drop existing recursive Admin policies
DROP POLICY IF EXISTS "Admins full access users" ON public.users;
DROP POLICY IF EXISTS "Admins full access invitations" ON public.invitations;
DROP POLICY IF EXISTS "Admins full access deployment_requests" ON public.deployment_requests;
DROP POLICY IF EXISTS "Admins can view all deployment requests" ON public.deployment_requests;
DROP POLICY IF EXISTS "Admins can update deployment requests" ON public.deployment_requests;
DROP POLICY IF EXISTS "Admins full access deployments" ON public.deployments;
DROP POLICY IF EXISTS "Admins full access notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins full access rsvps" ON public.rsvps;

-- 3. Recreate Admin policies using the non-recursive function
CREATE POLICY "Admins full access users" ON public.users FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access invitations" ON public.invitations FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access deployment_requests" ON public.deployment_requests FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access deployments" ON public.deployments FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access notifications" ON public.notifications FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access rsvps" ON public.rsvps FOR ALL USING (public.is_admin());

COMMIT;
