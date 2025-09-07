-- Fix the points calculation to ONLY award points for verified correct predictions
CREATE OR REPLACE FUNCTION public.calculate_prediction_points(prediction_id uuid, race_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_points integer := 0;
  prediction_record record;
  race_record record;
  winner_points integer := 25;
  predicted_driver_name text;
BEGIN
  -- Get the prediction details
  SELECT * INTO prediction_record 
  FROM user_predictions 
  WHERE id = prediction_id;
  
  -- Get the race results (only when completed)
  SELECT * INTO race_record 
  FROM races 
  WHERE id = race_id AND status = 'completed' AND winner IS NOT NULL;
  
  -- If race not completed yet or no winner set, return 0
  IF race_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Get the predicted driver's name from the drivers table
  SELECT name INTO predicted_driver_name
  FROM drivers 
  WHERE id = prediction_record.predicted_winner;
  
  -- Award points ONLY for correct winner prediction (verified against actual race winner)
  IF predicted_driver_name = race_record.winner THEN
    total_points := total_points + winner_points;
    RAISE NOTICE 'Awarding % points for correct winner prediction: % = %', winner_points, predicted_driver_name, race_record.winner;
  ELSE
    RAISE NOTICE 'No points for winner prediction: predicted %, actual %', predicted_driver_name, race_record.winner;
  END IF;
  
  -- DO NOT award podium points until we have actual podium results to verify against
  -- This prevents giving random points for unverified predictions
  
  -- Update the prediction with calculated points
  UPDATE user_predictions 
  SET points_earned = total_points 
  WHERE id = prediction_id;
  
  RAISE NOTICE 'Total points awarded for prediction %: %', prediction_id, total_points;
  
  RETURN total_points;
END;
$$;

-- Reset ALL points to zero and recalculate only verified points
UPDATE user_predictions SET points_earned = 0;

-- Recalculate points ONLY for verified correct predictions
SELECT public.recalculate_all_prediction_points();

-- Update user standings with corrected points
UPDATE user_standings 
SET total_points = (
  SELECT COALESCE(SUM(points_earned), 0) 
  FROM user_predictions 
  WHERE user_predictions.user_id = user_standings.user_id
),
weekly_points = (
  SELECT COALESCE(SUM(points_earned), 0) 
  FROM user_predictions 
  WHERE user_predictions.user_id = user_standings.user_id 
  AND created_at >= NOW() - INTERVAL '7 days'
);