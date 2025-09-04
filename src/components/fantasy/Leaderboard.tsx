import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Medal, Trophy, TrendingUp, Star, Loader2, Users, User } from 'lucide-react';
import { useStandings } from '@/hooks/useStandings';
const Leaderboard = () => {
  const {
    standings,
    loading
  } = useStandings();
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };
  const getTrendIcon = (rank: number, previousRank?: number) => {
    if (!previousRank) return null;
    if (rank < previousRank) {
      return <TrendingUp className="h-4 w-4 text-accent" />;
    } else if (rank > previousRank) {
      return <TrendingUp className="h-4 w-4 text-destructive rotate-180" />;
    }
    return null;
  };
  const getTrendChange = (rank: number, previousRank?: number) => {
    if (!previousRank) return '=';
    const change = previousRank - rank;
    if (change > 0) return `+${change}`;
    if (change < 0) return change.toString();
    return '=';
  };
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Group standings by team for league view
  const getLeagueStandings = () => {
    const teamStandings = standings.reduce((acc, player) => {
      const teamName = player.profile?.team_name || 'No Team';
      if (!acc[teamName]) {
        acc[teamName] = {
          teamName,
          totalPoints: 0,
          playerCount: 0,
          players: []
        };
      }
      acc[teamName].totalPoints += player.total_points;
      acc[teamName].playerCount += 1;
      acc[teamName].players.push(player);
      return acc;
    }, {} as Record<string, {
      teamName: string;
      totalPoints: number;
      playerCount: number;
      players: typeof standings;
    }>);
    return Object.values(teamStandings).sort((a, b) => b.totalPoints - a.totalPoints).map((team, index) => ({
      ...team,
      rank: index + 1
    }));
  };
  if (loading) {
    return <section className="py-16 bg-muted/20">
        <div className="container px-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>;
  }
  if (standings.length === 0) {
    return <section className="py-16 bg-muted/20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Standings</h2>
            <p className="text-muted-foreground">No standings available yet. Start making predictions!</p>
          </div>
        </div>
      </section>;
  }
  const leagueStandings = getLeagueStandings();
  return <section className="py-16 bg-muted/20">
      <div className="container px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-bold bg-primary/10 p-4 rounded-lg">🏁 Leaderboards  🏆</h2>
            </div>
            <p className="text-xl text-muted-foreground bg-accent/10 p-2 rounded">
              Individual players and team standings - Updated Layout
            </p>
          </div>

          {/* Side by Side Leaderboards */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Individual Leaderboard */}
            <div>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <User className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Individual Leaderboard</h3>
                </div>
              </div>

              {/* Top 3 Individual Podium */}
              <div className="mb-8">
                <div className="grid grid-cols-3 gap-2">
                  {standings.slice(0, 3).map((player, index) => {
                  const positions = ['order-2', 'order-1', 'order-3'];
                  const heights = ['h-24', 'h-32', 'h-20'];
                  return <Card key={player.id} className={`${positions[index]} p-4 text-center border-2 ${player.rank === 1 ? 'border-primary racing-shadow' : 'border-border'}`}>
                        <div className={`${heights[index]} flex flex-col items-center justify-end mb-3`}>
                          <div className="mb-1">{getRankIcon(player.rank)}</div>
                          <Avatar className="w-12 h-12 border-2 border-primary">
                            <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                              {getInitials(player.profile?.display_name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <h4 className="font-bold text-sm mb-1">
                          {player.profile?.display_name || 'Anonymous'}
                        </h4>
                        <div className="text-lg font-bold text-primary">{player.total_points}</div>
                        <div className="text-xs text-muted-foreground">pts</div>
                      </Card>;
                })}
                </div>
              </div>

              {/* Full Individual Rankings */}
              <Card className="border-2 max-h-[500px] overflow-y-auto">
                <div className="divide-y divide-border">
                  {standings.map(player => <div key={player.id} className={`p-3 flex items-center justify-between hover:bg-muted/50 racing-transition ${player.isCurrentUser ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 w-8">
                          <span className="text-sm font-bold text-muted-foreground">#{player.rank}</span>
                          {player.rank <= 3 && getRankIcon(player.rank)}
                        </div>
                        
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className={`text-xs ${player.isCurrentUser ? 'bg-primary/20 text-primary' : ''}`}>
                            {getInitials(player.profile?.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="font-semibold text-xs flex items-center gap-1">
                            {player.profile?.display_name || 'Anonymous'}
                            {player.isCurrentUser && <Badge variant="secondary" className="text-xs px-1 py-0">You</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {player.profile?.team_name || 'No Team'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="text-xs text-muted-foreground">Total</div>
                          <div className="text-sm font-bold">{player.total_points}</div>
                        </div>
                        
                        <div className="flex items-center gap-1 w-6">
                          {getTrendIcon(player.rank, player.previous_rank)}
                          <span className={`text-xs font-medium ${player.rank < (player.previous_rank || player.rank) ? 'text-accent' : player.rank > (player.previous_rank || player.rank) ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {getTrendChange(player.rank, player.previous_rank)}
                          </span>
                        </div>
                      </div>
                    </div>)}
                </div>
              </Card>
            </div>

            {/* Team Leaderboard */}
            <div>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Users className="h-6 w-6 text-accent" />
                  <h3 className="text-2xl font-bold">Team Leaderboard</h3>
                </div>
              </div>

              {/* Top 3 Teams */}
              <div className="mb-8">
                <div className="grid grid-cols-3 gap-2">
                  {leagueStandings.slice(0, 3).map((team, index) => {
                  const positions = ['order-2', 'order-1', 'order-3'];
                  const heights = ['h-24', 'h-32', 'h-20'];
                  return <Card key={team.teamName} className={`${positions[index]} p-4 text-center border-2 ${team.rank === 1 ? 'border-accent racing-shadow' : 'border-border'}`}>
                        <div className={`${heights[index]} flex flex-col items-center justify-end mb-3`}>
                          <div className="mb-1">{getRankIcon(team.rank)}</div>
                          <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center border-2 border-accent">
                            <Users className="h-6 w-6 text-accent" />
                          </div>
                        </div>
                        
                        <h4 className="font-bold text-sm mb-1">
                          {team.teamName}
                        </h4>
                        <div className="text-lg font-bold text-accent">{team.totalPoints}</div>
                        <div className="text-xs text-muted-foreground">pts</div>
                      </Card>;
                })}
                </div>
              </div>

              {/* Full Team Rankings */}
              <Card className="border-2 max-h-[500px] overflow-y-auto">
                <div className="divide-y divide-border">
                  {leagueStandings.map(team => <div key={team.teamName} className="p-3 flex items-center justify-between hover:bg-muted/50 racing-transition">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 w-8">
                          <span className="text-sm font-bold text-muted-foreground">#{team.rank}</span>
                          {team.rank <= 3 && getRankIcon(team.rank)}
                        </div>
                        
                        <div className="w-6 h-6 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center">
                          <Users className="h-3 w-3 text-primary" />
                        </div>
                        
                        <div>
                          <div className="font-semibold text-xs">
                            {team.teamName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {team.playerCount} member{team.playerCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="text-xs text-muted-foreground">Avg</div>
                          <div className="text-sm font-medium text-accent">{Math.round(team.totalPoints / team.playerCount)}</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Total</div>
                          <div className="text-sm font-bold">{team.totalPoints}</div>
                        </div>
                      </div>
                    </div>)}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Leaderboard;