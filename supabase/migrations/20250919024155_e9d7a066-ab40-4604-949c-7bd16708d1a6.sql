-- Add missing column to prevent errors from queries expecting team_name
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS team_name text;

-- Ensure RLS still intact (no change needed since INSERT/UPDATE policies rely on id)

-- Optional: set default team_name to NULL; no action needed

-- Verify notification_preferences exists (idempotent)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_notifications": true, "weekly_digest": true}'::jsonb;
