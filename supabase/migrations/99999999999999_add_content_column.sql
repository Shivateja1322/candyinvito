-- Minimum safe migration to add the missing content column to invitations
-- This is necessary for the CandyInvito Studio editor to persist data.

BEGIN;

DO $$ 
BEGIN
    -- Check if the column exists before adding it to avoid errors if it was already added
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invitations' 
        AND column_name = 'content'
    ) THEN
        ALTER TABLE public.invitations ADD COLUMN content JSONB NOT NULL DEFAULT '{}'::jsonb;
    END IF;

    -- While we are here, ensure RLS is actually enabled on the table 
    -- as it was discovered to be disabled in E2E testing
    ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
END $$;

COMMIT;
