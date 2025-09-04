import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RacingButton } from '@/components/ui/racing-button';
import { Calendar, Clock, MapPin, Trophy, Lock, Loader2 } from 'lucide-react';
import { useRaces } from '@/hooks/useRaces';
import { format } from 'date-fns';

const RaceCalendar = () => {
  const { races, loading } = useRaces();

  const getStatusBadge = (race: any) => {
    switch (race.status) {
      case 'completed':
        return <Badge className="bg-accent/20 text-accent">Completed</Badge>;
      case 'live':
        return <Badge className="bg-primary/20 text-primary animate-pulse">Live</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      default:
        return null;
    }
  };

  const getLockTime = (raceDate: string) => {
    const now = new Date();
    const race = new Date(raceDate);
    const diffTime = race.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} days`;
    } else if (diffDays === 0) {
      return 'Today';
    } else {
      return 'Locked';
    }
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container px-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-bold">Race Calendar</h2>
            </div>
            <p className="text-xl text-muted-foreground">
              Track the F1 season and manage your team changes
            </p>
          </div>

          <div className="grid gap-4">
            {races.map((race) => (
              <Card key={race.id} className="p-6 border-2 hover:border-primary/50 racing-transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{race.country_flag}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{race.name}</h3>
                        {getStatusBadge(race)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {race.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(race.race_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {race.race_time}
                        </div>
                      </div>

                      {race.status === 'completed' && race.winner && (
                        <div className="flex items-center gap-2 mt-3 p-2 bg-accent/10 rounded-lg">
                          <Trophy className="h-4 w-4 text-accent" />
                          <span className="text-sm">
                            <span className="text-muted-foreground">Winner:</span>{' '}
                            <span className="font-medium text-accent">{race.winner}</span>
                          </span>
                        </div>
                      )}

                      {race.status === 'live' && race.current_lap && race.total_laps && (
                        <div className="flex items-center gap-2 mt-3 p-2 bg-primary/10 rounded-lg">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-primary">
                            Lap {race.current_lap}/{race.total_laps}
                          </span>
                        </div>
                      )}

                      {race.status === 'upcoming' && (
                        <div className="flex items-center gap-2 mt-3 p-2 bg-muted/50 rounded-lg">
                          <Lock className="h-4 w-4" />
                          <span className="text-sm">
                            <span className="text-muted-foreground">Team changes lock in:</span>{' '}
                            <span className="font-medium">{getLockTime(race.race_date)}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:text-right">
                    {race.status === 'upcoming' && (
                      <RacingButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Scroll to team selector section
                          const teamSelector = document.querySelector('[data-section="team-selector"]');
                          teamSelector?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        Edit Team
                      </RacingButton>
                    )}
                    {race.status === 'completed' && (
                      <RacingButton 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          alert(`Race Results for ${race.name}:\n\nWinner: ${race.winner || 'TBD'}\n\nFull results coming soon!`);
                        }}
                      >
                        View Results
                      </RacingButton>
                    )}
                    {race.status === 'live' && (
                      <RacingButton 
                        variant="neon" 
                        size="sm"
                        onClick={() => {
                          window.open('https://www.formula1.com/en/live-timing.html', '_blank');
                        }}
                      >
                        Watch Live
                      </RacingButton>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <RacingButton variant="metallic" size="lg">
              View Full Season
            </RacingButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RaceCalendar;