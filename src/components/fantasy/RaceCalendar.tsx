import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RacingButton } from '@/components/ui/racing-button';
import { Calendar, Clock, MapPin, Trophy, Lock } from 'lucide-react';

const races = [
  {
    id: 1,
    name: 'Saudi Arabian Grand Prix',
    location: 'Jeddah',
    date: 'Mar 17, 2024',
    time: '18:00 GMT',
    status: 'completed',
    winner: 'Max Verstappen',
    flag: '🇸🇦'
  },
  {
    id: 2,
    name: 'Australian Grand Prix',
    location: 'Melbourne',
    date: 'Mar 24, 2024',
    time: '05:00 GMT',
    status: 'completed',
    winner: 'Carlos Sainz',
    flag: '🇦🇺'
  },
  {
    id: 3,
    name: 'Japanese Grand Prix',
    location: 'Suzuka',
    date: 'Apr 7, 2024',
    time: '05:00 GMT',
    status: 'live',
    currentLap: '42/53',
    flag: '🇯🇵'
  },
  {
    id: 4,
    name: 'Chinese Grand Prix',
    location: 'Shanghai',
    date: 'Apr 21, 2024',
    time: '07:00 GMT',
    status: 'upcoming',
    lockTime: '2 days',
    flag: '🇨🇳'
  },
  {
    id: 5,
    name: 'Miami Grand Prix',
    location: 'Miami Gardens',
    date: 'May 5, 2024',
    time: '19:30 GMT',
    status: 'upcoming',
    lockTime: '16 days',
    flag: '🇺🇸'
  },
  {
    id: 6,
    name: 'Emilia Romagna Grand Prix',
    location: 'Imola',
    date: 'May 19, 2024',
    time: '13:00 GMT',
    status: 'upcoming',
    lockTime: '30 days',
    flag: '🇮🇹'
  }
];

const RaceCalendar = () => {
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
            {races.map((race, index) => (
              <Card key={race.id} className="p-6 border-2 hover:border-primary/50 racing-transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{race.flag}</div>
                    
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
                          {race.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {race.time}
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

                      {race.status === 'live' && race.currentLap && (
                        <div className="flex items-center gap-2 mt-3 p-2 bg-primary/10 rounded-lg">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-primary">
                            Lap {race.currentLap}
                          </span>
                        </div>
                      )}

                      {race.status === 'upcoming' && race.lockTime && (
                        <div className="flex items-center gap-2 mt-3 p-2 bg-muted/50 rounded-lg">
                          <Lock className="h-4 w-4" />
                          <span className="text-sm">
                            <span className="text-muted-foreground">Team changes lock in:</span>{' '}
                            <span className="font-medium">{race.lockTime}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:text-right">
                    {race.status === 'upcoming' && (
                      <RacingButton variant="outline" size="sm">
                        Edit Team
                      </RacingButton>
                    )}
                    {race.status === 'completed' && (
                      <RacingButton variant="ghost" size="sm">
                        View Results
                      </RacingButton>
                    )}
                    {race.status === 'live' && (
                      <RacingButton variant="neon" size="sm">
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