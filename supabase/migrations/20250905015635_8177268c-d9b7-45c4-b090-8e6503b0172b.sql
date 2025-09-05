-- Drop the existing overly permissive policy
DROP POLICY "Profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- This ensures only logged-in users can see profile data, preventing public scraping
-- while still allowing league members to see each other's display names and team names