import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDrivers } from '@/hooks/useDrivers';
import { CheckCircle, XCircle, Trophy, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

type PredictionHistoryItem = {
  id: string;
  predicted_podium: string[];
  points_earned: number;
  created_at: string;
  races: {
    name: string;
    location: string;
    race_date: string;
    winner: string;
    country_flag: string;
  };
};

export const PredictionHistory = () => {
  const [predictions, setPredictions] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { drivers } = useDrivers();

  useEffect(() => {
    if (user) {
      fetchPredictionHistory();
    }
  }, [user]);

  const fetchPredictionHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('user_predictions')
        .select(`
          id,
          predicted_podium,
          points_earned,
          created_at,
          races (
            name,
            location,
            race_date,
            winner,
            country_flag
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching prediction history:', error);
        return;
      }

      setPredictions(data || []);
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

  const isWinnerCorrect = (prediction: PredictionHistoryItem) => {
    if (!prediction.predicted_podium || prediction.predicted_podium.length === 0) return false;
    const predictedWinner = getDriverName(prediction.predicted_podium[0]);
    return prediction.races?.winner === predictedWinner;
  };

  const getTotalPoints = () => {
    return predictions.reduce((total, prediction) => total + (prediction.points_earned || 0), 0);
  };

  const getCorrectPredictions = () => {
    return predictions.filter(prediction => isWinnerCorrect(prediction)).length;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prediction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading prediction history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              <div>
                <div className="text-2xl font-bold">{getTotalPoints()}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{getCorrectPredictions()}</div>
                <div className="text-sm text-muted-foreground">Correct Winners</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{predictions.length}</div>
                <div className="text-sm text-muted-foreground">Total Predictions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prediction History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Prediction History</CardTitle>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No predictions found. Start making predictions for upcoming races!
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <Card key={prediction.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Race Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{prediction.races?.country_flag}</span>
                        <div>
                          <h3 className="font-semibold">{prediction.races?.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {prediction.races?.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {prediction.races?.race_date && format(new Date(prediction.races.race_date), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Prediction Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-muted-foreground">Your winner prediction: </span>
                            <span className="font-medium">
                              {prediction.predicted_podium && prediction.predicted_podium.length > 0 
                                ? getDriverName(prediction.predicted_podium[0]) 
                                : 'No winner prediction'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">{isWinnerCorrect(prediction) ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600 font-medium">Correct!</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-sm text-red-600 font-medium">Incorrect</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {prediction.races?.winner && (
                          <div className="text-sm text-muted-foreground">
                            Actual winner: <span className="font-medium">{prediction.races.winner}</span>
                          </div>
                        )}

                        {prediction.predicted_podium && prediction.predicted_podium.length > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Podium prediction: </span>
                            <span className="font-medium">
                              {prediction.predicted_podium.slice(0, 3).map(getDriverName).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Points Earned */}
                    <div className="ml-4">
                      <Badge variant="default" className="text-lg px-3 py-1">
                        {prediction.points_earned || 0} pts
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};