import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Medal, Trophy, TrendingUp, Loader2, Users, User } from 'lucide-react';
import { useStandings } from '@/hooks/useStandings';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type LeagueStanding = {
  leagueName: string;
  leagueId: string;
  totalPoints: number;
  memberCount: number;
};

const Leaderboard = () => {
  const { standings, loading } = useStandings();
  const { user } = useAuth();
  const [leagueStandings, setLeagueStandings] = useState<LeagueStanding[]>([]);
  const [leaguesLoading, setLeaguesLoading] = useState(true);
  const [userHasLeague, setUserHasLeague] = useState(false);

  useEffect(() => {
    fetchLeagueStandings();
  }, [user?.id]);

  const fetchLeagueStandings = async () => {
    setLeaguesLoading(true);
    try {
      if (!user) {
        setUserHasLeague(false);
        setLeagueStandings([]);
        return;
      }

      // Check if user is in any leagues
      const { data: userLeagues } = await supabase
        .from('league_members')
        .select('league_id')
        .eq('user_id', user.id);

      if (!userLeagues || userLeagues.length === 0) {
        setUserHasLeague(false);
        setLeagueStandings([]);
        return;
      }

      setUserHasLeague(true);
      const leagueIds = userLeagues.map(l => l.league_id);

      // Get league details
      const { data: leagues } = await supabase
        .from('leagues')
        .select('id, name')
        .in('id', leagueIds);

      // Get all members for those leagues
      const { data: allMembers } = await supabase
        .from('league_members')
        .select('league_id, user_id')
        .in('league_id', leagueIds);

      // Get standings for all members
      const memberUserIds = [...new Set(allMembers?.map(m => m.user_id) || [])];
      const { data: memberStandings } = await supabase
        .from('user_standings')
        .select('user_id, total_points')
        .in('user_id', memberUserIds);

      // Aggregate by league
      const standingsByLeague: LeagueStanding[] = (leagues || []).map(league => {
        const members = allMembers?.filter(m => m.league_id === league.id) || [];
        const totalPoints = members.reduce((sum, member) => {
          const standing = memberStandings?.find(s => s.user_id === member.user_id);
          return sum + (standing?.total_points || 0);
        }, 0);
        return {
          leagueName: league.name,
          leagueId: league.id,
          totalPoints,
          memberCount: members.length,
        };
      }).sort((a, b) => b.totalPoints - a.totalPoints);

      setLeagueStandings(standingsByLeague);
    } catch (error) {
      console.error('Error fetching league standings:', error);
    } finally {
      setLeaguesLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return null;
    }
  };

  const getTrendIcon = (rank: number, previousRank?: number) => {
    if (!previousRank) return null;
    if (rank < previousRank) return <TrendingUp className="h-4 w-4 text-accent" />;
    if (rank > previousRank) return <TrendingUp className="h-4 w-4 text-destructive rotate-180" />;
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

  if (loading) {
    return (
      <section className="py-16 bg-muted/20">
        <div className="container px-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  // Filter out users with 0 points - they haven't actively participated yet
  const activeStandings = standings.filter(s => s.total_points > 0);

  if (activeStandings.length === 0) {
    return (
      <section className="py-16 bg-muted/20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-bold">Leaderboards</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              No standings available yet. Be the first to make predictions and start earning points!
            </p>
          </div>
        </div>
      </section>
    );
  }

  const showLeagues = userHasLeague && leagueStandings.length > 0;
  const displayStandings = activeStandings;

  return (
    <section className="py-16 bg-muted/20">
      <div className="container px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-bold bg-primary/10 p-4 rounded-lg">🏁 Leaderboards 🏆</h2>
            </div>
          </div>

          <div className={`grid ${showLeagues ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'} gap-6 md:gap-8`}>
            {/* Individual Leaderboard */}
            <div>
              <div className="text-center mb-6 md:mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <User className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  <h3 className="text-xl md:text-2xl font-bold">Individual Leaderboard</h3>
                </div>
              </div>

              {/* Top 3 Podium */}
              {displayStandings.length >= 3 && (
                <div className="mb-6 md:mb-8">
                  <div className="grid grid-cols-3 gap-1 md:gap-2">
                    {displayStandings.slice(0, 3).map((player, index) => {
                      const positions = ['order-2', 'order-1', 'order-3'];
                      const heights = ['h-16 md:h-24', 'h-20 md:h-32', 'h-14 md:h-20'];
                      return (
                        <Card key={player.id} className={`${positions[index]} p-2 md:p-4 text-center border-2 ${player.rank === 1 ? 'border-primary racing-shadow' : 'border-border'}`}>
                          <div className={`${heights[index]} flex flex-col items-center justify-end mb-2 md:mb-3`}>
                            <div className="mb-1">{getRankIcon(player.rank)}</div>
                            <Avatar className="w-8 h-8 md:w-12 md:h-12 border-2 border-primary">
                              <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                                {getInitials(player.profile?.display_name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <h4 className="font-bold text-xs md:text-sm mb-1 truncate">
                            {player.profile?.username || 'Racing Driver'}
                          </h4>
                          <div className="text-sm md:text-lg font-bold text-primary">{player.total_points}</div>
                          <div className="text-xs text-muted-foreground">pts</div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Full Individual Rankings */}
              <Card className="border-2 max-h-[500px] overflow-y-auto">
                <div className="divide-y divide-border">
                  {displayStandings.map(player => (
                    <div key={player.id} className={`p-3 flex items-center justify-between hover:bg-muted/50 racing-transition ${player.isCurrentUser ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}>
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
                            {player.profile?.username || 'Racing Driver'}
                            {player.isCurrentUser && <Badge variant="secondary" className="text-xs px-1 py-0">You</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {player.profile?.display_name || 'No display name'}
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
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* League Leaderboard - only shown if user is in leagues */}
            {showLeagues && (
              <div>
                <div className="text-center mb-6 md:mb-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Users className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                    <h3 className="text-xl md:text-2xl font-bold">League Leaderboard</h3>
                  </div>
                </div>

                {/* Top 3 Leagues */}
                {leagueStandings.length >= 3 && (
                  <div className="mb-6 md:mb-8">
                    <div className="grid grid-cols-3 gap-1 md:gap-2">
                      {leagueStandings.slice(0, 3).map((league, index) => {
                        const positions = ['order-2', 'order-1', 'order-3'];
                        const heights = ['h-16 md:h-24', 'h-20 md:h-32', 'h-14 md:h-20'];
                        return (
                          <Card key={league.leagueId} className={`${positions[index]} p-2 md:p-4 text-center border-2 ${index === 0 ? 'border-accent racing-shadow' : 'border-border'}`}>
                            <div className={`${heights[index]} flex flex-col items-center justify-end mb-2 md:mb-3`}>
                              <div className="mb-1">{getRankIcon(index + 1)}</div>
                              <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center border-2 border-accent">
                                <Users className="h-4 w-4 md:h-6 md:w-6 text-accent" />
                              </div>
                            </div>
                            <h4 className="font-bold text-xs md:text-sm mb-1 truncate">{league.leagueName}</h4>
                            <div className="text-sm md:text-lg font-bold text-accent">{league.totalPoints}</div>
                            <div className="text-xs text-muted-foreground">pts</div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Full League Rankings */}
                <Card className="border-2 max-h-[500px] overflow-y-auto">
                  <div className="divide-y divide-border">
                    {leagueStandings.map((league, index) => (
                      <div key={league.leagueId} className="p-3 flex items-center justify-between hover:bg-muted/50 racing-transition">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 w-8">
                            <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                            {index < 3 && getRankIcon(index + 1)}
                          </div>
                          <div className="w-6 h-6 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center">
                            <Users className="h-3 w-3 text-accent" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs">{league.leagueName}</div>
                            <div className="text-xs text-muted-foreground">
                              {league.memberCount} member{league.memberCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <div className="text-xs text-muted-foreground">Avg</div>
                            <div className="text-sm font-medium text-accent">{Math.round(league.totalPoints / league.memberCount)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Total</div>
                            <div className="text-sm font-bold">{league.totalPoints}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
