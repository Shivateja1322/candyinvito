BEGIN;
ALTER TABLE public.deployment_requests DROP CONSTRAINT IF EXISTS deployment_requests_status_check;
ALTER TABLE public.deployment_requests ADD CONSTRAINT deployment_requests_status_check CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'HOSTED'));
ALTER TABLE public.deployment_requests ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.deployment_requests ADD COLUMN IF NOT EXISTS hosted_at TIMESTAMP WITH TIME ZONE;
COMMIT;
