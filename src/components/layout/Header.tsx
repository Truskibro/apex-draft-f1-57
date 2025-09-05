import React from 'react';
import { Link } from 'react-router-dom';
import { RacingButton } from '@/components/ui/racing-button';
import { Flag, Settings, LogOut, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useStandings } from '@/hooks/useStandings';

const Header = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { standings } = useStandings();
  
  const currentUserPoints = standings.find(s => s.isCurrentUser)?.total_points || 0;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Flag className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">F1 Fantasy</span>
              <span className="text-xs text-muted-foreground -mt-1">League</span>
            </div>
          </Link>
          
          {user && (
            <RacingButton variant="ghost" size="sm" asChild>
              <Link to="/my-leagues" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">My Leagues</span>
              </Link>
            </RacingButton>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
                <span className="text-xs text-muted-foreground">Signed in as:</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg border border-primary/20">
                <Trophy className="h-4 w-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Season Points</span>
                  <span className="text-sm font-bold text-primary">{currentUserPoints}</span>
                </div>
              </div>
              
              <RacingButton variant="metallic" size="sm">
                <Settings className="h-4 w-4" />
              </RacingButton>
              
              <RacingButton variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </RacingButton>
            </>
          ) : (
            <Link to="/auth">
              <RacingButton variant="racing" size="sm">
                Sign In
              </RacingButton>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;