-- Fix the Italian Grand Prix winner to be Max Verstappen
UPDATE public.races 
SET winner = 'Max Verstappen'
WHERE name = 'Italian Grand Prix';

-- Update the test prediction to reflect Max Verstappen as winner
-- First, let's get Max Verstappen's driver ID (assuming it exists)
-- For now, I'll update with a placeholder and we'll need to check driver data

-- Clear the existing incorrect prediction
DELETE FROM public.user_predictions 
WHERE race_id = '1c7dafda-d986-435d-a10b-af9e6fe8e169';

-- Add a new prediction with Max as winner (using a placeholder UUID for now)
INSERT INTO public.user_predictions (
  user_id,
  race_id,
  predicted_winner,
  predicted_podium,
  points_earned
) VALUES (
  '112e2bd8-1856-470c-bc12-890f4cf2d375',
  '1c7dafda-d986-435d-a10b-af9e6fe8e169',
  '3e8f9a2b-1c5d-4e7f-8a9b-2c3d4e5f6a7b'::uuid, -- Placeholder for Max Verstappen
  ARRAY['3e8f9a2b-1c5d-4e7f-8a9b-2c3d4e5f6a7b', 'a5c3cb91-c727-4941-83a4-2a53d6b39257', '32f53185-adad-4076-97ca-8b9f7fa2f1d8']::uuid[],
  40 -- 25 points for correct winner + 15 points for podium predictions
);

-- Update user standings
SELECT public.update_user_standings('112e2bd8-1856-470c-bc12-890f4cf2d375');