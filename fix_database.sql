-- 1. Ensure the user exists in public.users
INSERT INTO public.users (id, email, role, name)
SELECT id, email, 'CLIENT', 'CandyInvito Client'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. Ensure the RLS policy for clients exists
DROP POLICY IF EXISTS "Clients can manage own invitations" ON public.invitations;
CREATE POLICY "Clients can manage own invitations" ON public.invitations FOR ALL USING (client_id = auth.uid());

-- 3. Make sure RLS is enabled
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
