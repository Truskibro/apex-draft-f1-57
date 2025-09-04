import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { RacingButton } from '@/components/ui/racing-button';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, TrendingUp, Zap, Target, Loader2 } from 'lucide-react';
import { useDrivers } from '@/hooks/useDrivers';

// F1 Championship scoring system
const championshipPoints = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

const RacePrediction = () => {
  const { drivers, loading } = useDrivers();
  const [predictions, setPredictions] = useState<string[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<string[]>([]);

  // Update available drivers when drivers data loads
  React.useEffect(() => {
    if (drivers.length > 0) {
      setAvailableDrivers(drivers.map(d => d.id));
    }
  }, [drivers]);

  const addToPrediction = (driverId: string) => {
    if (predictions.length < 10 && availableDrivers.includes(driverId)) {
      setPredictions([...predictions, driverId]);
      setAvailableDrivers(availableDrivers.filter(id => id !== driverId));
    }
  };

  const removeFromPrediction = (index: number) => {
    const driverId = predictions[index];
    setPredictions(predictions.filter((_, i) => i !== index));
    setAvailableDrivers([...availableDrivers, driverId]);
  };

  const getDriverById = (id: string) => drivers.find(d => d.id === id);

  const getPotentialPoints = () => {
    return predictions.reduce((total, driverId, index) => {
      if (index < 10) {
        return total + (championshipPoints[index] || 0);
      }
      return total;
    }, 0);
  };

  const getTrendIcon = (points: number) => {
    // Simple trend based on championship points ranges
    if (points > 200) return <TrendingUp className="h-3 w-3 text-accent" />;
    if (points > 100) return <TrendingUp className="h-3 w-3 text-yellow-500" />;
    if (points > 50) return <Zap className="h-3 w-3 text-muted-foreground" />;
    return <TrendingUp className="h-3 w-3 text-destructive rotate-180" />;
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/20">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading drivers...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/20">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Predict Finishing Order</h2>
            <p className="text-xl text-muted-foreground mb-6">
              Predict the top 10 finishing positions for the upcoming race
            </p>
            
            {/* Points Display */}
            <Card className="inline-flex items-center gap-4 p-4 bg-card border-2">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Potential Points</div>
                <div className="text-2xl font-bold text-accent">
                  {getPotentialPoints()}
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Predictions</div>
                <div className="text-lg font-medium">
                  {predictions.length}/10
                </div>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Predicted Finishing Order */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="h-5 w-5 text-primary" />
                <h3 className="text-2xl font-bold">Your Predictions</h3>
                <Badge variant="secondary">{predictions.length}/10</Badge>
              </div>
              
              <div className="space-y-2 min-h-[400px]">
                {predictions.length === 0 ? (
                  <Card className="p-8 text-center border-2 border-dashed border-muted-foreground/30">
                    <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Click drivers to add them to your predictions</p>
                  </Card>
                ) : (
                  predictions.map((driverId, index) => {
                    const driver = getDriverById(driverId);
                    if (!driver) return null;
                    
                    return (
                      <Card 
                        key={`${driverId}-${index}`}
                        className="p-3 border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 racing-transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                              {index + 1}
                            </div>
                             <div>
                               <div className="font-semibold">{driver.name}</div>
                               <div className="text-xs text-muted-foreground">{driver.team.name}</div>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              +{championshipPoints[index] || 0} pts
                            </Badge>
                            <button
                              onClick={() => removeFromPrediction(index)}
                              className="text-destructive hover:text-destructive/80 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>

            {/* Available Drivers */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Crown className="h-5 w-5 text-accent" />
                <h3 className="text-2xl font-bold">Available Drivers</h3>
                <Badge variant="secondary">{availableDrivers.length}</Badge>
              </div>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {availableDrivers
                  .map(driverId => getDriverById(driverId))
                  .filter(driver => driver !== undefined)
                  .sort((a, b) => (b?.championship_points || 0) - (a?.championship_points || 0))
                  .map((driver) => {
                  if (!driver) return null;
                  
                  return (
                    <Card 
                      key={driver.id}
                      className="p-3 cursor-pointer racing-transition border-2 border-border hover:border-accent/50 hover:bg-accent/5"
                      onClick={() => addToPrediction(driver.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center">
                            <Crown className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                             <div className="font-semibold flex items-center gap-2">
                               {driver.name}
                               {getTrendIcon(driver.championship_points)}
                             </div>
                             <div className="text-sm text-muted-foreground">{driver.team.name}</div>
                          </div>
                        </div>
                        
                         <div className="text-right">
                           <div className="text-sm text-muted-foreground">Season</div>
                           <div className="text-sm font-medium text-accent">{driver.championship_points} pts</div>
                         </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-6 space-y-4">
                <Card className="p-4 bg-muted/50">
                  <h4 className="font-semibold mb-2">F1 Championship Points</h4>
                  <div className="grid grid-cols-5 gap-2 text-sm">
                    {championshipPoints.map((points, index) => (
                      <div key={index} className="text-center">
                        <div className="text-muted-foreground">P{index + 1}</div>
                        <div className="font-medium">{points}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                <RacingButton 
                  variant="racing" 
                  size="lg" 
                  className="w-full"
                  disabled={predictions.length === 0}
                >
                  Submit Predictions
                </RacingButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RacePrediction;