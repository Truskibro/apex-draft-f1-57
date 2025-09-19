-- Fix leagues SELECT policy to correctly allow members to view their leagues
DROP POLICY IF EXISTS "Users can view public leagues and their own leagues" ON public.leagues;

CREATE POLICY "Users can view public leagues and their own leagues"
ON public.leagues
FOR SELECT
USING (
  visibility = 'public'
  OR owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.league_members lm
    WHERE lm.league_id = leagues.id AND lm.user_id = auth.uid()
  )
);

-- Create a helper function to safely check if current user is member of a league
CREATE OR REPLACE FUNCTION public.user_is_member_of_league(_league_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.league_members
    WHERE league_id = _league_id AND user_id = auth.uid()
  );
$$;

-- Update league_members SELECT policy to allow members to view other members of their leagues
DROP POLICY IF EXISTS "Users can view league members for accessible leagues" ON public.league_members;

CREATE POLICY "Users can view league members for accessible leagues"
ON public.league_members
FOR SELECT
USING (
  public.user_is_member_of_league(league_id)
  OR public.user_can_view_league(league_id)
);