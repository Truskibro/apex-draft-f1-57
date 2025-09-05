-- Create a function to calculate points for predictions
CREATE OR REPLACE FUNCTION public.calculate_prediction_points(
  prediction_id uuid,
  race_id uuid
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_points integer := 0;
  prediction_record record;
  race_record record;
  winner_points integer := 25;
  podium_position_points integer[] := ARRAY[18, 15, 12]; -- 2nd, 3rd, 4th place points
  exact_podium_bonus integer := 10;
BEGIN
  -- Get the prediction details
  SELECT * INTO prediction_record 
  FROM user_predictions 
  WHERE id = prediction_id;
  
  -- Get the race results (when available)
  SELECT * INTO race_record 
  FROM races 
  WHERE id = race_id AND status = 'completed';
  
  -- If race not completed yet, return 0
  IF race_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Award points for correct winner prediction
  IF prediction_record.predicted_winner::text = race_record.winner THEN
    total_points := total_points + winner_points;
  END IF;
  
  -- Award points for podium predictions
  -- For now, we'll award points based on drivers appearing in podium
  -- In a full implementation, you'd compare with actual race results
  IF prediction_record.predicted_podium IS NOT NULL AND array_length(prediction_record.predicted_podium, 1) >= 3 THEN
    -- This is a simplified version - in reality you'd compare with actual race podium results
    -- For now, award base points for having podium predictions
    total_points := total_points + 15;
  END IF;
  
  -- Update the prediction with calculated points
  UPDATE user_predictions 
  SET points_earned = total_points 
  WHERE id = prediction_id;
  
  RETURN total_points;
END;
$$;

-- Create function to update user standings
CREATE OR REPLACE FUNCTION public.update_user_standings(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_season_points integer := 0;
  current_week_points integer := 0;
  user_rank integer := 1;
BEGIN
  -- Calculate total points from all predictions
  SELECT COALESCE(SUM(points_earned), 0) INTO total_season_points
  FROM user_predictions 
  WHERE user_id = user_id_param;
  
  -- Calculate points from this week (last 7 days)
  SELECT COALESCE(SUM(points_earned), 0) INTO current_week_points
  FROM user_predictions 
  WHERE user_id = user_id_param 
    AND created_at >= NOW() - INTERVAL '7 days';
  
  -- Insert or update user standings
  INSERT INTO user_standings (user_id, total_points, weekly_points)
  VALUES (user_id_param, total_season_points, current_week_points)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = EXCLUDED.total_points,
    weekly_points = EXCLUDED.weekly_points,
    updated_at = NOW();
  
  -- Update ranks for all users
  WITH ranked_users AS (
    SELECT user_id, 
           ROW_NUMBER() OVER (ORDER BY total_points DESC, updated_at ASC) as new_rank
    FROM user_standings
  )
  UPDATE user_standings 
  SET previous_rank = rank,
      rank = ranked_users.new_rank
  FROM ranked_users 
  WHERE user_standings.user_id = ranked_users.user_id;
END;
$$;

-- Create trigger to automatically update standings when predictions are updated
CREATE OR REPLACE FUNCTION public.handle_prediction_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update user standings when prediction points change
  PERFORM update_user_standings(NEW.user_id);
  RETURN NEW;
END;
$$;

-- Create trigger on user_predictions table
DROP TRIGGER IF EXISTS on_prediction_points_updated ON user_predictions;
CREATE TRIGGER on_prediction_points_updated
  AFTER INSERT OR UPDATE OF points_earned ON user_predictions
  FOR EACH ROW 
  EXECUTE FUNCTION handle_prediction_update();