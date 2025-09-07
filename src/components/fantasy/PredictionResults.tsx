import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDrivers } from '@/hooks/useDrivers';
import { CheckCircle, XCircle, Target } from 'lucide-react';

type PredictionResult = {
  id: string;
  predicted_winner: string;
  predicted_podium: string[];
  points_earned: number;
  races: {
    name: string;
    winner: string;
  };
};

interface PredictionResultsProps {
  raceId: string;
}

export const PredictionResults = ({ raceId }: PredictionResultsProps) => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { drivers } = useDrivers();

  useEffect(() => {
    if (user && raceId) {
      fetchPredictionResults();
    }
  }, [user, raceId]);

  const fetchPredictionResults = async () => {
    try {
      const { data, error } = await supabase
        .from('user_predictions')
        .select(`
          id,
          predicted_winner,
          predicted_podium,
          points_earned,
          races (
            name,
            winner
          )
        `)
        .eq('user_id', user?.id)
        .eq('race_id', raceId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching prediction results:', error);
        return;
      }

      setPrediction(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDriverName = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver?.name || 'Unknown Driver';
  };

  const isWinnerCorrect = prediction?.races?.winner === getDriverName(prediction?.predicted_winner || '');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading prediction results...</div>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">No predictions found for this race.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Your Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Winner Prediction */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <div className="font-medium">Race Winner</div>
            <div className="text-sm text-muted-foreground">
              You predicted: {getDriverName(prediction.predicted_winner)}
            </div>
            <div className="text-sm text-muted-foreground">
              Actual winner: {prediction.races?.winner}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isWinnerCorrect ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Badge variant="default" className="bg-green-500">
                  +25 pts
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <Badge variant="secondary">
                  0 pts
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Podium Predictions */}
        {prediction.predicted_podium && prediction.predicted_podium.length > 0 && (
          <div className="p-3 rounded-lg border">
            <div className="font-medium mb-2">Podium Predictions</div>
            <div className="space-y-2">
              {prediction.predicted_podium.slice(0, 3).map((driverId, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>
                    P{index + 1}: {getDriverName(driverId)}
                  </span>
                  <Badge variant="secondary">
                    No points (results not verified)
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Points */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border">
          <div className="font-medium">Total Points Earned</div>
          <Badge variant="default" className="text-lg px-3 py-1">
            {prediction.points_earned} pts
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};