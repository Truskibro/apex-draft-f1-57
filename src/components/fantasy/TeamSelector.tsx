import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { RacingButton } from '@/components/ui/racing-button';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, TrendingUp, Zap, Target, Loader2, GripVertical, Save, Check, X } from 'lucide-react';
import { useDrivers } from '@/hooks/useDrivers';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// F1 Championship scoring system
const championshipPoints = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

const RacePrediction = () => {
  const { drivers, loading } = useDrivers();
  const { toast } = useToast();
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<string[]>([]);
  const [fastestLapPrediction, setFastestLapPrediction] = useState<string>('');
  const [dnfPrediction, setDnfPrediction] = useState<string>('');
  const [availableDrivers, setAvailableDrivers] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const [hasUpcomingRaces, setHasUpcomingRaces] = useState(true);

  // Update available drivers when drivers data loads
  React.useEffect(() => {
    console.log('🔄 Effect running, drivers.length:', drivers.length);
    if (drivers.length > 0 && user) {
      loadPredictionsFromDatabase();
    } else if (drivers.length > 0) {
      // Load from localStorage if not logged in
      loadPredictionsFromLocalStorage();
    }
  }, [drivers, user]);

  const loadPredictionsFromDatabase = async () => {
    try {
      // Get the next upcoming race
      const { data: upcomingRaces } = await supabase
        .from('races')
        .select('id, name, status')
        .eq('status', 'upcoming')
        .order('race_date', { ascending: true })
        .limit(1);

      if (!upcomingRaces || upcomingRaces.length === 0) {
        console.log('🚫 No upcoming races found');
        // Clear any saved predictions since there are no upcoming races
        setPredictions([]);
        setAvailableDrivers(drivers.map(d => d.id));
        clearLocalStorage();
        setHasUpcomingRaces(false);
        return;
      }

      setHasUpcomingRaces(true);

      const raceId = upcomingRaces[0].id;
      console.log('🏁 Loading predictions for upcoming race:', upcomingRaces[0].name);

      // Load existing predictions for this race
      const { data: existingPrediction } = await supabase
        .from('user_predictions')
        .select('predicted_winner, predicted_podium')
        .eq('user_id', user.id)
        .eq('race_id', raceId)
        .maybeSingle();

      if (existingPrediction && existingPrediction.predicted_podium) {
        console.log('📊 Found existing predictions:', existingPrediction);
        const validPredictions = existingPrediction.predicted_podium.filter((id: string) => 
          drivers.some(driver => driver.id === id)
        );
        setPredictions(validPredictions);
        
        // Set available drivers (excluding those in predictions)
        const remainingDrivers = drivers
          .map(d => d.id)
          .filter(id => !validPredictions.includes(id));
        setAvailableDrivers(remainingDrivers);
        setIsSaved(true);
      } else {
        console.log('🆕 No existing predictions, starting fresh');
        setPredictions([]);
        setAvailableDrivers(drivers.map(d => d.id));
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading predictions from database:', error);
      // Fallback to localStorage
      loadPredictionsFromLocalStorage();
    }
  };

  const loadPredictionsFromLocalStorage = () => {
    // Load saved predictions from localStorage
    const savedPredictions = localStorage.getItem('f1-predictions');
    const savedFastestLap = localStorage.getItem('f1-fastest-lap');
    const savedDnf = localStorage.getItem('f1-dnf');
    
    console.log('💾 localStorage data:', { savedPredictions, savedFastestLap, savedDnf });
    
    if (savedPredictions) {
      const parsedPredictions = JSON.parse(savedPredictions);
      console.log('📋 Parsed predictions:', parsedPredictions);
      // Validate that all saved driver IDs still exist
      const validPredictions = parsedPredictions.filter((id: string) => 
        drivers.some(driver => driver.id === id)
      );
      console.log('✅ Valid predictions:', validPredictions);
      setPredictions(validPredictions);
      
      // Set available drivers (excluding those in predictions)
      const remainingDrivers = drivers
        .map(d => d.id)
        .filter(id => !validPredictions.includes(id));
      setAvailableDrivers(remainingDrivers);
    } else {
      console.log('❌ No saved predictions found');
      setAvailableDrivers(drivers.map(d => d.id));
    }
    
    if (savedFastestLap && drivers.some(driver => driver.id === savedFastestLap)) {
      console.log('⚡ Setting fastest lap:', savedFastestLap);
      setFastestLapPrediction(savedFastestLap);
    }
    
    if (savedDnf && drivers.some(driver => driver.id === savedDnf)) {
      console.log('❌ Setting DNF:', savedDnf);
      setDnfPrediction(savedDnf);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('f1-predictions');
    localStorage.removeItem('f1-fastest-lap');
    localStorage.removeItem('f1-dnf');
    setFastestLapPrediction('');
    setDnfPrediction('');
  };


  const addToPrediction = (driverId: string) => {
    if (predictions.length < 10 && availableDrivers.includes(driverId)) {
      setPredictions([...predictions, driverId]);
      setAvailableDrivers(availableDrivers.filter(id => id !== driverId));
      setIsSaved(false);
    }
  };

  const removeFromPrediction = (index: number) => {
    const driverId = predictions[index];
    setPredictions(predictions.filter((_, i) => i !== index));
    setAvailableDrivers([...availableDrivers, driverId]);
    setIsSaved(false);
    
    // Clear fastest lap prediction if it was the removed driver
    if (fastestLapPrediction === driverId) {
      setFastestLapPrediction('');
    }
    
    // Clear DNF prediction if it was the removed driver
    if (dnfPrediction === driverId) {
      setDnfPrediction('');
    }
  };

  const movePrediction = (fromIndex: number, toIndex: number) => {
    const newPredictions = [...predictions];
    const [movedDriver] = newPredictions.splice(fromIndex, 1);
    newPredictions.splice(toIndex, 0, movedDriver);
    setPredictions(newPredictions);
    setIsSaved(false);
  };

  const handleSavePredictions = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save predictions",
        variant: "destructive"
      });
      return;
    }

    console.log('💾 Saving predictions:', predictions);
    
    try {
      // Get the current race (for now, just use the first race as a placeholder)
      const { data: races } = await supabase
        .from('races')
        .select('id')
        .eq('status', 'upcoming')
        .order('race_date', { ascending: true })
        .limit(1);

      if (!races || races.length === 0) {
        toast({
          title: "No upcoming races",
          description: "There are no upcoming races to make predictions for",
          variant: "destructive"
        });
        return;
      }

      const raceId = races[0].id;
      const predictedWinner = predictions.length > 0 ? predictions[0] : null;
      const predictedPodium = predictions.slice(0, 3); // Top 3 predictions

      // Save or update prediction in database
      const { data: existingPrediction } = await supabase
        .from('user_predictions')
        .select('id')
        .eq('user_id', user.id)
        .eq('race_id', raceId)
        .maybeSingle();

      if (existingPrediction) {
        // Update existing prediction
        const { error } = await supabase
          .from('user_predictions')
          .update({
            predicted_winner: predictedWinner,
            predicted_podium: predictedPodium,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPrediction.id);

        if (error) throw error;
      } else {
        // Create new prediction
        const { error } = await supabase
          .from('user_predictions')
          .insert({
            user_id: user.id,
            race_id: raceId,
            predicted_winner: predictedWinner,
            predicted_podium: predictedPodium,
            points_earned: 0 // Will be calculated when race completes
          });

        if (error) throw error;
      }

      // Also save to localStorage as backup
      localStorage.setItem('f1-predictions', JSON.stringify(predictions));
      localStorage.setItem('f1-fastest-lap', fastestLapPrediction);
      localStorage.setItem('f1-dnf', dnfPrediction);
      
      setIsSaved(true);
      toast({
        title: "Predictions Saved!",
        description: `Saved ${predictions.length} predictions to your account`,
      });
    } catch (error) {
      console.error('Error saving predictions:', error);
      toast({
        title: "Error saving predictions",
        description: "Failed to save predictions. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      movePrediction(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const getDriverById = (id: string) => drivers.find(d => d.id === id);

  const getPotentialPoints = () => {
    const finishingPoints = predictions.reduce((total, driverId, index) => {
      if (index < 10) {
        return total + (championshipPoints[index] || 0);
      }
      return total;
    }, 0);
    
    // Add fastest lap bonus
    const fastestLapBonus = fastestLapPrediction ? 10 : 0;
    
    // Add DNF bonus
    const dnfBonus = dnfPrediction ? 10 : 0;
    
    return finishingPoints + fastestLapBonus + dnfBonus;
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
    <section className="py-16 bg-muted/20" data-section="team-selector">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Predict Finishing Order</h2>
            {hasUpcomingRaces ? (
              <p className="text-xl text-muted-foreground mb-6">
                Predict the top 10 finishing positions for the next upcoming race
              </p>
            ) : (
              <p className="text-xl text-muted-foreground mb-6">
                No upcoming races found. All predictions have been cleared after race completion.
              </p>
            )}
            
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
              
              <div className="space-y-2">
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
                        className={`p-3 border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 racing-transition group cursor-grab active:cursor-grabbing ${
                          draggedIndex === index ? 'opacity-50 scale-105' : ''
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                              {index + 1}
                            </div>
                            
                            <GripVertical className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                            
                             <div>
                              <div className="font-semibold flex items-center gap-2">
                                {driver.name}
                                {fastestLapPrediction === driverId && (
                                  <Zap className="h-4 w-4 text-accent" />
                                )}
                                {dnfPrediction === driverId && (
                                  <X className="h-4 w-4 text-destructive" />
                                )}
                              </div>
                               <div className="text-xs text-muted-foreground">{driver.team.name}</div>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Fastest lap button */}
                            {fastestLapPrediction !== driverId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFastestLapPrediction(driverId);
                                  setIsSaved(false);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-accent/20 hover:bg-accent/30 rounded p-1"
                                title="Set as fastest lap prediction"
                              >
                                <Zap className="h-3 w-3 text-accent" />
                              </button>
                            )}

                            {/* DNF button */}
                            {dnfPrediction !== driverId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDnfPrediction(driverId);
                                  setIsSaved(false);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/20 hover:bg-destructive/30 rounded p-1"
                                title="Set as DNF prediction"
                              >
                                <X className="h-3 w-3 text-destructive" />
                              </button>
                            )}

                            <Badge variant="outline" className="text-xs">
                              +{championshipPoints[index] || 0} pts
                            </Badge>
                            
                            <button
                              onClick={() => removeFromPrediction(index)}
                              className="text-destructive hover:text-destructive/80 text-sm"
                              title="Remove from predictions"
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
              
              {/* Fastest Lap Prediction */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-accent" />
                  <h4 className="text-lg font-bold">Fastest Lap Prediction</h4>
                  <Badge variant="outline" className="bg-accent/20 text-accent">+10 pts</Badge>
                </div>
                
                {fastestLapPrediction ? (
                  <Card className="p-3 border-2 border-accent/30 bg-accent/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground">
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold">{getDriverById(fastestLapPrediction)?.name}</div>
                          <div className="text-xs text-muted-foreground">Fastest Lap Prediction</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFastestLapPrediction('');
                          setIsSaved(false);
                        }}
                        className="text-destructive hover:text-destructive/80 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4 text-center border-2 border-dashed border-muted-foreground/30">
                    <Zap className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Choose who you think will set the fastest lap time during the race for +10 bonus points</p>
                  </Card>
                )}
              </div>

              {/* DNF Prediction */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <X className="h-5 w-5 text-destructive" />
                  <h4 className="text-lg font-bold">DNF Prediction</h4>
                  <Badge variant="outline" className="bg-destructive/20 text-destructive">+10 pts</Badge>
                </div>
                
                {dnfPrediction ? (
                  <Card className="p-3 border-2 border-destructive/30 bg-destructive/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground">
                          <X className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold">{getDriverById(dnfPrediction)?.name}</div>
                          <div className="text-xs text-muted-foreground">DNF Prediction</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDnfPrediction('');
                          setIsSaved(false);
                        }}
                        className="text-destructive hover:text-destructive/80 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4 text-center border-2 border-dashed border-muted-foreground/30">
                    <X className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Predict which driver will not finish the race (DNF) for +10 bonus points</p>
                  </Card>
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
                       className="p-3 cursor-pointer racing-transition border-2 border-border hover:border-accent/50 hover:bg-accent/5 group"
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
                         
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Season</div>
                              <div className="text-sm font-medium text-accent">{driver.championship_points} pts</div>
                            </div>
                            
                            {!fastestLapPrediction && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFastestLapPrediction(driver.id);
                                  setIsSaved(false);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-accent/20 hover:bg-accent/30 rounded p-1"
                                title="Predict fastest lap"
                              >
                                <Zap className="h-4 w-4 text-accent" />
                              </button>
                            )}
                            
                            {!dnfPrediction && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDnfPrediction(driver.id);
                                  setIsSaved(false);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/20 hover:bg-destructive/30 rounded p-1"
                                title="Predict DNF"
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </button>
                            )}
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
                  onClick={handleSavePredictions}
                >
                  {isSaved ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Predictions Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Predictions
                    </>
                  )}
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