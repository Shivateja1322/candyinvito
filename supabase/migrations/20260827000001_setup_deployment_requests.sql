-- Migration for deployment_requests

CREATE TYPE deployment_request_state AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE IF NOT EXISTS public.deployment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    status deployment_request_state NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.deployment_requests ENABLE ROW LEVEL SECURITY;

-- Allow clients to insert their own requests
CREATE POLICY "Clients can create deployment requests"
ON public.deployment_requests FOR INSERT
TO authenticated
WITH CHECK ( requested_by = auth.uid() );

-- Allow clients to view their own requests
CREATE POLICY "Clients can view their deployment requests"
ON public.deployment_requests FOR SELECT
TO authenticated
USING ( requested_by = auth.uid() );

-- Allow admins to view and update all requests
CREATE POLICY "Admins can view all deployment requests"
ON public.deployment_requests FOR SELECT
TO authenticated
USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN' );

CREATE POLICY "Admins can update deployment requests"
ON public.deployment_requests FOR UPDATE
TO authenticated
USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN' );
