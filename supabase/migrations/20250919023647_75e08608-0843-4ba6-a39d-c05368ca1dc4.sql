-- First, let's fix the RLS policies to address security concerns
-- Update user_standings RLS policy to restrict access
DROP POLICY IF EXISTS "Standings are viewable by everyone" ON public.user_standings;

-- Create more restrictive policy for user_standings - users can only see standings for leagues they're in
CREATE POLICY "Users can view standings for their leagues" 
ON public.user_standings 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.league_members lm
    WHERE lm.user_id = auth.uid() 
    AND lm.league_id IN (
      SELECT league_id FROM public.league_members 
      WHERE user_id = user_standings.user_id
    )
  )
);

-- Also allow system to insert/update standings
CREATE POLICY "System can manage user standings" 
ON public.user_standings 
FOR ALL 
USING (auth.role() = 'service_role');

-- Clean up unused/redundant columns and add missing constraints
-- Add display_name column if it doesn't exist and set proper defaults
ALTER TABLE public.profiles 
ALTER COLUMN username SET DEFAULT 'Racing Driver',
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_notifications": true, "weekly_digest": true}'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_standings_user_id ON public.user_standings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_user_race ON public.user_predictions(user_id, race_id);
CREATE INDEX IF NOT EXISTS idx_league_members_league_user ON public.league_members(league_id, user_id);

-- Update the profiles table trigger to ensure it always creates a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, notification_preferences)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', 'Racing Driver'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    '{"email_notifications": true, "weekly_digest": true}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;