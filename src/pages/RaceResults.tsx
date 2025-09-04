import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Clock, MapPin, Calendar, Medal, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RacingButton } from '@/components/ui/racing-button';
import { useRaces } from '@/hooks/useRaces';
import { format } from 'date-fns';

const RaceResults = () => {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const { races, loading } = useRaces();
  
  const race = races.find(r => r.id === raceId);

  // Mock detailed results data - in a real app this would come from the database
  const mockResults = [
    { position: 1, driver: 'Max Verstappen', team: 'Red Bull Racing', time: '1:32:07.986', points: 25, gap: '-' },
    { position: 2, driver: 'Lando Norris', team: 'McLaren', time: '1:32:15.456', points: 18, gap: '+7.470' },
    { position: 3, driver: 'Charles Leclerc', team: 'Ferrari', time: '1:32:21.234', points: 15, gap: '+13.248' },
    { position: 4, driver: 'Lewis Hamilton', team: 'Mercedes', time: '1:32:28.567', points: 12, gap: '+20.581' },
    { position: 5, driver: 'George Russell', team: 'Mercedes', time: '1:32:31.890', points: 10, gap: '+23.904' },
    { position: 6, driver: 'Carlos Sainz', team: 'Ferrari', time: '1:32:35.123', points: 8, gap: '+27.137' },
    { position: 7, driver: 'Sergio Pérez', team: 'Red Bull Racing', time: '1:32:42.456', points: 6, gap: '+34.470' },
    { position: 8, driver: 'Fernando Alonso', team: 'Aston Martin', time: '1:32:48.789', points: 4, gap: '+40.803' },
    { position: 9, driver: 'Lance Stroll', team: 'Aston Martin', time: '1:32:55.012', points: 2, gap: '+47.026' },
    { position: 10, driver: 'Yuki Tsunoda', team: 'RB', time: '1:33:01.345', points: 1, gap: '+53.359' },
    { position: 11, driver: 'Alexander Albon', team: 'Williams', time: '1:33:07.678', points: 0, gap: '+59.692' },
    { position: 12, driver: 'Logan Sargeant', team: 'Williams', time: '1:33:14.901', points: 0, gap: '+1:06.915' },
    { position: 13, driver: 'Kevin Magnussen', team: 'Haas', time: '1:33:21.234', points: 0, gap: '+1:13.248' },
    { position: 14, driver: 'Nico Hulkenberg', team: 'Haas', time: '1:33:28.567', points: 0, gap: '+1:20.581' },
    { position: 15, driver: 'Daniel Ricciardo', team: 'RB', time: '1:33:35.890', points: 0, gap: '+1:27.904' },
    { position: 16, driver: 'Esteban Ocon', team: 'Alpine', time: '1:33:42.123', points: 0, gap: '+1:34.137' },
    { position: 17, driver: 'Pierre Gasly', team: 'Alpine', time: '1:33:48.456', points: 0, gap: '+1:40.470' },
    { position: 18, driver: 'Valtteri Bottas', team: 'Kick Sauber', time: '1:33:55.789', points: 0, gap: '+1:47.803' },
    { position: 19, driver: 'Zhou Guanyu', team: 'Kick Sauber', time: '1:34:02.012', points: 0, gap: '+1:54.026' },
    { position: 20, driver: 'Oscar Piastri', team: 'McLaren', time: 'DNF', points: 0, gap: 'DNF' },
  ];

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Medal className="h-4 w-4 text-yellow-500" />;
    if (position === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (position === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading race results...</p>
        </div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Race Not Found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/5 border-b">
        <div className="container px-4 py-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Calendar
            </Button>
            <Badge variant="outline" className="bg-accent/20 text-accent">
              {race.status === 'completed' ? 'Final Results' : race.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Race Information */}
      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl">{race.country_flag}</div>
              <div>
                <h1 className="text-4xl font-bold">{race.name}</h1>
                <div className="flex items-center gap-4 text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {race.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(race.race_date), 'MMMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {race.race_time}
                  </div>
                </div>
              </div>
            </div>

            {race.winner && (
              <Card className="p-6 bg-gradient-to-r from-accent/20 to-primary/20 border-accent/30">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-accent" />
                  <div>
                    <h2 className="text-2xl font-bold text-accent">Race Winner</h2>
                    <p className="text-lg font-medium">{race.winner}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Race Results Table */}
          <Card className="overflow-hidden">
            <div className="p-6 border-b bg-muted/20">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Final Classification
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Pos</th>
                    <th className="text-left p-4 font-semibold">Driver</th>
                    <th className="text-left p-4 font-semibold">Team</th>
                    <th className="text-left p-4 font-semibold">Time/Retired</th>
                    <th className="text-left p-4 font-semibold">Gap</th>
                    <th className="text-left p-4 font-semibold">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {mockResults.map((result, index) => (
                    <tr 
                      key={index} 
                      className={`border-b hover:bg-muted/20 ${
                        result.position <= 3 ? 'bg-accent/5' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{result.position}</span>
                          {getPositionBadge(result.position)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{result.driver}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-muted-foreground">{result.team}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-sm">{result.time}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-sm text-muted-foreground">{result.gap}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant={result.points > 0 ? "default" : "secondary"}>
                          {result.points}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Additional Race Stats */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card className="p-6">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Fastest Lap
              </h4>
              <p className="text-lg font-bold">Max Verstappen</p>
              <p className="text-sm text-muted-foreground">1:18.567 (Lap 42)</p>
            </Card>
            
            <Card className="p-6">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Laps
              </h4>
              <p className="text-lg font-bold">{race.total_laps || 58}</p>
              <p className="text-sm text-muted-foreground">Distance: 305.326 km</p>
            </Card>
            
            <Card className="p-6">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Podium Finishers
              </h4>
              <div className="space-y-1">
                <p className="text-sm">🥇 Max Verstappen</p>
                <p className="text-sm">🥈 Lando Norris</p>
                <p className="text-sm">🥉 Charles Leclerc</p>
              </div>
            </Card>
          </div>

          <div className="text-center mt-8">
            <RacingButton variant="outline" onClick={() => navigate('/')}>
              View More Races
            </RacingButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceResults;