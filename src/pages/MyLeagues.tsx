import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { RacingButton } from '@/components/ui/racing-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import JoinLeagueDialog from '@/components/fantasy/JoinLeagueDialog';
import { 
  Trophy, 
  Users, 
  Globe, 
  Lock, 
  Plus,
  Calendar,
  Crown,
  User,
  Trash2,
  UserPlus
} from 'lucide-react';

interface League {
  id: string;
  name: string;
  description: string | null;
  visibility: 'public' | 'private';
  owner_id: string;
  created_at: string;
  member_count: number;
  user_role: 'owner' | 'member';
}

const MyLeagues = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyLeagues();
    }
  }, [user]);

  const fetchMyLeagues = async () => {
    if (!user) return;

    try {
      // Fetch leagues where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('league_members')
        .select(`
          role,
          leagues (
            id,
            name,
            description,
            visibility,
            owner_id,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      // Get member counts for each league
      const leagueIds = memberData?.map(m => m.leagues.id) || [];
      const { data: memberCounts, error: countError } = await supabase
        .from('league_members')
        .select('league_id')
        .in('league_id', leagueIds);

      if (countError) throw countError;

      // Process the data
      const processedLeagues = memberData?.map(member => ({
        ...member.leagues,
        user_role: member.role as 'owner' | 'member',
        member_count: memberCounts?.filter(count => count.league_id === member.leagues.id).length || 0
      })) || [];

      setLeagues(processedLeagues as League[]);
    } catch (error) {
      console.error('Error fetching leagues:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your leagues',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteLeague = async (leagueId: string, leagueName: string) => {
    try {
      const { error } = await supabase
        .from('leagues')
        .delete()
        .eq('id', leagueId);

      if (error) throw error;

      setLeagues(leagues.filter(league => league.id !== leagueId));
      toast({
        title: 'League Deleted',
        description: `"${leagueName}" has been successfully deleted.`,
      });
    } catch (error) {
      console.error('Error deleting league:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete league. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to view your leagues
            </p>
            <Link to="/auth">
              <RacingButton>Sign In</RacingButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Leagues</h1>
            <p className="text-xl text-muted-foreground">
              Manage and view all your F1 fantasy leagues
            </p>
          </div>
          <div className="flex gap-3">
            <JoinLeagueDialog onLeagueJoined={fetchMyLeagues}>
              <RacingButton variant="outline" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Join League
              </RacingButton>
            </JoinLeagueDialog>
            <RacingButton asChild>
              <Link to="/create-league" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create League
              </Link>
            </RacingButton>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading your leagues...</div>
          </div>
        ) : leagues.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Leagues Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't joined any leagues yet. Create your first league or join an existing one!
              </p>
              <div className="flex gap-4 justify-center">
                <RacingButton asChild>
                  <Link to="/create-league">Create League</Link>
                </RacingButton>
                <JoinLeagueDialog onLeagueJoined={fetchMyLeagues}>
                  <RacingButton variant="outline">
                    Join League
                  </RacingButton>
                </JoinLeagueDialog>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => (
              <Card key={league.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{league.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={league.visibility === 'public' ? 'default' : 'secondary'}>
                          {league.visibility === 'public' ? (
                            <><Globe className="h-3 w-3 mr-1" />Public</>
                          ) : (
                            <><Lock className="h-3 w-3 mr-1" />Private</>
                          )}
                        </Badge>
                        <Badge variant={league.user_role === 'owner' ? 'default' : 'outline'}>
                          {league.user_role === 'owner' ? (
                            <><Crown className="h-3 w-3 mr-1" />Owner</>
                          ) : (
                            <><User className="h-3 w-3 mr-1" />Member</>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {league.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {league.member_count} member{league.member_count !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(league.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <RacingButton variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/league/${league.id}`}>
                        View League
                      </Link>
                    </RacingButton>
                    {league.user_role === 'owner' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <RacingButton variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </RacingButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete League</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{league.name}"? This action cannot be undone and will remove all league data including member information and predictions.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteLeague(league.id, league.name)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete League
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyLeagues;