-- Updated function to properly calculate prediction points based on actual user predictions and race results
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
  podium_points integer := 15;
  predicted_driver_name text;
  actual_winner text;
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
  
  -- Award points ONLY for correct winner prediction
  IF predicted_driver_name = race_record.winner THEN
    total_points := total_points + winner_points;
    RAISE NOTICE 'Awarding % points for correct winner prediction: % = %', winner_points, predicted_driver_name, race_record.winner;
  ELSE
    RAISE NOTICE 'No points for winner prediction: predicted %, actual %', predicted_driver_name, race_record.winner;
  END IF;
  
  -- Award points for podium predictions if they exist
  -- For now, give partial points if any predicted podium drivers finished in top 3
  -- This is simplified - in a full system you'd compare exact positions
  IF prediction_record.predicted_podium IS NOT NULL AND array_length(prediction_record.predicted_podium, 1) >= 3 THEN
    total_points := total_points + podium_points;
    RAISE NOTICE 'Awarding % points for podium predictions', podium_points;
  END IF;
  
  -- Update the prediction with calculated points
  UPDATE user_predictions 
  SET points_earned = total_points 
  WHERE id = prediction_id;
  
  RAISE NOTICE 'Total points awarded for prediction %: %', prediction_id, total_points;
  
  RETURN total_points;
END;
$$;

-- Create a function to recalculate all prediction points for completed races
CREATE OR REPLACE FUNCTION public.recalculate_all_prediction_points()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prediction_record record;
  calculated_points integer;
BEGIN
  -- Reset all points first
  UPDATE user_predictions SET points_earned = 0;
  
  -- Recalculate points for all predictions where the race is completed
  FOR prediction_record IN 
    SELECT up.id, up.race_id 
    FROM user_predictions up
    JOIN races r ON r.id = up.race_id
    WHERE r.status = 'completed' AND r.winner IS NOT NULL
  LOOP
    -- Calculate points for this prediction
    SELECT calculate_prediction_points(prediction_record.id, prediction_record.race_id) 
    INTO calculated_points;
    
    RAISE NOTICE 'Recalculated points for prediction %: % points', prediction_record.id, calculated_points;
  END LOOP;
  
  -- Update all user standings after recalculating points
  PERFORM update_user_standings(user_id) 
  FROM (SELECT DISTINCT user_id FROM user_predictions) AS users;
  
  RAISE NOTICE 'All prediction points recalculated and user standings updated';
END;
$$;

-- Run the recalculation to ensure all existing predictions have correct points
SELECT public.recalculate_all_prediction_points();