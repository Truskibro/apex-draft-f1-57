-- Fix the profiles table team_name constraint and create signup trigger
-- First, make team_name nullable temporarily to fix existing data
ALTER TABLE public.profiles ALTER COLUMN team_name DROP NOT NULL;

-- Add a default value for team_name
ALTER TABLE public.profiles ALTER COLUMN team_name SET DEFAULT 'Team F1';

-- Create or replace function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, team_name, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'team_name', 'Team F1'),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ language plpgsql security definer set search_path = public;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();