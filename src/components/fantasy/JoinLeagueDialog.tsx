import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RacingButton } from '@/components/ui/racing-button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus } from 'lucide-react';

interface JoinLeagueDialogProps {
  children: React.ReactNode;
  onLeagueJoined?: () => void;
}

const JoinLeagueDialog = ({ children, onLeagueJoined }: JoinLeagueDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [leagueId, setLeagueId] = useState('');
  const [loading, setLoading] = useState(false);

  // Check authentication when opening dialog
  const handleDialogOpen = (newOpen: boolean) => {
    if (newOpen && !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to join a league',
        variant: 'destructive',
      });
      return;
    }
    setOpen(newOpen);
  };

  const joinLeague = async () => {
    if (!user || !leagueId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a league ID',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Check if league exists
      const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .select('id, name')
        .eq('id', leagueId.trim())
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

      // Check if already a member
      const { data: existingMembership, error: memberError } = await supabase
        .from('league_members')
        .select('id')
        .eq('league_id', leagueId.trim())
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberError) throw memberError;

      if (existingMembership) {
        toast({
          title: 'Already a Member',
          description: 'You are already a member of this league.',
          variant: 'destructive',
        });
        return;
      }

      // Join the league
      const { error: joinError } = await supabase
        .from('league_members')
        .insert({
          league_id: leagueId.trim(),
          user_id: user.id,
          role: 'member'
        });

      if (joinError) throw joinError;

      toast({
        title: 'Success!',
        description: `Successfully joined "${league.name}".`,
      });

      setOpen(false);
      setLeagueId('');
      onLeagueJoined?.();
    } catch (error) {
      console.error('Error joining league:', error);
      toast({
        title: 'Error',
        description: 'Failed to join league. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Join a League
          </DialogTitle>
          <DialogDescription>
            Enter the league ID to join an existing league
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="league-id">League ID</Label>
            <Input
              id="league-id"
              placeholder="Enter the league ID..."
              value={leagueId}
              onChange={(e) => setLeagueId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && joinLeague()}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <RacingButton 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </RacingButton>
            <RacingButton
              onClick={joinLeague}
              disabled={loading || !leagueId.trim()}
            >
              {loading ? 'Joining...' : 'Join League'}
            </RacingButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinLeagueDialog;