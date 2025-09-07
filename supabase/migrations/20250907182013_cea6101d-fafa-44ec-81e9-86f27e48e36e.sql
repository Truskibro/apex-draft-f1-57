-- Add a test prediction for the Italian Grand Prix to demonstrate the points system
INSERT INTO public.user_predictions (
  user_id,
  race_id,
  predicted_winner,
  predicted_podium,
  points_earned
) VALUES (
  '112e2bd8-1856-470c-bc12-890f4cf2d375',
  '1c7dafda-d986-435d-a10b-af9e6fe8e169',
  'a5c3cb91-c727-4941-83a4-2a53d6b39257', -- Charles Leclerc
  ARRAY['a5c3cb91-c727-4941-83a4-2a53d6b39257', '32f53185-adad-4076-97ca-8b9f7fa2f1d8', '1d6520ef-9ac7-49be-9b59-8f165b66ac93'],
  40 -- 25 points for correct winner + 15 points for podium predictions
);

-- Update user standings with the new points
PERFORM public.update_user_standings('112e2bd8-1856-470c-bc12-890f4cf2d375');