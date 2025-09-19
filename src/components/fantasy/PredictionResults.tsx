import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDrivers } from '@/hooks/useDrivers';
import { CheckCircle, XCircle, Target } from 'lucide-react';

type PredictionResult = {
  id: string;
  predicted_podium: string[];
  predicted_fastest_lap?: string;
  predicted_dnf?: string;
  points_earned: number;
  races: {
    name: string;
    winner: string;
    second_place?: string;
    third_place?: string;
    fourth_place?: string;
    fifth_place?: string;
    sixth_place?: string;
    seventh_place?: string;
    eighth_place?: string;
    ninth_place?: string;
    tenth_place?: string;
    fastest_lap_driver?: string;
    dnf_drivers?: string[];
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
          predicted_podium,
          predicted_fastest_lap,
          predicted_dnf,
          points_earned,
          races (
            name,
            winner,
            second_place,
            third_place,
            fourth_place,
            fifth_place,
            sixth_place,
            seventh_place,
            eighth_place,
            ninth_place,
            tenth_place,
            fastest_lap_driver,
            dnf_drivers
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

  const isWinnerCorrect = () => {
    if (!prediction?.predicted_podium || prediction.predicted_podium.length === 0) return false;
    const predictedWinner = getDriverName(prediction.predicted_podium[0]);
    return prediction.races?.winner === predictedWinner;
  };

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
              You predicted: {prediction.predicted_podium && prediction.predicted_podium.length > 0 
                ? getDriverName(prediction.predicted_podium[0]) 
                : 'No winner prediction'}
            </div>
            <div className="text-sm text-muted-foreground">
              Actual winner: {prediction.races?.winner}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isWinnerCorrect() ? (
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

        {/* Top 10 Predictions */}
        {prediction.predicted_podium && prediction.predicted_podium.length > 0 && (
          <div className="p-3 rounded-lg border">
            <div className="font-medium mb-2">Top 10 Predictions</div>
            <div className="space-y-2">
              {prediction.predicted_podium.slice(0, 10).map((driverId, index) => {
                const driverName = getDriverName(driverId);
                const positionResults = [
                  prediction.races?.winner,
                  prediction.races?.second_place,
                  prediction.races?.third_place,
                  prediction.races?.fourth_place,
                  prediction.races?.fifth_place,
                  prediction.races?.sixth_place,
                  prediction.races?.seventh_place,
                  prediction.races?.eighth_place,
                  prediction.races?.ninth_place,
                  prediction.races?.tenth_place
                ];
                const actualPosition = positionResults[index];
                const isCorrect = driverName === actualPosition;
                const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
                const points = isCorrect ? pointsSystem[index] : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>
                      P{index + 1}: {driverName}
                    </span>
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <Badge variant="default" className="bg-green-500">
                            +{points} pts
                          </Badge>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <Badge variant="secondary">
                            0 pts
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fastest Lap Prediction */}
        {prediction.predicted_fastest_lap && (
          <div className="p-3 rounded-lg border">
            <div className="font-medium mb-2">Fastest Lap Prediction</div>
            <div className="flex items-center justify-between text-sm">
              <span>{getDriverName(prediction.predicted_fastest_lap)}</span>
              <div className="flex items-center gap-2">
                {getDriverName(prediction.predicted_fastest_lap) === prediction.races?.fastest_lap_driver ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="default" className="bg-green-500">
                      +10 pts
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <Badge variant="secondary">
                      0 pts
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DNF Prediction */}
        {prediction.predicted_dnf && (
          <div className="p-3 rounded-lg border">
            <div className="font-medium mb-2">DNF Prediction</div>
            <div className="flex items-center justify-between text-sm">
              <span>{getDriverName(prediction.predicted_dnf)}</span>
              <div className="flex items-center gap-2">
                {prediction.races?.dnf_drivers?.includes(getDriverName(prediction.predicted_dnf)) ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="default" className="bg-green-500">
                      +10 pts
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <Badge variant="secondary">
                      0 pts
                    </Badge>
                  </>
                )}
              </div>
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