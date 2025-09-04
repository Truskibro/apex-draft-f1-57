import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Medal, Trophy, TrendingUp, Star } from 'lucide-react';

const leaderboardData = [
  {
    id: 1,
    rank: 1,
    name: 'Alex Hamilton',
    teamName: 'Speed Demons',
    points: 1247,
    weeklyPoints: 89,
    trend: 'up',
    change: '+2',
    avatar: 'AH'
  },
  {
    id: 2,
    rank: 2,
    name: 'Sarah McLaren',
    teamName: 'Apex Hunters',
    points: 1198,
    weeklyPoints: 76,
    trend: 'down',
    change: '-1',
    avatar: 'SM'
  },
  {
    id: 3,
    rank: 3,
    name: 'Mike Verstappen',
    teamName: 'Grid Legends',
    points: 1156,
    weeklyPoints: 82,
    trend: 'up',
    change: '+1',
    avatar: 'MV'
  },
  {
    id: 4,
    rank: 4,
    name: 'Emma Ferrari',
    teamName: 'Pole Position',
    points: 1089,
    weeklyPoints: 65,
    trend: 'stable',
    change: '=',
    avatar: 'EF'
  },
  {
    id: 5,
    rank: 5,
    name: 'You',
    teamName: 'Racing Rebels',
    points: 1034,
    weeklyPoints: 71,
    trend: 'up',
    change: '+3',
    avatar: 'YO',
    isCurrentUser: true
  }
];

const Leaderboard = () => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-accent" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-destructive rotate-180" />;
      default: return null;
    }
  };

  return (
    <section className="py-16 bg-muted/20">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-bold">League Standings</h2>
            </div>
            <p className="text-xl text-muted-foreground">
              See how you stack up against the competition
            </p>
          </div>

          {/* Top 3 Podium */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {leaderboardData.slice(0, 3).map((player, index) => {
              const positions = ['md:order-2', 'md:order-1', 'md:order-3'];
              const heights = ['h-32', 'h-40', 'h-24'];
              
              return (
                <Card 
                  key={player.id} 
                  className={`${positions[index]} p-6 text-center border-2 ${
                    player.rank === 1 ? 'border-primary racing-shadow' : 'border-border'
                  }`}
                >
                  <div className={`${heights[index]} flex flex-col items-center justify-end mb-4`}>
                    <div className="mb-2">{getRankIcon(player.rank)}</div>
                    <Avatar className="w-16 h-16 border-2 border-primary">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {player.avatar}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-1">{player.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{player.teamName}</p>
                  <div className="text-2xl font-bold text-primary">{player.points}</div>
                  <div className="text-xs text-muted-foreground">points</div>
                </Card>
              );
            })}
          </div>

          {/* Full Leaderboard */}
          <Card className="border-2">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Star className="h-5 w-5 text-accent" />
                Full Standings
              </h3>
            </div>
            
            <div className="divide-y divide-border">
              {leaderboardData.map((player) => (
                <div 
                  key={player.id} 
                  className={`p-4 flex items-center justify-between hover:bg-muted/50 racing-transition ${
                    player.isCurrentUser ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-16">
                      <span className="text-2xl font-bold text-muted-foreground">#{player.rank}</span>
                      {getRankIcon(player.rank)}
                    </div>
                    
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className={player.isCurrentUser ? 'bg-primary/20 text-primary' : ''}>
                        {player.avatar}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {player.name}
                        {player.isCurrentUser && <Badge variant="secondary">You</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">{player.teamName}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="text-sm text-muted-foreground">This Week</div>
                      <div className="font-medium text-accent">+{player.weeklyPoints}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Total Points</div>
                      <div className="text-lg font-bold">{player.points}</div>
                    </div>
                    
                    <div className="flex items-center gap-1 w-12">
                      {getTrendIcon(player.trend)}
                      <span className={`text-sm font-medium ${
                        player.trend === 'up' ? 'text-accent' : 
                        player.trend === 'down' ? 'text-destructive' : 
                        'text-muted-foreground'
                      }`}>
                        {player.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;