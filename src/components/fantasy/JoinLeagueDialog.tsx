import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RacingButton } from '@/components/ui/racing-button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Globe, 
  Lock, 
  Search,
  UserPlus,
  Calendar
} from 'lucide-react';

interface League {
  id: string;
  name: string;
  description: string | null;
  visibility: 'public' | 'private';
  owner_id: string;
  created_at: string;
  member_count: number;
  owner_display_name: string | null;
}

interface JoinLeagueDialogProps {
  children: React.ReactNode;
  onLeagueJoined?: () => void;
}

const JoinLeagueDialog = ({ children, onLeagueJoined }: JoinLeagueDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [leagueId, setLeagueId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [publicLeagues, setPublicLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  const searchPublicLeagues = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select(`
          id,
          name,
          description,
          visibility,
          owner_id,
          created_at,
          profiles!leagues_owner_id_fkey (
            display_name
          )
        `)
        .eq('visibility', 'public')
        .ilike('name', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      // Get member counts
      const leagueIds = data?.map(l => l.id) || [];
      const { data: memberCounts, error: countError } = await supabase
        .from('league_members')
        .select('league_id')
        .in('league_id', leagueIds);

      if (countError) throw countError;

      const processedLeagues = data?.map(league => ({
        ...league,
        member_count: memberCounts?.filter(count => count.league_id === league.id).length || 0,
        owner_display_name: (league.profiles as any)?.display_name || null
      })) || [];

      setPublicLeagues(processedLeagues as League[]);
    } catch (error) {
      console.error('Error searching leagues:', error);
      toast({
        title: 'Error',
        description: 'Failed to search leagues. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const joinLeagueById = async (targetLeagueId: string) => {
    if (!user) return;

    setJoining(targetLeagueId);
    try {
      // First check if the league exists and user isn't already a member
      const { data: existingMembership, error: checkError } = await supabase
        .from('league_members')
        .select('id')
        .eq('league_id', targetLeagueId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingMembership) {
        toast({
          title: 'Already a Member',
          description: 'You are already a member of this league.',
          variant: 'destructive',
        });
        return;
      }

      // Check if league exists
      const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .select('id, name, visibility')
        .eq('id', targetLeagueId)
        .maybeSingle();

      if (leagueError) throw leagueError;

      if (!league) {
        toast({
          title: 'League Not Found',
          description: 'No league found with this ID.',
          variant: 'destructive',
        });
        return;
      }

      // Join the league
      const { error: joinError } = await supabase
        .from('league_members')
        .insert({
          league_id: targetLeagueId,
          user_id: user.id,
          role: 'member'
        });

      if (joinError) throw joinError;

      toast({
        title: 'Joined League!',
        description: `Successfully joined "${league.name}".`,
      });

      setOpen(false);
      setLeagueId('');
      setSearchQuery('');
      setPublicLeagues([]);
      onLeagueJoined?.();
    } catch (error) {
      console.error('Error joining league:', error);
      toast({
        title: 'Error',
        description: 'Failed to join league. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setJoining(null);
    }
  };

  const handleJoinByCode = async () => {
    if (!leagueId.trim()) {
      toast({
        title: 'League ID Required',
        description: 'Please enter a league ID.',
        variant: 'destructive',
      });
      return;
    }

    await joinLeagueById(leagueId.trim());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Join a League
          </DialogTitle>
          <DialogDescription>
            Join an existing F1 fantasy league by ID or search for public leagues
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search Public Leagues</TabsTrigger>
            <TabsTrigger value="code">Join by League ID</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search League Name</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Enter league name to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchPublicLeagues()}
                />
                <RacingButton 
                  onClick={searchPublicLeagues}
                  disabled={searching || !searchQuery.trim()}
                >
                  <Search className="h-4 w-4" />
                </RacingButton>
              </div>
            </div>

            {publicLeagues.length > 0 && (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {publicLeagues.map((league) => (
                  <Card key={league.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{league.name}</h4>
                          <Badge variant="outline">
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {league.description || 'No description provided'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {league.member_count} members
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(league.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <RacingButton
                        size="sm"
                        onClick={() => joinLeagueById(league.id)}
                        disabled={joining === league.id}
                      >
                        {joining === league.id ? 'Joining...' : 'Join'}
                      </RacingButton>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {searching && (
              <div className="text-center py-8 text-muted-foreground">
                Searching leagues...
              </div>
            )}
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="league-id">League ID</Label>
              <Input
                id="league-id"
                placeholder="Enter the league ID or code..."
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Get the league ID from the league owner or invitation link
              </p>
            </div>

            <RacingButton
              onClick={handleJoinByCode}
              disabled={loading || !leagueId.trim()}
              className="w-full"
            >
              {loading ? 'Joining...' : 'Join League'}
            </RacingButton>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default JoinLeagueDialog;