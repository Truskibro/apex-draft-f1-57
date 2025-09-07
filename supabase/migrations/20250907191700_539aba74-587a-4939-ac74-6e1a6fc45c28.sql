-- Rename team_name column to username in profiles table
ALTER TABLE public.profiles 
RENAME COLUMN team_name TO username;

-- Update the default value for username
ALTER TABLE public.profiles 
ALTER COLUMN username SET DEFAULT 'Racing Driver';